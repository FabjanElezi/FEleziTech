import { createHash } from 'crypto';
import { query } from './db';

/**
 * Lockout for the admin login.
 *
 * The counter lives in the database on purpose: serverless functions do not
 * share memory, so an in-memory limit would reset every time a new instance
 * started and would stop nothing.
 *
 * Nothing identifying is kept — the key is a salted hash of the address, and
 * the row is deleted the moment a correct password arrives.
 */

let ready = false;

async function ensureTable() {
  if (ready) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        key           TEXT PRIMARY KEY,
        failures      INTEGER     NOT NULL DEFAULT 0,
        strikes       INTEGER     NOT NULL DEFAULT 0,
        window_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
        blocked_until TIMESTAMPTZ
      )
    `);
  } catch { /* fall through; a failure here must not block signing in */ }
  ready = true;
}

/** Stable, salted, not reversible. Only ever used as a lookup key. */
export function limitKey(ip: string) {
  const secret = process.env.JWT_SECRET ?? 'rate-salt';
  return createHash('sha256').update(`rl|${ip}|${secret}`).digest('hex').slice(0, 32);
}

const MAX_FAILURES = 8;        // within the window before the door shuts
const WINDOW_MINUTES = 10;
// A mistyped password costs a minute. A machine grinding away pays much more.
const BLOCK_SECONDS = [60, 300, 1800, 7200];

export type LimitState = { blocked: boolean; retryAfter: number };

/** Is this address currently locked out? */
export async function checkLogin(key: string): Promise<LimitState> {
  await ensureTable();
  try {
    const { rows } = await query(
      `SELECT extract(epoch FROM (blocked_until - now())) AS left
         FROM login_attempts WHERE key = $1 AND blocked_until > now()`,
      [key]
    );
    const left = rows[0]?.left;
    if (left != null) return { blocked: true, retryAfter: Math.max(1, Math.ceil(Number(left))) };
  } catch { /* never lock the owner out because of a database hiccup */ }
  return { blocked: false, retryAfter: 0 };
}

/** Record a wrong password, and shut the door once there have been enough. */
export async function noteFailure(key: string): Promise<LimitState> {
  await ensureTable();
  try {
    const { rows } = await query(
      `INSERT INTO login_attempts (key, failures, window_start)
            VALUES ($1, 1, now())
       ON CONFLICT (key) DO UPDATE SET
         failures = CASE
           WHEN login_attempts.window_start < now() - ($2 || ' minutes')::interval THEN 1
           ELSE login_attempts.failures + 1 END,
         window_start = CASE
           WHEN login_attempts.window_start < now() - ($2 || ' minutes')::interval THEN now()
           ELSE login_attempts.window_start END
       RETURNING failures, strikes`,
      [key, String(WINDOW_MINUTES)]
    );

    const failures = Number(rows[0]?.failures ?? 0);
    if (failures < MAX_FAILURES) return { blocked: false, retryAfter: 0 };

    const strikes = Number(rows[0]?.strikes ?? 0);
    const seconds = BLOCK_SECONDS[Math.min(strikes, BLOCK_SECONDS.length - 1)];
    await query(
      `UPDATE login_attempts
          SET blocked_until = now() + ($2 || ' seconds')::interval,
              strikes = strikes + 1,
              failures = 0,
              window_start = now()
        WHERE key = $1`,
      [key, String(seconds)]
    );
    return { blocked: true, retryAfter: seconds };
  } catch {
    return { blocked: false, retryAfter: 0 };
  }
}

/** The right password clears everything for that address. */
export async function clearLogin(key: string) {
  try { await query('DELETE FROM login_attempts WHERE key = $1', [key]); } catch { /* ignore */ }
}

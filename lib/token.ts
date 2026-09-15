import { createHmac, timingSafeEqual } from 'crypto';

// Resolved lazily so a missing secret fails at login time (clear error) rather
// than falling back to a guessable default that would let anyone forge a session.
function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error('JWT_SECRET is not set (or is shorter than 16 characters); admin login is disabled.');
  }
  return s;
}

export function createToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + 7 * 86_400_000 })).toString('base64url');
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): string | null {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let expected: string;
  try { expected = createHmac('sha256', secret()).update(payload).digest('base64url'); }
  catch { return null; }
  try {
    if (!timingSafeEqual(Buffer.from(sig, 'base64url'), Buffer.from(expected, 'base64url'))) return null;
  } catch { return null; }
  try {
    const { email, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (exp < Date.now()) return null;
    return email as string;
  } catch { return null; }
}

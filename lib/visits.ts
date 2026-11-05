import { createHash } from 'crypto';
import { query } from './db';

// Visit tracking that deliberately stores no raw IP address.
// Each visitor is identified by a salted hash of IP + user agent that is rotated
// daily, so counts are accurate per day but nobody (including us) can turn a row
// back into a person or follow someone across days. Keeps the site free of
// cookies and out of consent-banner territory.

let ready = false;

export async function ensureVisitsTable() {
  if (ready) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS visits (
        id           BIGSERIAL PRIMARY KEY,
        ts           TIMESTAMPTZ NOT NULL DEFAULT now(),
        path         TEXT        NOT NULL,
        referrer     TEXT,
        country      TEXT,
        city         TEXT,
        device       TEXT,
        browser      TEXT,
        visitor_hash TEXT        NOT NULL
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS visits_ts_idx ON visits (ts DESC)');
    await query('CREATE INDEX IF NOT EXISTS visits_visitor_idx ON visits (visitor_hash)');
    ready = true;
  } catch {
    ready = true; // never let tracking break a page render
  }
}

/** Daily-rotating pseudonymous id. Not reversible, not stable across days. */
export function visitorHash(ip: string, userAgent: string) {
  const day = new Date().toISOString().slice(0, 10);
  const secret = process.env.JWT_SECRET ?? 'visit-salt';
  return createHash('sha256').update(`${ip}|${userAgent}|${day}|${secret}`).digest('hex').slice(0, 32);
}

const BOT = /bot|crawler|spider|crawling|slurp|bingpreview|headless|lighthouse|pingdom|curl|wget|python-requests|node-fetch|axios|monitor|preview/i;

export function isBot(userAgent: string) {
  return !userAgent || BOT.test(userAgent);
}

export function parseAgent(ua: string) {
  const device = /iPad|Tablet/i.test(ua) ? 'Tablet'
    : /Mobi|Android|iPhone/i.test(ua) ? 'Phone'
    : 'Desktop';
  const browser = /Edg\//i.test(ua) ? 'Edge'
    : /OPR\/|Opera/i.test(ua) ? 'Opera'
    : /Chrome\//i.test(ua) ? 'Chrome'
    : /Safari\//i.test(ua) ? 'Safari'
    : /Firefox\//i.test(ua) ? 'Firefox'
    : 'Other';
  return { device, browser };
}

/** Referrers are reduced to a hostname; query strings are dropped. */
export function referrerHost(raw: string | undefined | null) {
  if (!raw) return null;
  try {
    const h = new URL(raw).hostname.replace(/^www\./, '');
    return h || null;
  } catch {
    return null;
  }
}

export async function recordVisit(v: {
  path: string;
  referrer: string | null;
  country: string | null;
  city: string | null;
  device: string;
  browser: string;
  visitorHash: string;
}) {
  await ensureVisitsTable();
  await query(
    `INSERT INTO visits (path, referrer, country, city, device, browser, visitor_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [v.path.slice(0, 200), v.referrer, v.country, v.city, v.device, v.browser, v.visitorHash]
  );
  // Occasional cleanup: keep half a year, no more.
  if (Math.random() < 0.02) {
    try { await query(`DELETE FROM visits WHERE ts < now() - interval '180 days'`); } catch {}
  }
}

export type VisitStats = Awaited<ReturnType<typeof getVisitStats>>;

export async function getVisitStats() {
  await ensureVisitsTable();
  const n = (v: unknown) => Number(v ?? 0);

  const [totals, daily, paths, refs, countries, devices, recent] = await Promise.all([
    query(`
      SELECT
        count(*)                                                          AS views,
        count(DISTINCT visitor_hash)                                      AS visitors,
        count(*) FILTER (WHERE ts > now() - interval '24 hours')          AS views_24h,
        count(DISTINCT visitor_hash) FILTER (WHERE ts > now() - interval '24 hours') AS visitors_24h,
        count(*) FILTER (WHERE ts > now() - interval '7 days')            AS views_7d,
        count(DISTINCT visitor_hash) FILTER (WHERE ts > now() - interval '7 days')   AS visitors_7d
      FROM visits
    `),
    query(`
      SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
             count(v.id)                   AS views,
             count(DISTINCT v.visitor_hash) AS visitors
      FROM generate_series(current_date - interval '13 days', current_date, interval '1 day') AS d(day)
      LEFT JOIN visits v ON v.ts >= d.day AND v.ts < d.day + interval '1 day'
      GROUP BY d.day ORDER BY d.day
    `),
    query(`SELECT path, count(*) AS views FROM visits GROUP BY path ORDER BY views DESC LIMIT 8`),
    query(`SELECT coalesce(referrer, 'direct') AS referrer, count(*) AS views
           FROM visits GROUP BY 1 ORDER BY views DESC LIMIT 8`),
    query(`SELECT coalesce(country, '??') AS country, count(*) AS views,
                  count(DISTINCT visitor_hash) AS visitors
           FROM visits GROUP BY 1 ORDER BY views DESC LIMIT 10`),
    query(`SELECT coalesce(device, 'Unknown') AS device, count(*) AS views
           FROM visits GROUP BY 1 ORDER BY views DESC`),
    query(`SELECT to_char(ts, 'YYYY-MM-DD HH24:MI') AS at, path, country, city, device, browser,
                  coalesce(referrer, 'direct') AS referrer
           FROM visits ORDER BY ts DESC LIMIT 25`),
  ]);

  const t = totals.rows[0] ?? {};
  return {
    totals: {
      views: n(t.views), visitors: n(t.visitors),
      views24h: n(t.views_24h), visitors24h: n(t.visitors_24h),
      views7d: n(t.views_7d), visitors7d: n(t.visitors_7d),
    },
    daily: daily.rows.map((r) => ({ day: String(r.day), views: n(r.views), visitors: n(r.visitors) })),
    paths: paths.rows.map((r) => ({ path: String(r.path), views: n(r.views) })),
    referrers: refs.rows.map((r) => ({ referrer: String(r.referrer), views: n(r.views) })),
    countries: countries.rows.map((r) => ({ country: String(r.country), views: n(r.views), visitors: n(r.visitors) })),
    devices: devices.rows.map((r) => ({ device: String(r.device), views: n(r.views) })),
    recent: recent.rows.map((r) => ({
      at: String(r.at), path: String(r.path),
      country: r.country ? String(r.country) : null,
      city: r.city ? String(r.city) : null,
      device: String(r.device ?? ''), browser: String(r.browser ?? ''),
      referrer: String(r.referrer),
    })),
  };
}

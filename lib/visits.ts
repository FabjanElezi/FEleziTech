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
    // Added later: campaign tag, full referring page and region.
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS ref_tag      TEXT`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS referrer_url TEXT`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS region       TEXT`);
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

/** Friendly name for a referring host, so the panel reads like a sentence. */
const SOURCE_NAMES: [RegExp, string][] = [
  [/linkedin|lnkd\.in/i, 'LinkedIn'],
  [/xing/i, 'XING'],
  [/google/i, 'Google search'],
  [/bing/i, 'Bing search'],
  [/duckduckgo/i, 'DuckDuckGo'],
  [/ecosia/i, 'Ecosia'],
  [/github/i, 'GitHub'],
  [/indeed/i, 'Indeed'],
  [/stepstone/i, 'StepStone'],
  [/mail\.|outlook|gmail|proton/i, 'Email'],
  [/instagram/i, 'Instagram'],
  [/facebook|fb\./i, 'Facebook'],
  [/whatsapp/i, 'WhatsApp'],
  [/t\.co|twitter|x\.com/i, 'X / Twitter'],
];

export function friendlySource(host: string | null) {
  if (!host) return 'Direct / typed in';
  for (const [re, name] of SOURCE_NAMES) if (re.test(host)) return name;
  return host;
}

/** Hostname only, for grouping. */
export function referrerHost(raw: string | undefined | null) {
  if (!raw) return null;
  try {
    const h = new URL(raw).hostname.replace(/^www\./, '');
    return h || null;
  } catch {
    return null;
  }
}

/** Full referring page without the query string (which can carry personal data). */
export function referrerUrl(raw: string | undefined | null) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return `${u.hostname.replace(/^www\./, '')}${u.pathname === '/' ? '' : u.pathname}`.slice(0, 200);
  } catch {
    return null;
  }
}

/** Campaign tag from ?ref= / ?utm_source=, trimmed to something safe to store. */
export function cleanTag(raw: unknown) {
  if (typeof raw !== 'string') return null;
  const t = raw.trim().toLowerCase().replace(/[^a-z0-9 _.-]/g, '').slice(0, 40);
  return t || null;
}

export async function recordVisit(v: {
  path: string;
  referrer: string | null;
  referrerUrl: string | null;
  refTag: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  device: string;
  browser: string;
  visitorHash: string;
}) {
  await ensureVisitsTable();
  await query(
    `INSERT INTO visits (path, referrer, referrer_url, ref_tag, country, region, city, device, browser, visitor_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [v.path.slice(0, 200), v.referrer, v.referrerUrl, v.refTag, v.country, v.region, v.city,
     v.device, v.browser, v.visitorHash]
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

  const [totals, daily, paths, refs, tags, places, devices, recent] = await Promise.all([
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
    query(`SELECT referrer, count(*) AS views, count(DISTINCT visitor_hash) AS visitors
           FROM visits GROUP BY 1 ORDER BY views DESC LIMIT 10`),
    query(`SELECT ref_tag, count(*) AS views, count(DISTINCT visitor_hash) AS visitors,
                  to_char(max(ts), 'YYYY-MM-DD HH24:MI') AS last_seen
           FROM visits WHERE ref_tag IS NOT NULL
           GROUP BY 1 ORDER BY views DESC LIMIT 15`),
    query(`SELECT coalesce(country, '??') AS country, city, region,
                  count(*) AS views, count(DISTINCT visitor_hash) AS visitors
           FROM visits GROUP BY 1,2,3 ORDER BY views DESC LIMIT 12`),
    query(`SELECT coalesce(device, 'Unknown') AS device, count(*) AS views
           FROM visits GROUP BY 1 ORDER BY views DESC`),
    query(`SELECT to_char(ts, 'YYYY-MM-DD HH24:MI') AS at, path, country, region, city, device, browser,
                  referrer, referrer_url, ref_tag
           FROM visits ORDER BY ts DESC LIMIT 30`),
  ]);

  const t = totals.rows[0] ?? {};
  const str = (v: unknown) => (v == null ? null : String(v));

  return {
    totals: {
      views: n(t.views), visitors: n(t.visitors),
      views24h: n(t.views_24h), visitors24h: n(t.visitors_24h),
      views7d: n(t.views_7d), visitors7d: n(t.visitors_7d),
    },
    daily: daily.rows.map((r) => ({ day: String(r.day), views: n(r.views), visitors: n(r.visitors) })),
    paths: paths.rows.map((r) => ({ path: String(r.path), views: n(r.views) })),
    sources: refs.rows.map((r) => ({
      host: str(r.referrer),
      label: friendlySource(str(r.referrer)),
      views: n(r.views),
      visitors: n(r.visitors),
    })),
    tags: tags.rows.map((r) => ({
      tag: String(r.ref_tag), views: n(r.views), visitors: n(r.visitors), lastSeen: String(r.last_seen),
    })),
    places: places.rows.map((r) => ({
      country: String(r.country), city: str(r.city), region: str(r.region),
      views: n(r.views), visitors: n(r.visitors),
    })),
    devices: devices.rows.map((r) => ({ device: String(r.device), views: n(r.views) })),
    recent: recent.rows.map((r) => ({
      at: String(r.at), path: String(r.path),
      country: str(r.country), region: str(r.region), city: str(r.city),
      device: String(r.device ?? ''), browser: String(r.browser ?? ''),
      source: friendlySource(str(r.referrer)),
      referrerUrl: str(r.referrer_url),
      tag: str(r.ref_tag),
    })),
  };
}

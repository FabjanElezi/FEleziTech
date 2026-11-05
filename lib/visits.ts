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
    // Added later still: the fuller technical profile and the engagement signals.
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS view_id    TEXT`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS os         TEXT`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS screen     TEXT`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS viewport   TEXT`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS lang       TEXT`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS tz         TEXT`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS coords     TEXT`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS hardware   TEXT`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS connection TEXT`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS dwell_s    INTEGER`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS scroll_pct INTEGER`);
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS actions    TEXT`);
    await query('CREATE INDEX IF NOT EXISTS visits_ts_idx ON visits (ts DESC)');
    await query('CREATE INDEX IF NOT EXISTS visits_visitor_idx ON visits (visitor_hash)');
    await query('CREATE INDEX IF NOT EXISTS visits_view_idx ON visits (view_id)');
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

const ver = (re: RegExp, ua: string) => {
  const m = ua.match(re);
  return m ? m[1].replace(/_/g, '.') : '';
};

/** Device, browser (with major version) and operating system, from the user agent. */
export function parseAgent(ua: string) {
  const device = /iPad|Tablet/i.test(ua) ? 'Tablet'
    : /Mobi|Android|iPhone/i.test(ua) ? 'Phone'
    : 'Desktop';

  const name = /Edg\//i.test(ua) ? 'Edge'
    : /OPR\/|Opera/i.test(ua) ? 'Opera'
    : /CriOS|Chrome\//i.test(ua) ? 'Chrome'
    : /FxiOS|Firefox\//i.test(ua) ? 'Firefox'
    : /Safari\//i.test(ua) ? 'Safari'
    : 'Other';
  const major = ver(/(?:Edg|OPR|CriOS|Chrome|FxiOS|Firefox|Version)\/(\d+)/, ua);
  const browser = major ? `${name} ${major}` : name;

  const os = /Windows NT 10/.test(ua) ? 'Windows 10/11'
    : /Windows NT 6\.3/.test(ua) ? 'Windows 8.1'
    : /Windows/.test(ua) ? 'Windows'
    : /iPhone|iPad|iPod/.test(ua) ? `iOS ${ver(/OS (\d+[_.]\d+)/, ua)}`.trim()
    : /Mac OS X/.test(ua) ? `macOS ${ver(/Mac OS X (\d+[_.]\d+)/, ua)}`.trim()
    : /Android/.test(ua) ? `Android ${ver(/Android (\d+)/, ua)}`.trim()
    : /CrOS/.test(ua) ? 'ChromeOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Unknown';

  return { device, browser, os };
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

/** Short free-text field from the browser, kept to a sane length. */
export function clean(raw: unknown, max = 60) {
  if (typeof raw !== 'string') return null;
  const t = raw.trim().replace(/[\u0000-\u001f]/g, '').slice(0, max);
  return t || null;
}

/** City-level coordinates, rounded so they stay city-level. */
export function coords(lat: string | null, lon: string | null) {
  const a = Number(lat), b = Number(lon);
  if (!lat || !lon || Number.isNaN(a) || Number.isNaN(b)) return null;
  return `${a.toFixed(2)},${b.toFixed(2)}`;
}

/** Primary language from an Accept-Language header or navigator.language. */
export function primaryLang(raw: string | null | undefined) {
  if (!raw) return null;
  const first = raw.split(',')[0].split(';')[0].trim();
  return /^[a-zA-Z-]{2,10}$/.test(first) ? first : null;
}

export type VisitInput = {
  viewId: string | null;
  path: string;
  referrer: string | null;
  referrerUrl: string | null;
  refTag: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  coords: string | null;
  tz: string | null;
  lang: string | null;
  device: string;
  browser: string;
  os: string;
  screen: string | null;
  viewport: string | null;
  hardware: string | null;
  connection: string | null;
  visitorHash: string;
};

export async function recordVisit(v: VisitInput) {
  await ensureVisitsTable();
  await query(
    `INSERT INTO visits
       (view_id, path, referrer, referrer_url, ref_tag, country, region, city, coords, tz, lang,
        device, browser, os, screen, viewport, hardware, connection, visitor_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
    [v.viewId, v.path.slice(0, 200), v.referrer, v.referrerUrl, v.refTag, v.country, v.region, v.city,
     v.coords, v.tz, v.lang, v.device, v.browser, v.os, v.screen, v.viewport, v.hardware,
     v.connection, v.visitorHash]
  );
  // Occasional cleanup: keep half a year, no more.
  if (Math.random() < 0.02) {
    try { await query(`DELETE FROM visits WHERE ts < now() - interval '180 days'`); } catch {}
  }
}

/** Second ping, when the visitor leaves: how long they stayed and what they did. */
export async function recordEngagement(viewId: string, dwell: number, scroll: number, actions: string | null) {
  await ensureVisitsTable();
  await query(
    `UPDATE visits
        SET dwell_s    = greatest(coalesce(dwell_s, 0), $2),
            scroll_pct = greatest(coalesce(scroll_pct, 0), $3),
            actions    = coalesce(nullif($4, ''), actions)
      WHERE view_id = $1 AND ts > now() - interval '6 hours'`,
    [viewId, Math.min(Math.max(0, Math.round(dwell)), 7200), Math.min(Math.max(0, Math.round(scroll)), 100), actions]
  );
}

export type VisitStats = Awaited<ReturnType<typeof getVisitStats>>;

export async function getVisitStats() {
  await ensureVisitsTable();
  const n = (v: unknown) => Number(v ?? 0);

  const [totals, daily, paths, refs, tags, places, systems, langs, clicks, recent] = await Promise.all([
    query(`
      SELECT
        count(*)                                                          AS views,
        count(DISTINCT visitor_hash)                                      AS visitors,
        count(*) FILTER (WHERE ts > now() - interval '24 hours')          AS views_24h,
        count(DISTINCT visitor_hash) FILTER (WHERE ts > now() - interval '24 hours') AS visitors_24h,
        count(*) FILTER (WHERE ts > now() - interval '7 days')            AS views_7d,
        count(DISTINCT visitor_hash) FILTER (WHERE ts > now() - interval '7 days')   AS visitors_7d,
        coalesce(round(avg(dwell_s)    FILTER (WHERE dwell_s    > 0)), 0) AS avg_dwell,
        coalesce(round(avg(scroll_pct) FILTER (WHERE scroll_pct > 0)), 0) AS avg_scroll
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
    query(`SELECT coalesce(device, 'Unknown') AS device, coalesce(os, 'Unknown') AS os,
                  count(*) AS views
           FROM visits GROUP BY 1,2 ORDER BY views DESC LIMIT 10`),
    query(`SELECT lang, count(*) AS views FROM visits
           WHERE lang IS NOT NULL GROUP BY 1 ORDER BY views DESC LIMIT 8`),
    query(`SELECT trim(a) AS action, count(*) AS views
           FROM visits, unnest(string_to_array(actions, '|')) AS a
           WHERE actions IS NOT NULL AND actions <> ''
           GROUP BY 1 ORDER BY views DESC LIMIT 10`),
    query(`SELECT to_char(ts, 'YYYY-MM-DD HH24:MI') AS at, path, country, region, city, coords, tz, lang,
                  device, browser, os, screen, viewport, hardware, connection,
                  referrer, referrer_url, ref_tag, dwell_s, scroll_pct, actions
           FROM visits ORDER BY ts DESC LIMIT 30`),
  ]);

  const t = totals.rows[0] ?? {};
  const str = (v: unknown) => (v == null ? null : String(v));

  return {
    totals: {
      views: n(t.views), visitors: n(t.visitors),
      views24h: n(t.views_24h), visitors24h: n(t.visitors_24h),
      views7d: n(t.views_7d), visitors7d: n(t.visitors_7d),
      avgDwell: n(t.avg_dwell), avgScroll: n(t.avg_scroll),
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
    systems: systems.rows.map((r) => ({ device: String(r.device), os: String(r.os), views: n(r.views) })),
    languages: langs.rows.map((r) => ({ lang: String(r.lang), views: n(r.views) })),
    clicks: clicks.rows.map((r) => ({ action: String(r.action), views: n(r.views) })),
    recent: recent.rows.map((r) => ({
      at: String(r.at), path: String(r.path),
      country: str(r.country), region: str(r.region), city: str(r.city),
      coords: str(r.coords), tz: str(r.tz), lang: str(r.lang),
      device: String(r.device ?? ''), browser: String(r.browser ?? ''), os: str(r.os),
      screen: str(r.screen), viewport: str(r.viewport),
      hardware: str(r.hardware), connection: str(r.connection),
      source: friendlySource(str(r.referrer)),
      referrerUrl: str(r.referrer_url),
      tag: str(r.ref_tag),
      dwell: r.dwell_s == null ? null : n(r.dwell_s),
      scroll: r.scroll_pct == null ? null : n(r.scroll_pct),
      actions: str(r.actions),
    })),
  };
}

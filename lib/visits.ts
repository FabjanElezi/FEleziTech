import { createHash } from 'crypto';
import { query } from './db';
import { dataCentre } from './datacenter';

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
    // Why the visit looks automated (crawler, data centre, ...); NULL for a person.
    await query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS bot_reason TEXT`);
    await query('CREATE INDEX IF NOT EXISTS visits_ts_idx ON visits (ts DESC)');
    await query('CREATE INDEX IF NOT EXISTS visits_visitor_idx ON visits (visitor_hash)');
    await query('CREATE INDEX IF NOT EXISTS visits_view_idx ON visits (view_id)');
    ready = true;
  } catch {
    ready = true; // never let tracking break a page render
  }
}

let cvReady = false;

export async function ensureCvTable() {
  if (cvReady) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS cv_opens (
        id           BIGSERIAL PRIMARY KEY,
        ts           TIMESTAMPTZ NOT NULL DEFAULT now(),
        country      TEXT,
        region       TEXT,
        city         TEXT,
        ref_tag      TEXT,
        device       TEXT,
        browser      TEXT,
        os           TEXT,
        visitor_hash TEXT NOT NULL
      )
    `);
    await query(`ALTER TABLE cv_opens ADD COLUMN IF NOT EXISTS bot_reason TEXT`);
    await query('CREATE INDEX IF NOT EXISTS cv_opens_ts_idx ON cv_opens (ts DESC)');
    cvReady = true;
  } catch {
    cvReady = true;
  }
}

/** Someone opened the CV. Recorded server-side, so direct links count too. */
export async function recordCvOpen(v: {
  country: string | null; region: string | null; city: string | null;
  refTag: string | null; device: string; browser: string; os: string; visitorHash: string;
  botReason: string | null;
}) {
  await ensureCvTable();
  await query(
    `INSERT INTO cv_opens (country, region, city, ref_tag, device, browser, os, visitor_hash, bot_reason)
     SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9
      WHERE (SELECT count(*) FROM cv_opens
              WHERE visitor_hash = $8 AND ts > now() - interval '1 hour') < 40`,
    [v.country, v.region, v.city, v.refTag, v.device, v.browser, v.os, v.visitorHash, v.botReason]
  );
}

/** The ?ref= tag of the page the CV was opened from. */
export function tagFromReferer(referer: string | null) {
  if (!referer) return null;
  try {
    const q = new URL(referer).searchParams;
    return cleanTag(q.get('ref') ?? q.get('utm_source') ?? q.get('utm_campaign'));
  } catch {
    return null;
  }
}

/** Daily-rotating pseudonymous id. Not reversible, not stable across days. */
export function visitorHash(ip: string, userAgent: string) {
  const day = new Date().toISOString().slice(0, 10);
  const secret = process.env.JWT_SECRET ?? 'visit-salt';
  return createHash('sha256').update(`${ip}|${userAgent}|${day}|${secret}`).digest('hex').slice(0, 32);
}

// ── Bots ─────────────────────────────────────────────────────
// Bots are recorded but marked, so the panel can hide them by default and
// still show them on request.

/** Crawlers and link previews that say who they are. First match wins. */
const CRAWLERS: [RegExp, string][] = [
  [/facebookexternalhit|facebookcatalog|meta-external/i, 'Meta link preview'],
  [/googlebot|google-inspectiontool|googleother|adsbot-google|mediapartners-google|apis-google|feedfetcher-google|google-read-aloud|storebot-google/i, 'Google crawler'],
  [/bingbot|bingpreview|msnbot|adidxbot/i, 'Bing crawler'],
  [/linkedinbot/i, 'LinkedIn link preview'],
  [/whatsapp/i, 'WhatsApp link preview'],
  [/telegrambot/i, 'Telegram link preview'],
  [/twitterbot/i, 'X link preview'],
  [/slackbot|slack-imgproxy/i, 'Slack link preview'],
  [/discordbot/i, 'Discord link preview'],
  [/applebot/i, 'Apple crawler'],
  [/duckduckbot|duckassistbot/i, 'DuckDuckGo crawler'],
  [/yandex/i, 'Yandex crawler'],
  [/baiduspider/i, 'Baidu crawler'],
  [/gptbot|chatgpt-user|oai-searchbot/i, 'OpenAI crawler'],
  [/claudebot|claude-user|claude-searchbot|anthropic-ai/i, 'Anthropic crawler'],
  [/perplexitybot|perplexity-user/i, 'Perplexity crawler'],
  [/ccbot/i, 'Common Crawl'],
  [/bytespider/i, 'ByteDance crawler'],
  [/amazonbot/i, 'Amazon crawler'],
  [/ahrefs|semrush|mj12bot|dotbot|petalbot|seznambot|screaming frog/i, 'SEO crawler'],
  [/headlesschrome|phantomjs|puppeteer|playwright|selenium|lighthouse|pagespeed|gtmetrix/i, 'Headless browser'],
  [/curl|wget|python|node-fetch|axios|go-http-client|okhttp|java\/|libwww|httpclient|scrapy/i, 'Script'],
  [/uptime|pingdom|statuscake|monitor/i, 'Uptime monitor'],
  [/bot|crawler|spider|crawling|slurp|preview/i, 'Other crawler'],
];

/** Friendly name of a self-declared crawler, or null for a normal browser. */
export function crawlerName(userAgent: string) {
  if (!userAgent) return 'No browser name';
  for (const [re, name] of CRAWLERS) if (re.test(userAgent)) return name;
  return null;
}

export function isBot(userAgent: string) {
  return crawlerName(userAgent) !== null;
}

/**
 * What can be told the moment a request arrives. The IP address is only
 * compared against cloud networks here, in memory; just the provider's name
 * is kept.
 */
export function arrivalBotReason(userAgent: string, ip: string, automated = false) {
  const crawler = crawlerName(userAgent);
  if (crawler) return crawler;
  if (automated) return 'Automated browser';
  const dc = dataCentre(ip);
  return dc ? `Data centre · ${dc}` : null;
}

/** Small towns that are mostly server farms (AWS, Google, Meta, Microsoft). */
const DATA_CENTRE_TOWNS: [country: string, city: string, region?: string][] = [
  ['US', 'Boardman'], ['US', 'Council Bluffs'], ['US', 'Prineville'], ['US', 'Forest City'],
  ['US', 'Springfield', 'NE'], ['US', 'Papillion'], ['US', 'Ashburn'], ['US', 'Floris'],
  ['US', 'Sterling', 'VA'], ['US', 'The Dalles'], ['US', 'Altoona', 'IA'], ['US', 'Los Lunas'],
  ['US', 'Eagle Mountain'], ['US', 'New Albany', 'OH'], ['US', 'Moncks Corner'], ['US', 'Lenoir'],
  ['US', 'Pryor'], ['US', 'Quincy', 'WA'], ['NL', 'Eemshaven'], ['NL', 'Middenmeer'],
  ['FI', 'Hamina'], ['BE', 'Saint-Ghislain'], ['IE', 'Clonee'], ['SE', 'Luleå'],
];
const townSql = DATA_CENTRE_TOWNS
  .map(([c, city, r]) => `(country = '${c}' AND city = '${city}'${r ? ` AND region = '${r}'` : ''})`)
  .join(' OR ');

/**
 * Why a stored visit looks automated, or NULL for a person. Read from the
 * columns at query time, so new rules also apply to older visits.
 *  - screen 800x600 / 2000x2000: what headless Chrome and Meta's renderer report
 *  - UTC as the clock: servers; people get Europe/London, Europe/Berlin, ...
 *  - memory size from Safari, Firefox or any iPhone: those never report it, so
 *    the browser name is fake
 *  - a desktop "window" exactly as big as the screen: no browser bar, headless
 */
const VISIT_BOT_SQL = `(CASE
  WHEN bot_reason IS NOT NULL THEN bot_reason
  WHEN ${townSql} THEN 'Data-centre town'
  WHEN screen IN ('800x600', '2000x2000') THEN 'Headless browser screen'
  WHEN tz IN ('UTC', 'Etc/UTC', 'Etc/GMT', 'Etc/Unknown') THEN 'Server time zone'
  WHEN hardware LIKE '%GB%' AND (os LIKE 'iOS%' OR browser LIKE 'Safari%' OR browser LIKE 'Firefox%') THEN 'Fake browser details'
  WHEN browser ~ '^(Chrome|Firefox|Edge) [0-9]{1,2}$' THEN 'Outdated or fake browser'
  WHEN device = 'Desktop' AND screen IS NOT NULL AND viewport = screen THEN 'Window as big as the screen'
  WHEN dwell_s < 2 AND coalesce(scroll_pct, 0) = 0 THEN 'Left within 2 s, no scroll'
END)`;

const CV_BOT_SQL = `(CASE
  WHEN bot_reason IS NOT NULL THEN bot_reason
  WHEN ${townSql} THEN 'Data-centre town'
  WHEN browser ~ '^(Chrome|Firefox|Edge) [0-9]{1,2}$' THEN 'Outdated or fake browser'
END)`;

/** The table with a "bot" column added, and the bots left out unless asked for. */
const scored = (table: string, rule: string, includeBots: boolean) =>
  `(SELECT * FROM (SELECT *, ${rule} AS bot FROM ${table}) s${includeBots ? '' : ' WHERE s.bot IS NULL'})`;

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
    // Safari and Chrome freeze the reported macOS version at 10.15, so the
    // number would be a lie — report the platform only.
    : /Mac OS X/.test(ua) ? 'macOS'
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
  botReason: string | null;
};

export async function recordVisit(v: VisitInput) {
  await ensureVisitsTable();
  // The endpoint is public, so one visitor is capped at 120 rows an hour. The
  // check rides along inside the insert, so it costs no extra round trip.
  await query(
    `INSERT INTO visits
       (view_id, path, referrer, referrer_url, ref_tag, country, region, city, coords, tz, lang,
        device, browser, os, screen, viewport, hardware, connection, visitor_hash, bot_reason)
     SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
      WHERE (SELECT count(*) FROM visits
              WHERE visitor_hash = $19 AND ts > now() - interval '1 hour') < 120`,
    [v.viewId, v.path.slice(0, 200), v.referrer, v.referrerUrl, v.refTag, v.country, v.region, v.city,
     v.coords, v.tz, v.lang, v.device, v.browser, v.os, v.screen, v.viewport, v.hardware,
     v.connection, v.visitorHash, v.botReason]
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

/** Visit statistics. Bots are left out unless includeBots is set. */
export async function getVisitStats(includeBots = false) {
  await ensureVisitsTable();
  const n = (v: unknown) => Number(v ?? 0);

  await ensureCvTable();

  const V = scored('visits', VISIT_BOT_SQL, includeBots);
  const C = scored('cv_opens', CV_BOT_SQL, includeBots);

  const [totals, daily, paths, refs, tags, places, systems, langs, cv, cvRecent, recent, bots, cvBots] = await Promise.all([
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
      FROM ${V} visits
    `),
    query(`
      SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
             count(v.id)                   AS views,
             count(DISTINCT v.visitor_hash) AS visitors
      FROM generate_series(current_date - interval '13 days', current_date, interval '1 day') AS d(day)
      LEFT JOIN ${V} v ON v.ts >= d.day AND v.ts < d.day + interval '1 day'
      GROUP BY d.day ORDER BY d.day
    `),
    query(`SELECT path, count(*) AS views FROM ${V} visits GROUP BY path ORDER BY views DESC LIMIT 8`),
    query(`SELECT referrer, count(*) AS views, count(DISTINCT visitor_hash) AS visitors
           FROM ${V} visits GROUP BY 1 ORDER BY views DESC LIMIT 10`),
    query(`SELECT ref_tag, count(*) AS views, count(DISTINCT visitor_hash) AS visitors,
                  to_char(max(ts), 'YYYY-MM-DD HH24:MI') AS last_seen
           FROM ${V} visits WHERE ref_tag IS NOT NULL
           GROUP BY 1 ORDER BY views DESC LIMIT 15`),
    query(`SELECT coalesce(country, '??') AS country, city, region,
                  count(*) AS views, count(DISTINCT visitor_hash) AS visitors
           FROM ${V} visits GROUP BY 1,2,3 ORDER BY views DESC LIMIT 12`),
    query(`SELECT coalesce(device, 'Unknown') AS device, coalesce(os, 'Unknown') AS os,
                  count(*) AS views
           FROM ${V} visits GROUP BY 1,2 ORDER BY views DESC LIMIT 10`),
    query(`SELECT lang, count(*) AS views FROM ${V} visits
           WHERE lang IS NOT NULL GROUP BY 1 ORDER BY views DESC LIMIT 8`),
    query(`SELECT count(*) AS opens,
                  count(DISTINCT visitor_hash) AS people,
                  count(*) FILTER (WHERE ts > now() - interval '7 days') AS opens_7d
           FROM ${C} cv_opens`),
    query(`SELECT to_char(ts, 'YYYY-MM-DD HH24:MI') AS at, country, region, city,
                  ref_tag, device, browser, os, bot
           FROM ${C} cv_opens ORDER BY ts DESC LIMIT 20`),
    query(`SELECT to_char(ts, 'YYYY-MM-DD HH24:MI') AS at, path, country, region, city, coords, tz, lang,
                  device, browser, os, screen, viewport, hardware, connection,
                  referrer, referrer_url, ref_tag, dwell_s, scroll_pct, actions, bot
           FROM ${V} visits ORDER BY ts DESC LIMIT 30`),
    // Always counted, so the panel can say how many were hidden and why.
    query(`SELECT bot AS reason, count(*) AS views
           FROM (SELECT ${VISIT_BOT_SQL} AS bot FROM visits) b
           WHERE bot IS NOT NULL GROUP BY 1 ORDER BY views DESC`),
    query(`SELECT count(*) AS opens FROM cv_opens WHERE ${CV_BOT_SQL} IS NOT NULL`),
  ]);

  const t = totals.rows[0] ?? {};
  const str = (v: unknown) => (v == null ? null : String(v));

  const botReasons = bots.rows.map((r) => ({ reason: String(r.reason), views: n(r.views) }));

  return {
    includeBots,
    bots: {
      views: botReasons.reduce((sum, r) => sum + r.views, 0),
      cvOpens: n(cvBots.rows[0]?.opens),
      reasons: botReasons,
    },
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
    cv: {
      opens: n(cv.rows[0]?.opens), people: n(cv.rows[0]?.people), opens7d: n(cv.rows[0]?.opens_7d),
      recent: cvRecent.rows.map((r) => ({
        at: String(r.at), country: str(r.country), region: str(r.region), city: str(r.city),
        tag: str(r.ref_tag), device: String(r.device ?? ''), browser: String(r.browser ?? ''), os: str(r.os),
        bot: str(r.bot),
      })),
    },
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
      bot: str(r.bot),
    })),
  };
}

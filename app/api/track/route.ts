import {
  recordVisit, recordEngagement, visitorHash, isBot, parseAgent,
  referrerHost, referrerUrl, cleanTag, clean, coords, primaryLang,
} from '@/lib/visits';

export const dynamic = 'force-dynamic';

const NO = () => new Response(null, { status: 204 });

// Public endpoint: one row per page view, updated once when the visitor leaves.
// Never stores the raw IP — it is only used in-memory to build a daily-rotating
// pseudonymous hash.
export async function POST(req: Request) {
  try {
    if (req.headers.get('dnt') === '1') return NO();

    const ua = req.headers.get('user-agent') ?? '';
    if (isBot(ua)) return NO();

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return NO(); }

    // Second ping: time on page, scroll depth and what they clicked.
    if (body.kind === 'leave') {
      const vid = clean(body.vid, 40);
      if (!vid) return NO();
      const acts = typeof body.actions === 'string'
        ? body.actions.split('|').map((a) => clean(a, 30)).filter(Boolean).slice(0, 6).join('|')
        : '';
      await recordEngagement(vid, Number(body.dwell) || 0, Number(body.scroll) || 0, acts || null);
      return NO();
    }

    const path = typeof body.path === 'string' && body.path.startsWith('/') ? body.path : '/';
    if (path.startsWith('/admin')) return NO();

    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
    const { device, browser, os } = parseAgent(ua);
    const ref = typeof body.referrer === 'string' ? body.referrer : null;
    const city = req.headers.get('x-vercel-ip-city');

    await recordVisit({
      viewId: clean(body.vid, 40),
      path,
      referrer: referrerHost(ref),
      referrerUrl: referrerUrl(ref),
      refTag: cleanTag(body.tag),
      country: req.headers.get('x-vercel-ip-country'),
      region: req.headers.get('x-vercel-ip-country-region'),
      city: city ? decodeURIComponent(city) : null,
      coords: coords(req.headers.get('x-vercel-ip-latitude'), req.headers.get('x-vercel-ip-longitude')),
      tz: clean(body.tz, 40) ?? req.headers.get('x-vercel-ip-timezone'),
      lang: clean(body.lang, 20) ?? primaryLang(req.headers.get('accept-language')),
      device,
      browser,
      os,
      screen: clean(body.screen, 20),
      viewport: clean(body.viewport, 20),
      hardware: clean(body.hardware, 40),
      connection: clean(body.connection, 20),
      visitorHash: visitorHash(ip, ua),
    });

    return NO();
  } catch {
    // Tracking must never surface an error to a visitor.
    return NO();
  }
}

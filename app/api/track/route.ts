import { recordVisit, visitorHash, isBot, parseAgent, referrerHost } from '@/lib/visits';

export const dynamic = 'force-dynamic';

// Public endpoint: one row per page view. Never stores the raw IP — it is only
// used in-memory to build a daily-rotating pseudonymous hash.
export async function POST(req: Request) {
  try {
    if (req.headers.get('dnt') === '1') return new Response(null, { status: 204 });

    const ua = req.headers.get('user-agent') ?? '';
    if (isBot(ua)) return new Response(null, { status: 204 });

    let body: { path?: unknown; referrer?: unknown };
    try { body = await req.json(); } catch { return new Response(null, { status: 204 }); }

    const path = typeof body.path === 'string' && body.path.startsWith('/') ? body.path : '/';
    if (path.startsWith('/admin')) return new Response(null, { status: 204 });

    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
    const { device, browser } = parseAgent(ua);

    await recordVisit({
      path,
      referrer: referrerHost(typeof body.referrer === 'string' ? body.referrer : null),
      country: req.headers.get('x-vercel-ip-country'),
      city: req.headers.get('x-vercel-ip-city')
        ? decodeURIComponent(req.headers.get('x-vercel-ip-city') as string)
        : null,
      device,
      browser,
      visitorHash: visitorHash(ip, ua),
    });

    return new Response(null, { status: 204 });
  } catch {
    // Tracking must never surface an error to a visitor.
    return new Response(null, { status: 204 });
  }
}

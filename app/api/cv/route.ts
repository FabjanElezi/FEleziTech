import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { recordCvOpen, visitorHash, isBot, parseAgent, tagFromReferer } from '@/lib/visits';

export async function GET(req: Request) {
  const { rows } = await query('SELECT cv_url FROM portfolio WHERE id = $1', ['main']);
  const cvUrl = rows[0]?.cv_url as string | undefined;

  if (!cvUrl) {
    return new NextResponse('No CV uploaded', { status: 404 });
  }

  let res: Response;
  try {
    res = await fetch(cvUrl);
    if (!res.ok) throw new Error(`Blob fetch failed: ${res.status}`);
  } catch {
    return new NextResponse('CV file unavailable', { status: 502 });
  }

  const blob = await res.blob();
  const buffer = await blob.arrayBuffer();

  // Count the opening. Recorded here rather than on the click, so a CV link
  // opened directly — pasted, bookmarked, forwarded — is counted too.
  try {
    const ua = req.headers.get('user-agent') ?? '';
    if (!isBot(ua) && req.headers.get('dnt') !== '1') {
      const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
      const { device, browser, os } = parseAgent(ua);
      const city = req.headers.get('x-vercel-ip-city');
      await recordCvOpen({
        country: req.headers.get('x-vercel-ip-country'),
        region: req.headers.get('x-vercel-ip-country-region'),
        city: city ? decodeURIComponent(city) : null,
        refTag: tagFromReferer(req.headers.get('referer')),
        device, browser, os,
        visitorHash: visitorHash(ip, ua),
      });
    }
  } catch {
    // Never let counting get in the way of handing over the CV.
  }

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      // inline: opens in the browser's PDF viewer, which has its own download button
      'Content-Disposition': 'inline; filename="Fabjan_Elezi_CV.pdf"',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
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

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      // inline: opens in the browser's PDF viewer, which has its own download button
      'Content-Disposition': 'inline; filename="Fabjan_Elezi_CV.pdf"',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

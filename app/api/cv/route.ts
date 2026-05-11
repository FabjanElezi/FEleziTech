import { NextResponse } from 'next/server';

const CV_URL = 'https://zidb6ezdsz9bazru.public.blob.vercel-storage.com/cv/1778443260446-i68pimp82gq.pdf';

export async function GET() {
  const res = await fetch(CV_URL);
  const blob = await res.blob();
  const buffer = await blob.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Fabjan_Elezi_CV.pdf"',
    },
  });
}

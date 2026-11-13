import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SITE_HOST } from '@/lib/site';
import { googleFont } from '@/lib/og';

// The card LinkedIn, WhatsApp, Slack etc. show when someone shares the link.
export const alt = 'Fabjan Elezi – Data Analytics & IT Systems';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const EYEBROW = 'M.SC. INFORMATION SYSTEMS · FH AACHEN';
const TAGLINE = 'Data Analytics & IT Systems';
const NOTE = 'Open to Werkstudent & internship roles · Aachen';

// A fixed constellation in the spirit of the hero's network, drawn once.
const NODES: [number, number][] = [
  [60, 80], [210, 40], [380, 110], [120, 250], [300, 300], [520, 60], [640, 170],
  [90, 470], [260, 560], [450, 500], [610, 590], [720, 420], [820, 70], [980, 40],
  [1140, 120], [1170, 330], [1100, 560], [930, 600], [760, 610], [700, 300],
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [2, 5], [5, 6], [3, 7], [7, 8], [8, 9],
  [9, 10], [9, 11], [6, 19], [11, 19], [5, 12], [12, 13], [13, 14], [14, 15],
  [15, 16], [16, 17], [17, 18], [10, 18], [11, 18], [4, 9],
];

// The logo mark in the footer: public/logo-mark.svg is 155.11 x 88, with 9 units of air on each side.
const MARK_H = 44;
const MARK = { h: MARK_H, w: Math.round((MARK_H * 155.11) / 88), pad: Math.round((MARK_H * 9) / 88) };

export default async function Image() {
  const allText = `Fabjan Elezi${EYEBROW}${TAGLINE}${NOTE}${SITE_HOST}`;
  const [bold, medium, photo, mark] = await Promise.all([
    googleFont('Space Grotesk', 700, allText),
    googleFont('Space Grotesk', 500, allText),
    readFile(join(process.cwd(), 'public/og-photo.jpg')),
    // The logo of the menu bar (FE, the bar of the E is the infinity) as a drawing, so it stays sharp.
    readFile(join(process.cwd(), 'public/logo-mark.svg')),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString('base64')}`;
  const markSrc = `data:image/svg+xml;base64,${mark.toString('base64')}`;
  const font = bold ? 'Space Grotesk' : 'sans-serif';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(135deg, #070b13 0%, #0a1420 55%, #071a22 100%)',
          fontFamily: font,
        }}
      >
        {/* glows */}
        <div style={{ position: 'absolute', top: -160, left: -120, width: 620, height: 620, borderRadius: 9999,
          background: 'radial-gradient(circle, rgba(8,145,178,0.22) 0%, transparent 70%)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -220, right: -140, width: 760, height: 760, borderRadius: 9999,
          background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)', display: 'flex' }} />

        {/* network */}
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: 'absolute', top: 0, left: 0 }}>
          {EDGES.map(([a, b], i) => (
            <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]}
              stroke="rgba(34,211,238,0.16)" strokeWidth="1.2" />
          ))}
          {NODES.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3.2 : 2.2} fill="rgba(103,232,249,0.55)" />
          ))}
        </svg>

        {/* text */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 84, width: 700 }}>
          <div style={{ display: 'flex', fontSize: 21, letterSpacing: 4, color: '#67e8f9', fontWeight: 500 }}>
            {EYEBROW}
          </div>
          <div style={{ display: 'flex', fontSize: 104, fontWeight: 700, lineHeight: 1, marginTop: 26, letterSpacing: -2 }}>
            <span style={{ color: '#ffffff' }}>Fabjan</span>
            <span style={{ color: '#22d3ee', marginLeft: 26 }}>Elezi</span>
          </div>
          <div style={{ display: 'flex', fontSize: 38, color: '#e2e8f0', marginTop: 30, fontWeight: 500 }}>
            {TAGLINE}
          </div>
          <div style={{ display: 'flex', fontSize: 23, color: '#94a3b8', marginTop: 22, fontWeight: 500 }}>
            {NOTE}
          </div>
        </div>

        {/* photo */}
        <div style={{ position: 'absolute', right: 92, top: 125, width: 380, height: 380, borderRadius: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #67e8f9, #0891b2)',
          boxShadow: '0 0 60px rgba(34,211,238,0.35)' }}>
          <img src={photoSrc} width={364} height={364} alt="" style={{ borderRadius: 9999, objectFit: 'cover' }} />
        </div>

        {/* footer: the logo and the address. The drawing has 10% air around the letters, so it starts a little further left. */}
        <div style={{ position: 'absolute', left: 84 - MARK.pad, bottom: 40, display: 'flex', alignItems: 'center' }}>
          <img src={markSrc} width={MARK.w} height={MARK.h} alt="" />
          <span style={{ marginLeft: 16 - MARK.pad, fontSize: 24, color: '#cbd5e1', fontWeight: 500 }}>{SITE_HOST}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(bold ? [{ name: 'Space Grotesk', data: bold, weight: 700 as const, style: 'normal' as const }] : []),
        ...(medium ? [{ name: 'Space Grotesk', data: medium, weight: 500 as const, style: 'normal' as const }] : []),
      ],
    },
  );
}

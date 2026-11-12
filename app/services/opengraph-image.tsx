import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SITE_HOST } from '@/lib/site';
import { googleFont } from '@/lib/og';

// Share card for /services. Clients, not recruiters, get this link, so it carries
// the RevoWeb look: the dark ground of the site and the line that runs from the
// purple of the Reels into the site's cyan (logo, last headline line, photo ring).
export const alt = 'RevoWeb – websites, dashboards & IT for your business. Free consultation.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const EYEBROW = 'FREELANCE SERVICES';
const LINES = ['Websites,', 'dashboards & IT', 'for your business'];
// Two chips keep the row clear of the WhatsApp card; "price on request" is on the page.
const CHIPS = ['Free consultation', 'Albania · Europe · Worldwide'];
const PHONE = '+49 174 8696164';
const PHONE_LABEL = 'WHATSAPP · TELEGRAM';
const HANDLE = '@revoweb_official';

// The RevoWeb line: Reel purple into site cyan.
const LINE = 'linear-gradient(90deg, #a78bfa 0%, #7c4dff 38%, #22d3ee 72%, #67e8f9 100%)';
const WEB = 'linear-gradient(90deg, #8b6bff 0%, #22d3ee 70%, #67e8f9 100%)';
// The mark of the logo (RevoWeb Instagram/logo/revoweb-mark.svg).
const MARK = 'M38 17 C30 4 7 3 7 17 C7 31 30 30 38 17 C46 4 69 3 69 17 C69 31 46 30 38 17 Z';

export default async function Image() {
  const host = `${SITE_HOST}/services`;
  const sans = ['RevoWeb', ...LINES, ...CHIPS, PHONE, HANDLE, host, '·'].join('');
  const [bold, medium, mono, photo] = await Promise.all([
    googleFont('Geist', 700, sans),
    googleFont('Geist', 500, sans),
    googleFont('Geist Mono', 600, EYEBROW + PHONE_LABEL),
    readFile(join(process.cwd(), 'public/og-photo.jpg')),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString('base64')}`;
  const monoFamily = mono ? 'Geist Mono' : 'monospace';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          // The two lights are backgrounds of the card itself: purple where the line starts, cyan where it
          // ends. (As separate boxes reaching past the edge they are drawn only up to the card's own size.)
          backgroundColor: '#04070c',
          backgroundImage: [
            'radial-gradient(circle at 170px 120px, rgba(124,77,255,0.34) 0%, rgba(124,77,255,0) 38%)',
            'radial-gradient(circle at 1040px 610px, rgba(34,211,238,0.22) 0%, rgba(34,211,238,0) 40%)',
          ].join(', '),
          fontFamily: bold ? 'Geist' : 'sans-serif',
          color: '#ffffff',
        }}
      >
        {/* a few linked points, as on the RevoWeb avatar */}
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: 'absolute', left: 0, top: 0 }}>
          <g stroke="#22d3ee" strokeWidth="1.6" fill="#22d3ee" opacity="0.32">
            <line x1="612" y1="66" x2="700" y2="34" /><circle cx="612" cy="66" r="4" /><circle cx="700" cy="34" r="3.2" />
            <line x1="1118" y1="418" x2="1164" y2="372" /><circle cx="1118" cy="418" r="3.2" /><circle cx="1164" cy="372" r="4" />
            <circle cx="700" cy="560" r="3" /><circle cx="1150" cy="70" r="3" />
          </g>
        </svg>

        {/* logo */}
        <div style={{ position: 'absolute', top: 50, left: 72, display: 'flex', alignItems: 'center' }}>
          <svg width="98" height="44" viewBox="0 0 76 34">
            <defs>
              <linearGradient id="l" gradientUnits="userSpaceOnUse" x1="7" y1="17" x2="69" y2="17">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="0.38" stopColor="#7c4dff" />
                <stop offset="0.72" stopColor="#22d3ee" />
                <stop offset="1" stopColor="#67e8f9" />
              </linearGradient>
            </defs>
            <path d={MARK} fill="none" stroke="url(#l)" strokeWidth="5.8" strokeLinejoin="round" />
            <circle cx="38" cy="17" r="3.1" fill="#f8fafc" />
          </svg>
          <div style={{ display: 'flex', marginLeft: 22, fontSize: 56, fontWeight: 700, letterSpacing: -1.9, lineHeight: 1 }}>
            <span>Revo</span>
            <span style={{ marginLeft: -7, backgroundImage: WEB, backgroundClip: 'text', color: 'transparent' }}>Web</span>
          </div>
        </div>

        {/* text */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', left: 72, top: 152 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 34, height: 2, background: '#0891b2', display: 'flex' }} />
            <span style={{ marginLeft: 14, fontFamily: monoFamily, fontSize: 19, letterSpacing: 3.4, fontWeight: 600, color: '#22d3ee' }}>
              {EYEBROW}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 16 }}>
            {LINES.map((l, i) => (
              <div
                key={l}
                style={{
                  display: 'flex', fontSize: 66, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2.2,
                  ...(i === LINES.length - 1 ? { backgroundImage: LINE, backgroundClip: 'text', color: 'transparent' } : {}),
                }}
              >
                {l}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
            {CHIPS.map((c) => (
              <div key={c} style={{ display: 'flex', fontSize: 19, fontWeight: 500, padding: '9px 18px', borderRadius: 999,
                color: '#a5f3fc', background: 'rgba(34,211,238,0.07)', border: '1.5px solid rgba(34,211,238,0.34)' }}>
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* photo, in a ring drawn with the line; centred over the contact card below it (both around x = 946) */}
        <div style={{ position: 'absolute', right: 102, top: 84, width: 304, height: 304, borderRadius: 9999, display: 'flex',
          alignItems: 'center', justifyContent: 'center', backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #7c4dff 38%, #22d3ee 72%, #67e8f9 100%)',
          boxShadow: '0 0 80px rgba(124,77,255,0.32)' }}>
          <img src={photoSrc} width={288} height={288} alt="" style={{ borderRadius: 9999, objectFit: 'cover' }} />
        </div>

        {/* contact card */}
        <div style={{ position: 'absolute', right: 72, bottom: 66, width: 364, display: 'flex', flexDirection: 'column',
          background: 'rgba(13,18,28,0.92)', border: '1.5px solid rgba(34,211,238,0.38)', borderRadius: 24, padding: '17px 26px 18px' }}>
          <span style={{ fontFamily: monoFamily, fontSize: 15, letterSpacing: 3, fontWeight: 600, color: '#22d3ee' }}>{PHONE_LABEL}</span>
          <span style={{ fontSize: 35, fontWeight: 700, letterSpacing: -0.6, color: '#ffffff', marginTop: 5 }}>{PHONE}</span>
        </div>

        {/* footer */}
        <div style={{ position: 'absolute', left: 72, bottom: 54, display: 'flex', alignItems: 'center', fontSize: 22, fontWeight: 500, color: '#90a1b9' }}>
          <span>{host}</span>
          <span style={{ margin: '0 13px 0 9px', color: '#475569' }}>·</span>
          <span>{HANDLE}</span>
        </div>

        {/* the line itself, along the bottom edge */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 7, backgroundImage: LINE, display: 'flex' }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(bold ? [{ name: 'Geist', data: bold, weight: 700 as const, style: 'normal' as const }] : []),
        ...(medium ? [{ name: 'Geist', data: medium, weight: 500 as const, style: 'normal' as const }] : []),
        ...(mono ? [{ name: 'Geist Mono', data: mono, weight: 600 as const, style: 'normal' as const }] : []),
      ],
    },
  );
}

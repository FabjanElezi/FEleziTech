import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SITE_HOST } from '@/lib/site';
import { googleFont } from '@/lib/og';

// Share card for /services. Clients, not recruiters, get this link, so it uses
// the RevoWeb purple from the Instagram posts instead of the portfolio card.
export const alt = 'Websites, dashboards & IT for your business – free consultation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const EYEBROW = 'FREELANCE SERVICES';
const LINES = ['Websites,', 'dashboards & IT', 'for your business'];
// Two chips keep the row clear of the WhatsApp card; "price on request" is on the page.
const CHIPS = ['Free consultation', 'Albania · Europe · Worldwide'];
const PHONE = '+49 174 8696164';
const PHONE_LABEL = 'WHATSAPP · TELEGRAM';
const HANDLE = '@revoweb_official';

// The infinity mark from the RevoWeb logo, as one closed path.
function infinityPath(cx: number, cy: number, s: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * Math.PI * 2;
    const d = 1 + Math.sin(t) ** 2;
    pts.push(`${(cx + (s * Math.cos(t)) / d).toFixed(1)},${(cy + (s * Math.sin(t) * Math.cos(t)) / d).toFixed(1)}`);
  }
  return `M${pts.join(' L')}Z`;
}

export default async function Image() {
  const host = `${SITE_HOST}/services`;
  const allText = ['RevoWeb', EYEBROW, ...LINES, ...CHIPS, PHONE, PHONE_LABEL, HANDLE, host].join('');
  const [heavy, semi, photo] = await Promise.all([
    googleFont('Poppins', 800, allText),
    googleFont('Poppins', 600, allText),
    readFile(join(process.cwd(), 'public/og-photo.jpg')),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(135deg, #4b5cff 0%, #7a3cff 55%, #b23cf0 100%)',
          fontFamily: heavy ? 'Poppins' : 'sans-serif',
          color: '#ffffff',
        }}
      >
        {/* soft lights, as on the Instagram slides */}
        <div style={{ position: 'absolute', top: -260, right: -200, width: 760, height: 760, borderRadius: 9999,
          background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -320, left: -220, width: 820, height: 820, borderRadius: 9999,
          background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 70%)', display: 'flex' }} />

        {/* logo */}
        <div style={{ position: 'absolute', top: 52, left: 72, display: 'flex', alignItems: 'center' }}>
          <svg width="64" height="36" viewBox="0 0 64 36">
            <path d={infinityPath(32, 18, 28)} fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinejoin="round" />
          </svg>
          <span style={{ marginLeft: 14, fontSize: 30, fontWeight: 600 }}>RevoWeb</span>
        </div>

        {/* text */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', left: 72, top: 138 }}>
          <div style={{ display: 'flex', fontSize: 20, letterSpacing: 5, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
            {EYEBROW}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 14 }}>
            {LINES.map((l) => (
              <div key={l} style={{ display: 'flex', fontSize: 64, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1 }}>{l}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            {CHIPS.map((c) => (
              <div key={c} style={{ display: 'flex', fontSize: 19, fontWeight: 600, padding: '9px 18px', borderRadius: 999,
                background: 'rgba(255,255,255,0.16)', border: '2px solid rgba(255,255,255,0.3)' }}>
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* photo */}
        <div style={{ position: 'absolute', right: 86, top: 92, width: 300, height: 300, borderRadius: 9999, display: 'flex',
          alignItems: 'center', justifyContent: 'center', background: '#ffffff', boxShadow: '0 20px 60px rgba(40,10,120,0.45)' }}>
          <img src={photoSrc} width={286} height={286} alt="" style={{ borderRadius: 9999, objectFit: 'cover' }} />
        </div>

        {/* contact card */}
        <div style={{ position: 'absolute', right: 72, bottom: 64, width: 360, display: 'flex', flexDirection: 'column',
          background: '#ffffff', borderRadius: 26, padding: '18px 26px' }}>
          <span style={{ fontSize: 16, letterSpacing: 3, fontWeight: 600, color: '#6b3cff' }}>{PHONE_LABEL}</span>
          <span style={{ fontSize: 34, fontWeight: 800, color: '#2a1670', marginTop: 4 }}>{PHONE}</span>
        </div>

        {/* footer */}
        <div style={{ position: 'absolute', left: 72, bottom: 52, display: 'flex', fontSize: 22, fontWeight: 600,
          color: 'rgba(255,255,255,0.85)' }}>
          {host}  ·  {HANDLE}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(heavy ? [{ name: 'Poppins', data: heavy, weight: 800 as const, style: 'normal' as const }] : []),
        ...(semi ? [{ name: 'Poppins', data: semi, weight: 600 as const, style: 'normal' as const }] : []),
      ],
    },
  );
}

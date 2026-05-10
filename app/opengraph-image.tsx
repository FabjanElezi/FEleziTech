import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'FeleziTech – Fabjan Elezi Developer Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#040712',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: -80, left: -80,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)',
        }} />

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 6, height: 48,
            background: 'linear-gradient(to bottom, #7c3aed, #22d3ee)',
            borderRadius: 4,
          }} />
          <span style={{ fontSize: 22, color: '#7c3aed', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>
            FeleziTech
          </span>
        </div>

        {/* Name */}
        <div style={{ fontSize: 72, fontWeight: 800, color: '#ffffff', letterSpacing: -2, lineHeight: 1 }}>
          Fabjan Elezi
        </div>

        {/* Title */}
        <div style={{
          fontSize: 26, marginTop: 20,
          background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
          backgroundClip: 'text',
          color: 'transparent',
          fontWeight: 600,
        }}>
          Developer Portfolio
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
          {['Web Development', 'Data Analytics', 'Cybersecurity'].map((t) => (
            <div key={t} style={{
              fontSize: 14, padding: '6px 18px', borderRadius: 999,
              border: '1px solid rgba(124,58,237,0.4)',
              background: 'rgba(124,58,237,0.1)',
              color: '#c4b5fd',
            }}>
              {t}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ position: 'absolute', bottom: 36, fontSize: 16, color: '#475569' }}>
          felezitech.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}

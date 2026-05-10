'use client';
import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none)').matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    const glow = glowRef.current;
    if (!dot || !ring || !glow) return;

    const styleEl = document.createElement('style');
    styleEl.id = 'custom-cursor-css';
    styleEl.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(styleEl);

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let isHover = false;
    let started = false;
    let raf: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!started) {
        ringX = mouseX;
        ringY = mouseY;
        started = true;
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
        glow.style.opacity = '1';
      }

      const target   = e.target as Element | null;
      const hovering = !!target?.closest(
        'a, button, [role="button"], input, textarea, select, label, [tabindex]'
      );

      if (hovering === isHover) return;
      isHover = hovering;

      if (hovering) {
        ring.style.width       = '46px';
        ring.style.height      = '46px';
        ring.style.borderColor = 'rgba(167,139,250,0.75)';
        ring.style.background  = 'rgba(124,58,237,0.07)';
        dot.style.background   = '#a78bfa';
        dot.style.boxShadow    = '0 0 8px rgba(167,139,250,0.8)';
      } else {
        ring.style.width       = '32px';
        ring.style.height      = '32px';
        ring.style.borderColor = 'rgba(124,58,237,0.45)';
        ring.style.background  = 'transparent';
        dot.style.background   = '#7c3aed';
        dot.style.boxShadow    = '0 0 6px rgba(124,58,237,0.7)';
      }
    };

    const onLeave  = () => { dot.style.opacity = '0'; ring.style.opacity = '0'; glow.style.opacity = '0'; };
    const onReturn = () => {
      if (!started) return;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
      glow.style.opacity = '1';
    };

    const tick = () => {
      const scale = isHover ? 1.6 : 1;
      dot.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%) scale(${scale})`;

      ringX = lerp(ringX, mouseX, 0.13);
      ringY = lerp(ringY, mouseY, 0.13);
      ring.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`;

      glow.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`;

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove',  onMove,   { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onReturn);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onReturn);
      document.getElementById('custom-cursor-css')?.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 6, height: 6, borderRadius: '50%',
          background: '#7c3aed',
          boxShadow: '0 0 6px rgba(124,58,237,0.7)',
          zIndex: 99999, pointerEvents: 'none', willChange: 'transform', opacity: 0,
          transition: 'background 0.2s ease, box-shadow 0.2s ease, opacity 0.3s ease',
        }}
      />
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 32, height: 32, borderRadius: '50%',
          border: '1.5px solid rgba(124,58,237,0.45)',
          background: 'transparent',
          zIndex: 99998, pointerEvents: 'none', willChange: 'transform', opacity: 0,
          transition:
            'width 0.3s cubic-bezier(0.25,1,0.5,1), height 0.3s cubic-bezier(0.25,1,0.5,1), ' +
            'border-color 0.25s ease, background 0.25s ease, opacity 0.3s ease',
        }}
      />
      <div
        ref={glowRef}
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.055) 0%, rgba(79,70,229,0.022) 40%, transparent 70%)',
          zIndex: 0, pointerEvents: 'none', willChange: 'transform', opacity: 0,
          transition: 'opacity 0.4s ease',
        }}
      />
    </>
  );
}

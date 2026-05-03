'use client';
import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't run on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const el = glowRef.current;
    if (!el) return;

    let raf: number;
    let x = -999;
    let y = -999;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    const update = () => {
      if (el) {
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-0 will-change-transform"
      style={{
        width: 700,
        height: 700,
        marginLeft: -350,
        marginTop: -350,
        background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, rgba(79,70,229,0.03) 40%, transparent 70%)',
        borderRadius: '50%',
        transition: 'opacity 0.3s',
      }}
    />
  );
}

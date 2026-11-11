'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// ── plexus config ────────────────────────────────────────────
// Thinned so the network sits behind the headline instead of competing with
// it: fewer nodes (links grow with the square of the count, so this alone
// removes well over half the lines), shorter reach, fainter strokes.
const DOT_COUNT  = 28;
const LINK_DIST  = 150;    // max distance to connect two nodes
const TRI_ALPHA  = 0.03;   // filled triangle face opacity
const LINE_MAX_A = 0.38;
const MAX_SPEED  = 0.22;


function rand(a: number, b: number) { return Math.random() * (b - a) + a; }

interface Dot {
  x: number; y: number; r: number;
  vx: number; vy: number; o: number;
}

function spawnDot(w: number, h: number): Dot {
  return {
    x: rand(w * 0.04, w * 0.96),
    y: rand(h * 0.04, h * 0.96),
    r: rand(1.4, 3.0),
    vx: rand(-0.12, 0.12),
    vy: rand(-0.12, 0.12),
    o: rand(0.35, 0.65),
  };
}

export default function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Not in Admin, and not on the home page: its hero has its own animation.
    if (pathname.startsWith('/admin') || pathname === '/') return;
    // Respect the OS "reduce motion" setting: skip the animation entirely.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let W = 0, H = 0;
    let dots: Dot[] = [];
    let scrollY = 0;
    let mountAlpha = 0;                                    // fades in on load to avoid pop-in flash
    const dist2 = new Float32Array(DOT_COUNT * DOT_COUNT); // reused every frame — no per-frame alloc

    function resize() {
      W = canvas!.width  = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    resize();
    dots = Array.from({ length: DOT_COUNT }, () => spawnDot(W, H));
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    // Pause the render loop while the tab is in the background (saves CPU/battery).
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange', onVisibility);

    function tick() {
      ctx!.clearRect(0, 0, W, H);

      // Hero only. It used to fade back in near the contact section; now it
      // belongs to the hero and is gone for the rest of the page.
      const pageFactor = Math.max(0, 1 - scrollY / (H * 1.1));

      mountAlpha = Math.min(1, mountAlpha + 0.018); // ~56 frames ≈ 0.9 s fade-in

      if (pageFactor < 0.005) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const alpha  = pageFactor * mountAlpha;
      const mobile = W < 640;

      if (!mobile) {
        // move dots — slow drift with wrap-around
        for (const d of dots) {
          d.vx = d.vx * 0.992 + rand(-0.006, 0.006);
          d.vy = d.vy * 0.992 + rand(-0.006, 0.006);
          const spd = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
          if (spd > MAX_SPEED) { d.vx *= MAX_SPEED / spd; d.vy *= MAX_SPEED / spd; }
          d.x += d.vx; d.y += d.vy;
          if (d.x < -12) d.x = W + 12;
          if (d.x > W+12) d.x = -12;
          if (d.y < -12) d.y = H + 12;
          if (d.y > H+12) d.y = -12;
        }

        // precompute pairwise distances (reuse pre-allocated buffer)
        for (let i = 0; i < DOT_COUNT; i++) {
          for (let j = i + 1; j < DOT_COUNT; j++) {
            const dx = dots[i].x - dots[j].x;
            const dy = dots[i].y - dots[j].y;
            const d  = Math.sqrt(dx * dx + dy * dy);
            dist2[i * DOT_COUNT + j] = d;
            dist2[j * DOT_COUNT + i] = d;
          }
        }

        // ── ambient atmospheric glow ──────────────────────────
        let cx = 0, cy = 0;
        for (const d of dots) { cx += d.x; cy += d.y; }
        cx /= DOT_COUNT; cy /= DOT_COUNT;

        const grd = ctx!.createRadialGradient(cx, cy, 0, cx, cy, W * 0.52);
        grd.addColorStop(0,   `rgba(6,182,212,${0.10 * alpha})`);
        grd.addColorStop(0.4, `rgba(6,182,212,${0.04 * alpha})`);
        grd.addColorStop(1,   'rgba(6,182,212,0)');
        ctx!.globalAlpha = 1;
        ctx!.fillStyle = grd;
        ctx!.fillRect(0, 0, W, H);

        // ── filled triangle faces ─────────────────────────────
        ctx!.fillStyle = `rgba(34,211,238,${TRI_ALPHA * alpha})`;
        ctx!.globalAlpha = 1;
        for (let i = 0; i < DOT_COUNT; i++) {
          for (let j = i + 1; j < DOT_COUNT; j++) {
            if (dist2[i * DOT_COUNT + j] >= LINK_DIST) continue;
            for (let k = j + 1; k < DOT_COUNT; k++) {
              if (dist2[i * DOT_COUNT + k] >= LINK_DIST) continue;
              if (dist2[j * DOT_COUNT + k] >= LINK_DIST) continue;
              ctx!.beginPath();
              ctx!.moveTo(dots[i].x, dots[i].y);
              ctx!.lineTo(dots[j].x, dots[j].y);
              ctx!.lineTo(dots[k].x, dots[k].y);
              ctx!.closePath();
              ctx!.fill();
            }
          }
        }

        // ── plexus lines ──────────────────────────────────────
        ctx!.lineWidth = 1;
        ctx!.strokeStyle = '#22d3ee';
        for (let i = 0; i < DOT_COUNT; i++) {
          for (let j = i + 1; j < DOT_COUNT; j++) {
            const d = dist2[i * DOT_COUNT + j];
            if (d >= LINK_DIST) continue;
            const lineA = (1 - d / LINK_DIST) * LINE_MAX_A * alpha;
            if (lineA < 0.003) continue;
            ctx!.globalAlpha = lineA;
            ctx!.beginPath();
            ctx!.moveTo(dots[i].x, dots[i].y);
            ctx!.lineTo(dots[j].x, dots[j].y);
            ctx!.stroke();
          }
        }

        // ── glowing nodes ─────────────────────────────────────
        ctx!.save();
        ctx!.shadowColor = '#22d3ee';
        ctx!.shadowBlur  = 10;
        ctx!.fillStyle   = '#22d3ee';
        ctx!.globalAlpha = 0.28 * alpha;
        for (const d of dots) {
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, d.r * 2.2, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.restore();

        ctx!.fillStyle = '#22d3ee';
        for (const d of dots) {
          ctx!.globalAlpha = d.o * alpha;
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [pathname]);

  if (pathname === '/') return null;

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        willChange: 'transform',
      }}
    />
  );
}

'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// ── plexus config ────────────────────────────────────────────
const DOT_COUNT  = 44;
const LINK_DIST  = 175;    // max distance to connect two nodes
const TRI_ALPHA  = 0.055;  // filled triangle face opacity
const LINE_MAX_A = 0.72;
const MAX_SPEED  = 0.22;

// ── glyphs ──────────────────────────────────────────────────
const SYMS = ['</>','{}','[]','=>','01','//','&&','::','fn','if','0x','#!','~~','λ','<>'];
const GLYPH_COLORS = ['#22d3ee','#22d3ee','#7c3aed','#a78bfa'];
const MAX_GLYPHS  = 8;
const SPAWN_EVERY = 55;

function rand(a: number, b: number) { return Math.random() * (b - a) + a; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

interface Dot {
  x: number; y: number; r: number;
  vx: number; vy: number; o: number;
}

type Phase = 'in' | 'hold' | 'out';
interface Glyph {
  sym: string; x: number; y: number;
  vx: number; vy: number;
  o: number; maxO: number;
  phase: Phase; phaseT: number;
  size: number; c: string;
}

function spawnDot(w: number, h: number): Dot {
  return {
    x: rand(w * 0.04, w * 0.96),
    y: rand(h * 0.04, h * 0.96),
    r: rand(1.4, 3.0),
    vx: rand(-0.12, 0.12),
    vy: rand(-0.12, 0.12),
    o: rand(0.55, 0.95),
  };
}

function spawnGlyph(w: number, h: number): Glyph {
  const edge = Math.floor(Math.random() * 4);
  let x: number, y: number, vx: number, vy: number;
  if (edge === 0) {
    x = rand(w * 0.05, w * 0.95); y = rand(-20, -5);
    vx = rand(-0.1, 0.1); vy = rand(0.07, 0.15);
  } else if (edge === 1) {
    x = rand(-30, -8); y = rand(h * 0.05, h * 0.95);
    vx = rand(0.06, 0.14); vy = rand(-0.06, 0.06);
  } else if (edge === 2) {
    x = rand(w + 8, w + 30); y = rand(h * 0.05, h * 0.95);
    vx = rand(-0.14, -0.06); vy = rand(-0.06, 0.06);
  } else {
    x = rand(w * 0.05, w * 0.95); y = rand(h + 5, h + 20);
    vx = rand(-0.1, 0.1); vy = rand(-0.15, -0.07);
  }
  return {
    sym: pick(SYMS), x, y, vx, vy,
    o: 0, maxO: rand(0.4, 0.62),
    phase: 'in', phaseT: 0,
    size: Math.floor(rand(11, 16)),
    c: pick(GLYPH_COLORS),
  };
}

export default function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    // Respect the OS "reduce motion" setting: skip the animation entirely.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let W = 0, H = 0;
    let frame = 0;
    let dots: Dot[] = [];
    const glyphs: Glyph[] = [];
    let scrollY = 0;
    let maxScroll = 1;
    let mountAlpha = 0;                                    // fades in on load to avoid pop-in flash
    const dist2 = new Float32Array(DOT_COUNT * DOT_COUNT); // reused every frame — no per-frame alloc

    function resize() {
      W = canvas!.width  = window.innerWidth;
      H = canvas!.height = window.innerHeight;
      maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    }
    const onScroll = () => {
      scrollY = window.scrollY;
      maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
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
      frame++;

      // scroll-based visibility: hero (top) and contact (bottom)
      const topFade    = Math.max(0, 1 - scrollY / (H * 1.1));
      const bottomFade = Math.max(0, Math.min(1, (scrollY - (maxScroll - H * 1.6)) / (H * 0.6)));
      const pageFactor = Math.max(topFade, bottomFade);

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
        ctx!.lineWidth = 1.3;
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

      // ── glyphs — more dense on mobile ────────────────────────
      const glyphCap   = mobile ? 24 : MAX_GLYPHS;
      const spawnEvery = mobile ? 16 : SPAWN_EVERY;
      if (frame % spawnEvery === 0 && glyphs.length < glyphCap) {
        glyphs.push(spawnGlyph(W, H));
      }
      for (let i = glyphs.length - 1; i >= 0; i--) {
        const g = glyphs[i];
        g.x += g.vx; g.y += g.vy;
        g.phaseT++;
        if (g.phase === 'in') {
          g.o = Math.min(g.o + g.maxO / 40, g.maxO);
          if (g.phaseT >= 40) { g.phase = 'hold'; g.phaseT = 0; }
        } else if (g.phase === 'hold') {
          if (g.phaseT >= 160 + Math.floor(rand(0, 120))) { g.phase = 'out'; g.phaseT = 0; }
        } else {
          g.o = Math.max(g.o - g.maxO / 50, 0);
          if (g.o <= 0) { glyphs.splice(i, 1); continue; }
        }
        ctx!.globalAlpha = Math.min(1, g.o * alpha * (mobile ? 1.5 : 1));
        ctx!.fillStyle = g.c;
        ctx!.font = `${g.size}px ui-monospace, monospace`;
        ctx!.fillText(g.sym, g.x, g.y);
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

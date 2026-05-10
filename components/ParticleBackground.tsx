'use client';
import { useEffect, useRef } from 'react';

// ── dots ────────────────────────────────────────────────────
const DOT_COUNT  = 22;
const DOT_COLORS = ['#22d3ee','#22d3ee','#7c3aed','#a78bfa','#ffffff'];

// ── glyphs ──────────────────────────────────────────────────
const SYMS = ['</>','{}','[]','=>','01','//','&&','::','fn','if','0x','#!','~~','λ','<>'];
const GLYPH_COLORS = ['#22d3ee','#22d3ee','#7c3aed','#a78bfa'];
const MAX_GLYPHS  = 12;
const SPAWN_EVERY = 45; // frames between spawn attempts

function rand(a: number, b: number) { return Math.random() * (b - a) + a; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

interface Dot {
  x: number; y: number; r: number;
  vx: number; vy: number; o: number; c: string;
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
    x: rand(0, w), y: rand(0, h),
    r: rand(0.6, 1.5),
    vx: rand(-0.04, 0.04),
    vy: rand(-0.09, -0.03),
    o: rand(0.06, 0.18),
    c: pick(DOT_COLORS),
  };
}

function spawnGlyph(w: number, h: number): Glyph {
  // pick an edge: 0=top, 1=left, 2=right, 3=bottom
  const edge = Math.floor(Math.random() * 4);
  let x: number, y: number, vx: number, vy: number;
  if (edge === 0) {
    x = rand(w * 0.05, w * 0.95); y = rand(-20, -5);
    vx = rand(-0.12, 0.12); vy = rand(0.08, 0.18);
  } else if (edge === 1) {
    x = rand(-30, -8); y = rand(h * 0.05, h * 0.95);
    vx = rand(0.06, 0.16); vy = rand(-0.08, 0.08);
  } else if (edge === 2) {
    x = rand(w + 8, w + 30); y = rand(h * 0.05, h * 0.95);
    vx = rand(-0.16, -0.06); vy = rand(-0.08, 0.08);
  } else {
    x = rand(w * 0.05, w * 0.95); y = rand(h + 5, h + 20);
    vx = rand(-0.12, 0.12); vy = rand(-0.18, -0.08);
  }
  return {
    sym: pick(SYMS),
    x, y, vx, vy,
    o: 0, maxO: rand(0.45, 0.68),
    phase: 'in', phaseT: 0,
    size: Math.floor(rand(12, 17)),
    c: pick(GLYPH_COLORS),
  };
}

export default function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let W = 0, H = 0;
    let frame = 0;
    let dots: Dot[] = [];
    let glyphs: Glyph[] = [];

    function resize() {
      W = canvas!.width  = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    resize();
    dots = Array.from({ length: DOT_COUNT }, () => spawnDot(W, H));
    window.addEventListener('resize', resize);

    function tick() {
      ctx!.clearRect(0, 0, W, H);
      frame++;

      // ── dots ──
      ctx!.font = '';
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -4) { d.y = H + 4; d.x = rand(0, W); }
        if (d.x < -4)    d.x = W + 4;
        if (d.x > W + 4) d.x = -4;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fillStyle = d.c;
        ctx!.globalAlpha = d.o;
        ctx!.fill();
      }

      // ── maybe spawn glyph ──
      if (frame % SPAWN_EVERY === 0 && glyphs.length < MAX_GLYPHS) {
        glyphs.push(spawnGlyph(W, H));
      }

      // ── glyphs ──
      for (let i = glyphs.length - 1; i >= 0; i--) {
        const g = glyphs[i];
        g.x += g.vx; g.y += g.vy;
        g.phaseT++;

        if (g.phase === 'in') {
          g.o = Math.min(g.o + g.maxO / 40, g.maxO);
          if (g.phaseT >= 40) { g.phase = 'hold'; g.phaseT = 0; }
        } else if (g.phase === 'hold') {
          const holdFrames = 160 + Math.floor(rand(0, 120));
          if (g.phaseT >= holdFrames) { g.phase = 'out'; g.phaseT = 0; }
        } else {
          g.o = Math.max(g.o - g.maxO / 50, 0);
          if (g.o <= 0) { glyphs.splice(i, 1); continue; }
        }

        ctx!.globalAlpha = g.o;
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
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}

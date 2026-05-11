'use client';
import { useEffect, useRef } from 'react';

// ── dots ────────────────────────────────────────────────────
const DOT_COUNT  = 32;
const DOT_COLORS = ['#22d3ee','#22d3ee','#7c3aed','#a78bfa','#ffffff'];

// ── plexus ──────────────────────────────────────────────────
const LINK_DIST  = 155;   // px — max distance to draw a connecting line
const MAX_LINK_A = 0.22;  // max line opacity

// ── glyphs ──────────────────────────────────────────────────
const SYMS = ['</>','{}','[]','=>','01','//','&&','::','fn','if','0x','#!','~~','λ','<>'];
const GLYPH_COLORS = ['#22d3ee','#22d3ee','#7c3aed','#a78bfa'];
const MAX_GLYPHS  = 12;
const SPAWN_EVERY = 45;

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

function sidedX(w: number): number {
  // 78% chance to spawn in outer 24% on either side, rest anywhere
  if (Math.random() < 0.78) {
    return Math.random() < 0.5 ? rand(0, w * 0.24) : rand(w * 0.76, w);
  }
  return rand(0, w);
}

function spawnDot(w: number, h: number): Dot {
  return {
    x: sidedX(w), y: rand(0, h),
    r: rand(0.7, 1.6),
    vx: rand(-0.05, 0.05),
    vy: rand(-0.1, -0.03),
    o: rand(0.1, 0.22),
    c: pick(DOT_COLORS),
  };
}

function spawnGlyph(w: number, h: number): Glyph {
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
    sym: pick(SYMS), x, y, vx, vy,
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
    let scrollY = 0;
    let maxScroll = 1;

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

    function tick() {
      ctx!.clearRect(0, 0, W, H);
      frame++;

      // ── scroll-based visibility: show only at top (hero) and bottom (contact) ──
      const topFade    = Math.max(0, 1 - scrollY / (H * 1.1));
      const bottomFade = Math.max(0, Math.min(1, (scrollY - (maxScroll - H * 1.6)) / (H * 0.6)));
      const pageFactor = Math.max(topFade, bottomFade);

      if (pageFactor < 0.005) {
        raf = requestAnimationFrame(tick);
        return;
      }

      // ── ambient misty glow (bottom-left area, very faint) ──
      const grd = ctx!.createRadialGradient(W * 0.28, H * 0.72, 0, W * 0.28, H * 0.72, W * 0.42);
      grd.addColorStop(0, `rgba(6,182,212,${0.028 * pageFactor})`);
      grd.addColorStop(1, 'rgba(6,182,212,0)');
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = grd;
      ctx!.fillRect(0, 0, W, H);

      // ── move dots ──
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -4) { d.y = H + 4; d.x = sidedX(W); }
        if (d.x < -4)    d.x = W + 4;
        if (d.x > W + 4) d.x = -4;
      }

      // ── plexus lines between nearby dots ──
      ctx!.lineWidth = 0.55;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const midX = (dots[i].x + dots[j].x) * 0.5;
            const edgeness = Math.abs(midX / W - 0.5) * 2;
            const sideFactor = 0.1 + edgeness * 0.9;
            const alpha = (1 - dist / LINK_DIST) * MAX_LINK_A * sideFactor * pageFactor;
            if (alpha < 0.003) continue;
            ctx!.globalAlpha = alpha;
            ctx!.strokeStyle = '#22d3ee';
            ctx!.beginPath();
            ctx!.moveTo(dots[i].x, dots[i].y);
            ctx!.lineTo(dots[j].x, dots[j].y);
            ctx!.stroke();
          }
        }
      }

      // ── draw dots ──
      for (const d of dots) {
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fillStyle = d.c;
        ctx!.globalAlpha = d.o * pageFactor;
        ctx!.fill();
      }

      // ── spawn / draw glyphs ──
      if (frame % SPAWN_EVERY === 0 && glyphs.length < MAX_GLYPHS) {
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

        ctx!.globalAlpha = g.o * pageFactor;
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

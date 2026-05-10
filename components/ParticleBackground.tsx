'use client';
import { useEffect, useRef } from 'react';

const COUNT = 38;
const COLORS = ['#22d3ee', '#22d3ee', '#22d3ee', '#7c3aed', '#a78bfa', '#ffffff'];

function rand(a: number, b: number) { return Math.random() * (b - a) + a; }

interface P { x: number; y: number; r: number; vx: number; vy: number; o: number; c: string; }

function spawn(w: number, h: number): P {
  return {
    x: rand(0, w), y: rand(0, h),
    r: rand(0.9, 2.4),
    vx: rand(-0.1, 0.1),
    vy: rand(-0.22, -0.06),
    o: rand(0.12, 0.38),
    c: COLORS[Math.floor(Math.random() * COLORS.length)],
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
    let particles: P[] = [];

    function resize() {
      W = canvas!.width  = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }

    resize();
    particles = Array.from({ length: COUNT }, () => spawn(W, H));
    window.addEventListener('resize', resize);

    function tick() {
      ctx!.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4)    { p.y = H + 4; p.x = rand(0, W); }
        if (p.x < -4)    { p.x = W + 4; }
        if (p.x > W + 4) { p.x = -4;   }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = p.c;
        ctx!.globalAlpha = p.o;
        ctx!.fill();
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

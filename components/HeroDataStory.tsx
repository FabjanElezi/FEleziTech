'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/components/LanguageProvider';

// The hero's picture of the tagline "turning business data into decisions":
// a cloud of data points sorts itself into a bar chart, then a trend line, then
// the FE monogram. The logo stays for a few seconds, then the story starts
// again. A click on a step jumps straight to it.
//
// Plain 2D canvas, no libraries. It only draws while it is on screen and
// something is moving: off screen, in a background tab, and while the finished
// logo is simply being shown, nothing runs.

// FE monogram outline, taken from public/logo.svg.
const FE_PATH =
  'M229.97 50.97L229.97 63.03L192.13 63.03L192.13 50.97L229.97 50.97ZM235.31 24L235.31 35.97L187.35 35.97L187.35 90L175.38 90L175.38 30.03Q175.38 28.79 175.84 27.68Q176.30 26.58 177.11 25.75Q177.91 24.92 179.02 24.46Q180.12 24 181.41 24L181.41 24L235.31 24ZM299.23 50.97L299.23 63.03L261.45 63.03L261.45 50.97L299.23 50.97ZM304.62 78.03L304.62 90L261.45 90Q258.96 90 256.02 89.13Q253.07 88.25 250.56 86.25Q248.05 84.25 246.37 81.05Q244.69 77.85 244.69 73.20L244.69 73.20L244.69 30.03Q244.69 28.79 245.15 27.68Q245.62 26.58 246.42 25.75Q247.23 24.92 248.33 24.46Q249.44 24 250.72 24L250.72 24L304.62 24L304.62 35.97L256.66 35.97L256.66 73.20Q256.66 75.55 257.90 76.79Q259.15 78.03 261.54 78.03L261.54 78.03L304.62 78.03Z';
const FE_BOX = { x: 175.38, y: 24, w: 129.24, h: 66 };

// hold: how long a step stays before the next one starts. After the last one the story starts over.
const PHASES = [
  { key: 'raw', hold: 1700, wobble: 8 },
  { key: 'bars', hold: 3200, wobble: 0.7 },
  { key: 'line', hold: 3200, wobble: 0.7 },
  { key: 'fe', hold: 6000, wobble: 0.5 },
] as const;
type PhaseKey = (typeof PHASES)[number]['key'];
const LAST = PHASES.length - 1;
const SETTLE_MS = 3200;   // keep drawing this long after the last change, then pause until the next step

const BARS = [0.3, 0.46, 0.38, 0.58, 0.52, 0.74, 0.94];
const LINE = [0.16, 0.28, 0.24, 0.42, 0.37, 0.58, 0.54, 0.78, 0.93];
// Dot colours from bright to deep. Dark page: light adds up. Light page: ink on paper.
const PALETTE_DARK = ['#f0fdff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490'];
const PALETTE_LIGHT = ['#083344', '#0b3b4a', '#0c4a5e', '#0e5a70', '#0e7490', '#0e7490', '#0891b2', '#0891b2'];

type Target = { x: number; y: number; a: number; s: number; c: number };
type Dot = {
  x: number; y: number; vx: number; vy: number;
  tx: number; ty: number; a: number; ta: number; s: number; ts: number; c: number; tc: number;
  nx: number; ny: number; na: number; ns: number; nc: number; t0: number; pending: boolean; phase: number;
};
type Box = { x: number; y: number; w: number; h: number };

const rnd = (a = 1) => Math.random() * a;
const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Dots on an even grid inside a shape. `test` returns 0 outside, or a value kept as `a`. */
function gridFill(count: number, box: Box, test: (x: number, y: number) => number): { x: number; y: number; a: number }[] {
  let hits = 0;
  const sx = box.w / 64, sy = box.h / 64;
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) if (test(box.x + (x + 0.5) * sx, box.y + (y + 0.5) * sy)) hits++;
  let d = Math.sqrt((hits * sx * sy) / count) || 4;
  const out: { x: number; y: number; a: number }[] = [];
  for (let tries = 0; tries < 7; tries++) {
    out.length = 0;
    for (let y = box.y + d / 2; y < box.y + box.h; y += d)
      for (let x = box.x + d / 2; x < box.x + box.w; x += d) {
        const a = test(x, y);
        if (a) out.push({ x, y, a });
      }
    if (out.length >= count && out.length < count * 1.1) break;
    d *= Math.sqrt((out.length || 1) / count);
  }
  while (out.length > count) out.splice((Math.random() * out.length) | 0, 1);
  while (out.length < count) {
    const p = out[(Math.random() * out.length) | 0] ?? { x: box.x + box.w / 2, y: box.y + box.h / 2, a: 0.5 };
    out.push({ x: p.x + gauss() * 2, y: p.y + gauss() * 2, a: p.a });
  }
  return out;
}

/** Smooth curve through LINE; x and the result are 0..1. */
function curveY(x: number) {
  const n = LINE.length - 1, f = clamp(x * n, 0, n - 1e-6), i = Math.floor(f), t = f - i;
  const p0 = LINE[Math.max(0, i - 1)], p1 = LINE[i], p2 = LINE[i + 1], p3 = LINE[Math.min(n, i + 2)];
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
}

function shape(key: PhaseKey, K: number, R: Box): Target[] {
  const base = R.y + R.h;
  if (key === 'raw') {
    return Array.from({ length: K }, () => ({
      x: R.x + R.w * (0.5 + 0.56 * gauss()), y: R.y + R.h * (0.5 + 0.62 * gauss()), a: 0.22 + rnd(0.5), s: 1 + rnd(1.3), c: rnd(),
    }));
  }
  if (key === 'bars') {
    const k = BARS.length, slot = R.w / k, bw = slot * 0.6, axis = Math.round(K * 0.04);
    const pts: Target[] = gridFill(K - axis, R, (x, y) => {
      const b = Math.floor((x - R.x) / slot);
      if (b < 0 || b >= k) return 0;
      const bx = R.x + b * slot + (slot - bw) / 2;
      return x >= bx && x <= bx + bw && y >= base - BARS[b] * R.h && y <= base ? 1 + b : 0;
    }).map((p) => {
      const b = (p.a - 1) / (k - 1);   // later bars are brighter: the eye follows the growth
      return { x: p.x, y: p.y, a: 0.62 + 0.38 * b, s: 2, c: 0.74 - 0.62 * b };
    });
    for (let i = 0; i < axis; i++) pts.push({ x: R.x + ((i + 0.5) / axis) * R.w, y: base + 8, a: 0.28, s: 1.4, c: 0.6 });
    return pts;
  }
  if (key === 'line') {
    const out: Target[] = [], yAt = (x: number) => base - curveY((x - R.x) / R.w) * R.h;
    const nLine = Math.round(K * 0.3), per = 14, axis = Math.round(K * 0.04), nArea = K - nLine - LINE.length * per - axis;
    for (let i = 0; i < nLine; i++) {
      const x = R.x + ((i + 0.5) / nLine) * R.w;
      out.push({ x, y: yAt(x) + (i % 2 ? 1.5 : -1.5), a: 1, s: 1.9, c: 0.25 });
    }
    LINE.forEach((v, j) => {
      const x = R.x + (j / (LINE.length - 1)) * R.w, y = base - v * R.h;
      for (let i = 0; i < per; i++) {
        const an = (i / per) * Math.PI * 2;
        out.push({ x: x + Math.cos(an) * 5.5, y: y + Math.sin(an) * 5.5, a: 1, s: 1.6, c: 0 });
      }
    });
    for (let i = 0; i < axis; i++) out.push({ x: R.x + ((i + 0.5) / axis) * R.w, y: base + 8, a: 0.28, s: 1.4, c: 0.6 });
    gridFill(nArea, R, (x, y) => {
      const top = yAt(x) + 10;
      return y > top && y < base ? 0.06 + 0.3 * (1 - (y - top) / (base - top + 1)) : 0;
    }).forEach((p) => out.push({ x: p.x, y: p.y, a: p.a, s: 1.4, c: 0.8 }));
    return out;
  }
  // 'fe': the monogram, sampled from its outline
  const w = Math.max(2, Math.round(R.w)), h = Math.max(2, Math.round(R.h));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  if (!g) return shape('raw', K, R);
  const k = Math.min((w * 0.94) / FE_BOX.w, (h * 0.86) / FE_BOX.h);
  g.translate(w / 2 - (FE_BOX.x + FE_BOX.w / 2) * k, h / 2 - (FE_BOX.y + FE_BOX.h / 2) * k);
  g.scale(k, k);
  g.fillStyle = '#fff';
  g.fill(new Path2D(FE_PATH));
  const data = g.getImageData(0, 0, w, h).data;
  return gridFill(K, R, (x, y) => {
    const ix = Math.round(x - R.x), iy = Math.round(y - R.y);
    return ix >= 0 && iy >= 0 && ix < w && iy < h && data[(iy * w + ix) * 4 + 3] > 128 ? 1 : 0;
  }).map((p) => {
    const d = ((p.x - R.x) / R.w + (p.y - R.y) / R.h) / 2;   // the logo's gradient, top-left to bottom-right
    return { x: p.x, y: p.y, a: 0.95, s: 2.1, c: 0.1 + 0.7 * d };
  });
}

export default function HeroDataStory({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  const { t } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const goRef = useRef<(i: number) => void>(() => {});
  // `run` restarts the progress line under the active step, even when the same step is chosen again.
  const [step, setStep] = useState<{ phase: number; run: number }>({ phase: 0, run: 0 });

  useEffect(() => {
    const root = rootRef.current, plot = plotRef.current, canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!root || !plot || !canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let light = document.documentElement.getAttribute('data-theme') === 'light';

    let W = 0, H = 0, R: Box = { x: 0, y: 0, w: 1, h: 1 };
    let dots: Dot[] = [], ambient = 0;
    let phase = 0, phaseAt = 0, grid = 0, halo = 0;
    let mx = -9999, my = -9999;
    let raf = 0, timer = 0, last = 0, lastActivity = 0, onScreen = false, everSeen = false, disposed = false;

    // The three chart shapes are worked out once per size and reused on every loop.
    // Each one is prepared in a quiet moment before it is needed, so a step never starts with a hitch.
    const shapes = new Map<PhaseKey, Target[]>();
    function targetsFor(key: PhaseKey): Target[] {
      const K = dots.length - ambient;
      if (key === 'raw') return shape('raw', K, R).sort((a, b) => a.x - b.x);
      let found = shapes.get(key);
      if (!found) { found = shape(key, K, R).sort((a, b) => a.x - b.x); shapes.set(key, found); }
      return found;
    }
    const whenIdle = (fn: () => void) => {
      // Safari has no requestIdleCallback; a short timer does the same job there.
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(fn, { timeout: 1200 }); else setTimeout(fn, 600);
    };

    // soft glow sprite, drawn under every few dots on the dark page
    const glow = document.createElement('canvas');
    glow.width = glow.height = 48;
    const gg = glow.getContext('2d');
    if (gg) {
      const rg = gg.createRadialGradient(24, 24, 0, 24, 24, 24);
      rg.addColorStop(0, 'rgba(103,232,249,0.55)');
      rg.addColorStop(0.4, 'rgba(34,211,238,0.16)');
      rg.addColorStop(1, 'rgba(34,211,238,0)');
      gg.fillStyle = rg; gg.fillRect(0, 0, 48, 48);
    }

    function layout() {
      const w = plot!.clientWidth, h = plot!.clientHeight;
      if (!w || !h || (w === W && h === H)) return false;
      W = w; H = h;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = Math.round(W * dpr); canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = { x: W * 0.06, y: H * 0.08, w: W * 0.88, h: H * 0.78 };
      shapes.clear();
      const n = clamp(Math.round((W * H) / 105), 620, 2200);
      if (n !== dots.length) {
        ambient = Math.round(n * 0.1);
        dots = Array.from({ length: n }, () => ({
          x: rnd(W), y: rnd(H), vx: 0, vy: 0, tx: 0, ty: 0, a: 0, ta: 0, s: 1.5, ts: 1.5, c: 0.5, tc: 0.5,
          nx: 0, ny: 0, na: 0, ns: 1.5, nc: 0.5, t0: 0, pending: false, phase: rnd(6.28),
        }));
      }
      return true;
    }

    function go(i: number, instant = false) {
      window.clearTimeout(timer); timer = 0;
      phase = clamp(i, 0, LAST);
      phaseAt = performance.now();
      const K = dots.length - ambient;
      const targets = targetsFor(PHASES[phase].key);
      const upNext = PHASES[(phase + 1) % PHASES.length].key;
      whenIdle(() => { if (!disposed) targetsFor(upNext); });
      const order: number[] = [];
      for (let j = ambient; j < dots.length; j++) order.push(j);
      order.sort((a, b) => dots[a].x - dots[b].x);
      for (let r = 0; r < K; r++) {   // left-to-right wave, so the cloud flows instead of crossing itself
        const p = dots[order[r]], tg = targets[r];
        p.nx = tg.x; p.ny = tg.y; p.na = tg.a; p.ns = tg.s; p.nc = tg.c;
        p.t0 = phaseAt + (r / K) * 520 + rnd(260); p.pending = true;
      }
      for (let j = 0; j < ambient; j++) {   // a few points keep drifting around the chart
        const p = dots[j];
        p.nx = rnd(W); p.ny = rnd(H); p.na = 0.08 + rnd(0.2); p.ns = 1 + rnd(1); p.nc = 0.5 + rnd(0.5);
        p.t0 = phaseAt + rnd(900); p.pending = true;
      }
      if (instant) {
        for (const p of dots) {
          p.tx = p.x = p.nx; p.ty = p.y = p.ny; p.a = p.ta = p.na; p.s = p.ts = p.ns; p.c = p.tc = p.nc;
          p.vx = p.vy = 0; p.pending = false;
        }
      }
      setStep((s) => ({ phase, run: s.run + 1 }));
      wake();
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, W, H);
      const base = R.y + R.h;

      // the monogram glows once it has formed
      halo += ((phase === LAST && now - phaseAt > 500 ? 1 : 0) - halo) * (reduced ? 1 : 0.04);
      if (halo > 0.01 && !light) {
        // an ellipse that fades out before the canvas ends, so no edge shows
        const rg = ctx!.createRadialGradient(0, 0, 0, 0, 0, H * 0.5);
        rg.addColorStop(0, `rgba(34,211,238,${0.13 * halo})`);
        rg.addColorStop(1, 'rgba(34,211,238,0)');
        ctx!.save(); ctx!.translate(W / 2, R.y + R.h / 2); ctx!.scale(W / H, 1);
        ctx!.fillStyle = rg; ctx!.fillRect(-H, -H, H * 2, H * 2);
        ctx!.restore();
      }
      // faint chart grid behind the bars and the trend line
      const wantGrid = (phase === 1 || phase === 2) && now - phaseAt > 350 ? 1 : 0;
      grid += (wantGrid - grid) * (reduced ? 1 : 0.06);
      if (grid > 0.01) {
        ctx!.lineWidth = 1;
        ctx!.strokeStyle = light ? `rgba(15,23,42,${0.09 * grid})` : `rgba(148,163,184,${0.09 * grid})`;
        for (let i = 1; i <= 4; i++) {
          const y = Math.round(base - (i / 4) * R.h) + 0.5;
          ctx!.beginPath(); ctx!.moveTo(R.x, y); ctx!.lineTo(R.x + R.w, y); ctx!.stroke();
        }
        if (phase === 2 && !reduced) {   // ping on the latest value
          const k = (now % 1800) / 1800;
          ctx!.strokeStyle = light ? `rgba(14,116,144,${(1 - k) * 0.6 * grid})` : `rgba(165,243,252,${(1 - k) * 0.7 * grid})`;
          ctx!.lineWidth = 1.5;
          ctx!.beginPath(); ctx!.arc(R.x + R.w, base - LINE[LINE.length - 1] * R.h, 7 + k * 24, 0, 7); ctx!.stroke();
        }
      }

      const palette = light ? PALETTE_LIGHT : PALETTE_DARK;
      ctx!.globalCompositeOperation = light ? 'source-over' : 'lighter';
      for (let i = 0; i < dots.length; i++) {
        const p = dots[i];
        const sz = light ? p.s * 1.12 : p.s;
        ctx!.globalAlpha = light ? Math.min(1, p.a * 1.3) : p.a;
        ctx!.fillStyle = palette[clamp(Math.round(p.c * 7), 0, 7)];
        ctx!.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
        if (!light && i % 5 === 0) { ctx!.globalAlpha = p.a * 0.5; ctx!.drawImage(glow, p.x - 9, p.y - 9, 18, 18); }
      }
      ctx!.globalAlpha = 1; ctx!.globalCompositeOperation = 'source-over';
    }

    function frame(now: number) {
      raf = 0;
      const dt = Math.min(2.2, (now - last) / 16.667); last = now;
      if (now - phaseAt > PHASES[phase].hold) go(phase === LAST ? 0 : phase + 1);

      const wobble = PHASES[phase].wobble, t = now / 1000, damp = Math.pow(0.76, dt);
      for (let i = 0; i < dots.length; i++) {
        const p = dots[i];
        if (p.pending && now >= p.t0) { p.tx = p.nx; p.ty = p.ny; p.ta = p.na; p.ts = p.ns; p.tc = p.nc; p.pending = false; }
        const w = i < ambient ? 12 : wobble;
        const gx = p.tx + Math.sin(t * 0.9 + p.phase) * w, gy = p.ty + Math.cos(t * 0.7 + p.phase * 1.3) * w;
        p.vx = (p.vx + (gx - p.x) * 0.02 * dt) * damp; p.vy = (p.vy + (gy - p.y) * 0.02 * dt) * damp;
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 10000) {   // the cursor pushes points aside
          const d = Math.sqrt(d2) || 1, f = 1 - d / 100;
          p.vx += (dx / d) * f * f * 3 * dt; p.vy += (dy / d) * f * f * 3 * dt;
        }
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.a += (p.ta - p.a) * 0.06 * dt; p.s += (p.ts - p.s) * 0.06 * dt; p.c += (p.tc - p.c) * 0.05 * dt;
      }
      draw(now);

      // Keep drawing while the story runs or something changed recently. Once the logo has
      // settled there is nothing to draw, so wait with a timer until it is time to start over.
      if (phase < LAST || now - lastActivity < SETTLE_MS) start();
      else if (!timer) timer = window.setTimeout(() => { timer = 0; wake(); }, Math.max(0, phaseAt + PHASES[LAST].hold - now));
    }

    function start() {
      if (raf || reduced || !onScreen || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() { cancelAnimationFrame(raf); raf = 0; window.clearTimeout(timer); timer = 0; }
    function wake() {
      lastActivity = performance.now();
      if (reduced) draw(lastActivity); else start();
    }

    goRef.current = (i: number) => go(i, reduced);

    const onMove = (e: PointerEvent) => {
      const r = plot.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      wake();
    };
    const onLeave = () => { mx = my = -9999; wake(); };
    const onVisibility = () => { if (document.hidden) stop(); else wake(); };
    plot.addEventListener('pointermove', onMove);
    plot.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    const resize = new ResizeObserver(() => { if (layout()) go(phase, true); });
    resize.observe(plot);

    const theme = new MutationObserver(() => {
      light = document.documentElement.getAttribute('data-theme') === 'light';
      wake();
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const seen = new IntersectionObserver(([entry]) => {
      const now = performance.now();
      if (entry.isIntersecting) {
        onScreen = true;
        if (!everSeen) { everSeen = true; phaseAt = now; }   // start the clock when it is first seen
        wake();   // if the logo's time ran out while it was off screen, the next frame starts the story again
      } else {
        onScreen = false; stop();
      }
    }, { threshold: 0.15 });
    seen.observe(root);

    layout();
    if (reduced) {
      go(LAST, true);
    } else {
      go(0, true);
      for (const p of dots) p.a = 0;   // fade in instead of popping in
    }

    return () => {
      disposed = true;
      stop();
      resize.disconnect(); theme.disconnect(); seen.disconnect();
      plot.removeEventListener('pointermove', onMove);
      plot.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const labels = [t('hero.step1'), t('hero.step2'), t('hero.step3'), t('hero.step4')];

  return (
    <div ref={rootRef} className={`ds ${className}`} style={style}>
      <div ref={plotRef} className="ds-plot" role="img" aria-label={t('hero.storyLabel')}>
        <canvas ref={canvasRef} aria-hidden />
      </div>
      <ol className="ds-steps">
        {labels.map((label, i) => (
          <li key={i}>
            <button
              key={i === step.phase ? `on-${step.run}` : 'off'}
              type="button"
              className={`ds-step${i === step.phase ? ' is-on' : i < step.phase ? ' is-done' : ''}`}
              style={{ '--ds-hold': `${PHASES[i].hold}ms` } as React.CSSProperties}
              aria-current={i === step.phase ? 'step' : undefined}
              onClick={() => goRef.current(i)}
            >
              <b>0{i + 1}</b>
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

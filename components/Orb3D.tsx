'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * An interactive 3D wireframe sphere, drawn on a plain canvas — no 3D library,
 * so it costs nothing in bundle size and matches the plexus background.
 *
 * Drag to spin it, hover to light up the nodes nearest the cursor, click to send
 * a ripple across the surface.
 */

type V3 = [number, number, number];

const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Icosphere: an icosahedron subdivided `times`, as vertices plus unique edges. */
function icosphere(times: number) {
  const t = (1 + Math.sqrt(5)) / 2;
  let verts: V3[] = ([
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ] as V3[]).map(norm);

  // The 20 faces are the vertex triples that are all one edge-length apart.
  let min = Infinity;
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) min = Math.min(min, dist(verts[i], verts[j]));
  const near = (a: V3, b: V3) => Math.abs(dist(a, b) - min) < 1e-6;

  let faces: [number, number, number][] = [];
  for (let a = 0; a < verts.length; a++)
    for (let b = a + 1; b < verts.length; b++)
      for (let c = b + 1; c < verts.length; c++)
        if (near(verts[a], verts[b]) && near(verts[b], verts[c]) && near(verts[a], verts[c]))
          faces.push([a, b, c]);

  // Split every face into four, pushing the new midpoints out onto the sphere.
  for (let pass = 0; pass < times; pass++) {
    const key = (v: V3) => v.map((n) => n.toFixed(5)).join(',');
    const index = new Map<string, number>();
    const out: V3[] = [];
    const add = (v: V3) => {
      const k = key(v);
      const hit = index.get(k);
      if (hit !== undefined) return hit;
      index.set(k, out.length);
      out.push(v);
      return out.length - 1;
    };
    verts.forEach(add);
    const nextFaces: [number, number, number][] = [];
    for (const [a, b, c] of faces) {
      const ab = add(norm([(verts[a][0] + verts[b][0]) / 2, (verts[a][1] + verts[b][1]) / 2, (verts[a][2] + verts[b][2]) / 2]));
      const bc = add(norm([(verts[b][0] + verts[c][0]) / 2, (verts[b][1] + verts[c][1]) / 2, (verts[b][2] + verts[c][2]) / 2]));
      const ca = add(norm([(verts[c][0] + verts[a][0]) / 2, (verts[c][1] + verts[a][1]) / 2, (verts[c][2] + verts[a][2]) / 2]));
      nextFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    verts = out;
    faces = nextFaces;
  }

  const seen = new Set<string>();
  const edges: [number, number][] = [];
  for (const [a, b, c] of faces) {
    for (const [p, q] of [[a, b], [b, c], [c, a]] as [number, number][]) {
      const k = p < q ? `${p}-${q}` : `${q}-${p}`;
      if (!seen.has(k)) { seen.add(k); edges.push([p, q]); }
    }
  }
  return { verts, edges };
}

const { verts: VERTS, edges: EDGES } = icosphere(1); // 42 nodes, 120 edges

export default function Orb3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.width; h = box.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Theme: the site writes data-theme="light" on <html>.
    let light = document.documentElement.getAttribute('data-theme') === 'light';
    const themeWatch = new MutationObserver(() => {
      light = document.documentElement.getAttribute('data-theme') === 'light';
    });
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Rotation, with momentum after a drag.
    let ax = -0.35, ay = 0.4, vax = 0, vay = 0;
    let dragging = false, downAt = 0, moved = 0;
    let px = 0, py = 0;            // last pointer position, canvas space
    let hover = false;
    let ripple = 0, rippleDir: V3 = [0, 0, 1];

    const toLocal = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      return { x: e.clientX - box.left, y: e.clientY - box.top };
    };

    const onDown = (e: PointerEvent) => {
      const p = toLocal(e);
      dragging = true; downAt = Date.now(); moved = 0;
      px = p.x; py = p.y;
      vax = vay = 0;
      canvas.setPointerCapture(e.pointerId);
      setTouched(true);
    };

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      hover = true;
      if (dragging) {
        const dx = p.x - px, dy = p.y - py;
        moved += Math.abs(dx) + Math.abs(dy);
        vay += dx * 0.00035;
        vax -= dy * 0.00035;
        ay += dx * 0.006;
        ax -= dy * 0.006;
      }
      px = p.x; py = p.y;
    };

    const onUp = () => {
      // A tap rather than a drag sends a ripple from where it landed.
      if (dragging && moved < 8 && Date.now() - downAt < 400) {
        const r = Math.min(w, h) * 0.33;
        const nx = (px - w / 2) / r, ny = (py - h / 2) / r;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        // Unproject into the sphere's own frame, so the ripple starts under the finger.
        const ca = Math.cos(-ax), sa = Math.sin(-ax);
        const cb = Math.cos(-ay), sb = Math.sin(-ay);
        const y1 = ny * ca - nz * sa, z1 = ny * sa + nz * ca;
        rippleDir = norm([nx * cb + z1 * sb, y1, -nx * sb + z1 * cb]);
        ripple = 1;
        setTouched(true);
      }
      dragging = false;
    };

    const onLeave = () => { hover = false; dragging = false; };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onLeave);
    canvas.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', resize);

    // Only animate while on screen and while the tab is visible.
    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.05 });
    io.observe(canvas);

    const screen = new Array(VERTS.length).fill(null).map(() => ({ x: 0, y: 0, z: 0, lit: 0 }));
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden) return;

      if (!dragging) {
        ax += vax; ay += vay;
        vax *= 0.94; vay *= 0.94;
        if (!calm) ay += 0.0022;              // gentle idle spin
      }
      if (ripple > 0) ripple = Math.max(0, ripple - dt * 1.15);

      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.33;
      const F = 3.4;

      const cosx = Math.cos(ax), sinx = Math.sin(ax);
      const cosy = Math.cos(ay), siny = Math.sin(ay);

      for (let i = 0; i < VERTS.length; i++) {
        let [x, y, z] = VERTS[i];

        // Ripple: push the surface out along itself, strongest where it was tapped.
        if (ripple > 0) {
          const d = x * rippleDir[0] + y * rippleDir[1] + z * rippleDir[2];
          const wave = Math.sin((1 - d) * 5 - (1 - ripple) * 9) * 0.17 * ripple * ripple;
          x += x * wave; y += y * wave; z += z * wave;
        }

        // Rotate: around Y, then X.
        const x1 = x * cosy + z * siny;
        const z1 = -x * siny + z * cosy;
        const y2 = y * cosx - z1 * sinx;
        const z2 = y * sinx + z1 * cosx;

        const k = F / (F - z2);
        const s = screen[i];
        s.x = cx + x1 * R * k;
        s.y = cy + y2 * R * k;
        s.z = z2;
        s.lit = 0;
      }

      // Nodes near the cursor light up.
      if (hover && !calm) {
        for (const s of screen) {
          const d = Math.hypot(s.x - px, s.y - py);
          if (d < 90) s.lit = 1 - d / 90;
        }
      }

      ctx.clearRect(0, 0, w, h);

      const line = light ? '14,116,144' : '34,211,238';
      const dot = light ? '8,145,178' : '103,232,249';

      // Edges, dimmer the further back they sit.
      ctx.lineWidth = 1;
      for (const [a, b] of EDGES) {
        const p = screen[a], q = screen[b];
        const depth = (p.z + q.z) / 2;
        const alpha = (0.1 + ((depth + 1) / 2) * 0.42) * (light ? 0.85 : 1);
        const glow = Math.max(p.lit, q.lit);
        ctx.strokeStyle = `rgba(${line},${(alpha + glow * 0.5).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }

      // Nodes.
      for (const s of screen) {
        const front = (s.z + 1) / 2;
        const r = (1.1 + front * 1.9) * (1 + s.lit * 1.3);
        ctx.fillStyle = `rgba(${dot},${(0.22 + front * 0.6 + s.lit * 0.35).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (s.lit > 0.35) {
          ctx.fillStyle = `rgba(${dot},${(s.lit * 0.1).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Core glow.
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.85);
      core.addColorStop(0, `rgba(${line},${light ? 0.1 : 0.14})`);
      core.addColorStop(1, 'transparent');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.85, 0, Math.PI * 2);
      ctx.fill();
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      themeWatch.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onLeave);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center" data-track="3D orb">
      <canvas
        ref={canvasRef}
        className="w-full max-w-[460px] cursor-grab active:cursor-grabbing"
        style={{ height: 320, touchAction: 'pan-y' }}
        aria-label="Interactive 3D wireframe sphere"
      />
      <p
        className="text-xs text-slate-500 transition-opacity duration-700 mt-1"
        style={{ opacity: touched ? 0 : 1 }}
      >
        Drag to spin · tap it to send a ripple
      </p>
    </div>
  );
}

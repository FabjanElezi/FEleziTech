'use client';
import { useEffect, useRef, useState } from 'react';
import { Skill } from '@/types';

/**
 * An interactive 3D wireframe sphere, drawn on a plain canvas — no 3D library,
 * so it costs nothing in bundle size and matches the plexus background.
 *
 * Some of its nodes carry a real skill. Drag to spin, hover to light up the
 * nodes nearest the cursor, click a skill node and the sphere turns to bring it
 * to the front, tap empty space for a ripple, double-click to blow it apart.
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
      const mid = (p: V3, q: V3): V3 => norm([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2]);
      const ab = add(mid(verts[a], verts[b]));
      const bc = add(mid(verts[b], verts[c]));
      const ca = add(mid(verts[c], verts[a]));
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

/** Vertices spread as far from each other as possible, so labels never crowd. */
const SPREAD = (() => {
  const chosen = [0];
  while (chosen.length < 18) {
    let best = -1, bestD = -1;
    for (let i = 0; i < VERTS.length; i++) {
      if (chosen.includes(i)) continue;
      let d = Infinity;
      for (const c of chosen) d = Math.min(d, dist(VERTS[i], VERTS[c]));
      if (d > bestD) { bestD = d; best = i; }
    }
    chosen.push(best);
  }
  return chosen;
})();

// A stable wobble per node, for the shatter.
const JITTER = VERTS.map((_, i) => 0.55 + ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * 0.9);

const CATEGORY: Record<string, string> = {
  technical: 'Technical',
  language: 'Language',
  tool: 'Tool',
};

interface Props { skills?: Skill[] }

export default function Orb3D({ skills = [] }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [touched, setTouched] = useState(false);
  const [selected, setSelected] = useState<Skill | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Which vertex carries which skill.
    // Technical skills get a node first, then tools, then languages — so the
    // ones that matter most are never the ones that get cut.
    const RANK: Record<string, number> = { technical: 0, tool: 1, language: 2 };
    const picked = [...skills]
      .sort((a, b) => (RANK[a.category] ?? 3) - (RANK[b.category] ?? 3) || a.order - b.order)
      .slice(0, SPREAD.length);
    const nodeSkill = new Map<number, Skill>();
    picked.forEach((s, i) => nodeSkill.set(SPREAD[i], s));

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
    let targetAx: number | null = null, targetAy = 0;
    let dragging = false, downAt = 0, moved = 0;
    let px = 0, py = 0;            // last pointer position, canvas space
    let hover = false;
    let hoverIdx = -1, selectedIdx = -1;
    let ripple = 0, rippleDir: V3 = [0, 0, 1];
    let shatter = 0;

    // Soft-body bulge towards the cursor, one eased value per node.
    const bulge = VERTS.map(() => 0);

    // Idle showcase: with nobody touching it, the sphere presents the skills itself.
    let lastTouch = performance.now();
    let autoAt = -1, autoShowing = false, holdUntil = 0;

    const toLocal = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      return { x: e.clientX - box.left, y: e.clientY - box.top };
    };

    /** Where the cursor points, in the sphere's own frame; null if it misses. */
    const localDir = (sx: number, sy: number, ax: number, ay: number, R: number): V3 | null => {
      const nx = (sx - w / 2) / R, ny = (sy - h / 2) / R;
      if (nx * nx + ny * ny > 1) return null;
      const nz = Math.sqrt(1 - nx * nx - ny * ny);
      const ca = Math.cos(-ax), sa = Math.sin(-ax);
      const cb = Math.cos(-ay), sb = Math.sin(-ay);
      const y1 = ny * ca - nz * sa, z1 = ny * sa + nz * ca;
      return norm([nx * cb + z1 * sb, y1, -nx * sb + z1 * cb]);
    };

    /** Anything the visitor does stops the idle showcase. */
    const interacted = () => {
      lastTouch = performance.now();
      if (autoShowing) {
        autoShowing = false;
        selectedIdx = -1;
        setSelected(null);
      }
    };

    /** Turn the sphere so this vertex faces the viewer. */
    const faceVertex = (i: number) => {
      const [x, y, z] = VERTS[i];
      const ty = Math.atan2(-x, z);
      const tx = Math.atan2(y, Math.hypot(x, z));
      // Shortest way round from where we are now.
      const wrap = (from: number, to: number) => from + Math.atan2(Math.sin(to - from), Math.cos(to - from));
      targetAy = wrap(ay, ty);
      targetAx = wrap(ax, tx);
      vax = vay = 0;
    };

    const onDown = (e: PointerEvent) => {
      const p = toLocal(e);
      interacted();
      dragging = true; downAt = Date.now(); moved = 0;
      px = p.x; py = p.y;
      vax = vay = 0;
      targetAx = null;
      canvas.setPointerCapture(e.pointerId);
      setTouched(true);
    };

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      hover = true;
      interacted();
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
      // A tap rather than a drag: pick a skill, or send a ripple.
      if (dragging && moved < 8 && Date.now() - downAt < 400) {
        if (hoverIdx >= 0 && nodeSkill.has(hoverIdx)) {
          selectedIdx = selectedIdx === hoverIdx ? -1 : hoverIdx;
          setSelected(selectedIdx >= 0 ? nodeSkill.get(selectedIdx) ?? null : null);
          if (selectedIdx >= 0) faceVertex(selectedIdx);
        } else {
          selectedIdx = -1;
          setSelected(null);
          rippleDir = localDir(px, py, ax, ay, Math.min(w, h) * 0.33) ?? rippleDir;
          ripple = 1;
        }
        setTouched(true);
      }
      dragging = false;
    };

    const onLeave = () => { hover = false; dragging = false; hoverIdx = -1; };
    const onDouble = () => { interacted(); shatter = 1; setTouched(true); };

    const onKey = (e: KeyboardEvent) => {
      interacted();
      const step = 0.22;
      if (e.key === 'ArrowLeft') { ay -= step; targetAx = null; }
      else if (e.key === 'ArrowRight') { ay += step; targetAx = null; }
      else if (e.key === 'ArrowUp') { ax -= step; targetAx = null; }
      else if (e.key === 'ArrowDown') { ax += step; targetAx = null; }
      else if (e.key === 'Enter' || e.key === ' ') {
        // Step through the skills one at a time.
        const keys = [...nodeSkill.keys()];
        if (!keys.length) return;
        const at = keys.indexOf(selectedIdx);
        selectedIdx = keys[(at + 1) % keys.length];
        setSelected(nodeSkill.get(selectedIdx) ?? null);
        faceVertex(selectedIdx);
      } else return;
      e.preventDefault();
      setTouched(true);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onLeave);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('dblclick', onDouble);
    canvas.addEventListener('keydown', onKey);
    window.addEventListener('resize', resize);

    // Only animate while on screen and while the tab is visible.
    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.05 });
    io.observe(canvas);

    const screen = VERTS.map(() => ({ x: 0, y: 0, z: 0, lit: 0 }));
    let raf = 0;
    let last = performance.now();

    const chip = (text: string, x: number, y: number, strong: boolean) => {
      ctx.font = '600 12px ui-sans-serif, system-ui, -apple-system, sans-serif';
      const pad = 7;
      const tw = ctx.measureText(text).width;
      const bw = tw + pad * 2, bh = 21;
      // Keep the label inside the canvas: on a narrow screen a long skill name
      // would otherwise run off the edge and be cut in half.
      const right = x + 12;
      const bx = right + bw <= w - 4 ? right : Math.max(4, Math.min(x - 12 - bw, w - bw - 4));
      const by = Math.max(2, Math.min(y - 10, h - bh - 2));
      const leaderX = bx > x ? bx : bx + bw;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 7);
      else ctx.rect(bx, by, bw, bh);
      ctx.fillStyle = light
        ? `rgba(255,255,255,${strong ? 0.95 : 0.8})`
        : `rgba(7,11,18,${strong ? 0.92 : 0.75})`;
      ctx.fill();
      ctx.strokeStyle = light
        ? `rgba(8,145,178,${strong ? 0.5 : 0.28})`
        : `rgba(34,211,238,${strong ? 0.55 : 0.28})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = light ? '#0e7490' : '#a5f3fc';
      ctx.fillText(text, bx + pad, by + 14);
      // little leader line back to the node
      ctx.strokeStyle = light ? 'rgba(8,145,178,0.35)' : 'rgba(34,211,238,0.35)';
      ctx.beginPath();
      ctx.moveTo(x + (bx > x ? 3 : -3), y);
      ctx.lineTo(leaderX, by + bh / 2);
      ctx.stroke();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden) return;

      if (targetAx !== null) {
        // Glide towards the chosen skill.
        ax += (targetAx - ax) * Math.min(1, dt * 6);
        ay += (targetAy - ay) * Math.min(1, dt * 6);
        if (Math.abs(targetAx - ax) < 0.002 && Math.abs(targetAy - ay) < 0.002) targetAx = null;
      } else if (!dragging) {
        ax += vax; ay += vay;
        vax *= 0.94; vay *= 0.94;
        if (!calm && selectedIdx < 0) ay += 0.0022;   // gentle idle spin
      }
      if (ripple > 0) ripple = Math.max(0, ripple - dt * 1.15);
      if (shatter > 0) shatter = Math.max(0, shatter - dt * 1.4);

      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.33;
      const F = 3.4;

      // Nobody has touched it for a while: walk through the skills on its own.
      if (!calm && nodeSkill.size > 0 && now - lastTouch > 6000 && now > holdUntil && targetAx === null) {
        const keys = [...nodeSkill.keys()];
        autoAt = (autoAt + 1) % keys.length;
        selectedIdx = keys[autoAt];
        autoShowing = true;
        setSelected(nodeSkill.get(selectedIdx) ?? null);
        faceVertex(selectedIdx);
        holdUntil = now + 3800;
      }

      // Soft body: the surface swells towards the cursor and relaxes when it leaves.
      const pull = hover && !calm ? localDir(px, py, ax, ay, R) : null;
      for (let i = 0; i < VERTS.length; i++) {
        let target = 0;
        if (pull) {
          const d = VERTS[i][0] * pull[0] + VERTS[i][1] * pull[1] + VERTS[i][2] * pull[2];
          const t = Math.max(0, (d - 0.3) / 0.7);
          target = t * t * (3 - 2 * t);          // smoothstep, so there is no hard edge
        }
        bulge[i] += (target - bulge[i]) * Math.min(1, dt * 9);
      }

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
        // Soft body: push this node out towards the cursor.
        if (bulge[i] > 0.002) {
          const b = bulge[i] * 0.28;
          x += x * b; y += y * b; z += z * b;
        }
        // Shatter: everything flies out, then springs home.
        if (shatter > 0) {
          const out = shatter * shatter * JITTER[i] * 0.42;  // stays inside the frame
          x += x * out; y += y * out; z += z * out;
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

      // Nodes near the cursor light up; the nearest skill node becomes the target.
      hoverIdx = -1;
      if (hover && !calm) {
        let bestD = 34;
        for (let i = 0; i < screen.length; i++) {
          const s = screen[i];
          const d = Math.hypot(s.x - px, s.y - py);
          if (d < 90) s.lit = 1 - d / 90;
          if (nodeSkill.has(i) && s.z > -0.2 && d < bestD) { bestD = d; hoverIdx = i; }
        }
      }
      canvas.style.cursor = hoverIdx >= 0 ? 'pointer' : dragging ? 'grabbing' : 'grab';

      ctx.clearRect(0, 0, w, h);

      const line = light ? '14,116,144' : '34,211,238';
      const dot = light ? '8,145,178' : '103,232,249';

      // Edges, dimmer the further back they sit; brighter around the chosen node.
      ctx.lineWidth = 1;
      for (const [a, b] of EDGES) {
        const p = screen[a], q = screen[b];
        const depth = (p.z + q.z) / 2;
        const alpha = (0.1 + ((depth + 1) / 2) * 0.42) * (light ? 0.85 : 1);
        const glow = Math.max(p.lit, q.lit);
        const onSel = selectedIdx >= 0 && (a === selectedIdx || b === selectedIdx);
        ctx.strokeStyle = `rgba(${line},${(alpha + glow * 0.5 + (onSel ? 0.45 : 0)).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }

      // Nodes.
      for (let i = 0; i < screen.length; i++) {
        const s = screen[i];
        const isSkill = nodeSkill.has(i);
        const front = (s.z + 1) / 2;
        const base = isSkill ? 2.2 : 1.1;
        const r = (base + front * 1.9) * (1 + s.lit * 1.3) * (i === selectedIdx ? 1.5 : 1);
        ctx.fillStyle = `rgba(${dot},${(0.22 + front * 0.6 + s.lit * 0.35).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();

        // A ring marks the nodes that hold a skill, so they look clickable.
        if (isSkill) {
          ctx.strokeStyle = `rgba(${dot},${(0.18 + front * 0.4 + (i === selectedIdx ? 0.4 : 0)).toFixed(3)})`;
          ctx.lineWidth = i === selectedIdx ? 1.6 : 1;
          ctx.beginPath();
          ctx.arc(s.x, s.y, r + 4.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 1;
        }
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

      // Labels last, so nothing draws over them.
      if (selectedIdx >= 0 && screen[selectedIdx].z > -0.3)
        chip(nodeSkill.get(selectedIdx)!.name, screen[selectedIdx].x, screen[selectedIdx].y, true);
      if (hoverIdx >= 0 && hoverIdx !== selectedIdx)
        chip(nodeSkill.get(hoverIdx)!.name, screen[hoverIdx].x, screen[hoverIdx].y, false);
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
      canvas.removeEventListener('dblclick', onDouble);
      canvas.removeEventListener('keydown', onKey);
    };
  }, [skills]);

  const hasSkills = skills.length > 0;

  return (
    <div className="relative w-full flex flex-col items-center">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        className="w-full max-w-[460px] rounded-xl outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/40"
        style={{ height: 320, touchAction: 'pan-y' }}
        aria-label={hasSkills ? 'Interactive 3D sphere of skills' : 'Interactive 3D wireframe sphere'}
      />

      <div className="h-10 mt-1 flex items-center justify-center text-center px-4">
        {selected ? (
          <p className="text-sm">
            <span className="text-cyan-300 font-semibold">{selected.name}</span>
            <span className="text-slate-500"> · {CATEGORY[selected.category] ?? selected.category}</span>
            {selected.level && <span className="text-slate-500"> · {selected.level}</span>}
          </p>
        ) : (
          <p
            className="text-xs text-slate-500 transition-opacity duration-700"
            style={{ opacity: touched ? 0.45 : 1 }}
          >
            {hasSkills
              ? 'Drag to spin · click a ringed node for a skill · double-click to shatter'
              : 'Drag to spin · tap it to send a ripple'}
          </p>
        )}
      </div>
    </div>
  );
}

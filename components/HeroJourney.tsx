'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/components/LanguageProvider';

// The hero's picture: his real path, drawn on a globe. Tirana (bachelor's),
// Brno (exchange semester), New York (two Work & Travel seasons) and Aachen
// (master's, now). Every stop is already listed under Experience on this page.
//
// On wide screens the globe is bigger than the hero and sits behind its right
// half. On phones and upright tablets it rises from the bottom, below the text.
// The four stops take turns being the highlighted one, a click on a stop in the
// bar jumps to it, and the globe can be dragged.
//
// Plain 2D canvas, no map or 3D library. The sphere itself is painted once;
// only the dots, routes and markers are redrawn, and only while the hero is on
// screen in a visible tab. The labels are real text, moved along with their
// dots, and they are placed so that they never cover each other, a dot or the
// edge of the screen, whatever the screen size or language.

/* ── Land ──────────────────────────────────────────────────────────────── */
// Evenly spaced points on a sphere (a Fibonacci lattice of LATTICE points).
// Bit i of LAND says whether point i lies on land: about 4,000 dots in 2.5 KB.
// Worked out once, offline, from Natural Earth 110m (public domain).
const LATTICE = 15000;
const LAND = 'AAAAAAAAABICQkBIAAhJIQskJIQEhIAUEDJCgkLAAJkqIANgaIAMjJEjM3EADsTYgdn7EtNiZsnMmoltU1zaW0t7eWstraWltbS0ltby0lpaSltra2ktrf7/2tv5/ztrf+Wt/P2Vt/P2Vtbu21t5eytv9++tvJ21s/L3VubO30j5Oysr5e6kjJyTk3J3UnbOzGmZOyMvZ+6k7JyR03NzQn7O3OmZOSE3Z+bE/JyZk3NzQm7Pzen5OTU35+bk3Jyb03NzWm7Pzen5OTU35+bk3Jyb03Nzek7Ozck5OTU35+bUnJyb03Nzam5Ozek5OTW35+b0nJya03Nyak7Ozak5OTWj4+bUnJybU3Nzak7Gzeg5OTWj5ubUnIyZUXNyakbGyeg5PTWj5uTEjI6RkXN6akbFyYg5NTen5uTEjIqREXNqYk7FyYkZNScn5+TEnIqTEzNqQk7Myak5NScnZ9SEnIoRE3NqRkzOyQk5FSMmZtSEnIwRE3NqRk7NyAkZOSOmZsSEjJ6RUzJyRkzNiQkZPSOmZvSEiJoREzJ6QkzN6AkZNSOmZNSEmJpRUzJqQkzJqCkZNSemZNSEmJJRUzJqSkzJqCk5NaWm5NSEmJJTU3JqSkzJKSg5JaWk5JSUmJJTU3JqSknJKSgxJaWkZJSUkJJTUmJqTknJKSgxJaWkZJSUkpJTUmJqTknJKSg1JaWkRBSUkpJTUGoKTknBKSglBaWkZJSUkoJTUGoKTkmBKSklBaWkVJSUkgJTUkoKSknBqSklBaSkVNCUkgJTUkoKSEmhISElBaSk0FSQmgJDQkoqSEmhICAlBaak1BSQmkJDUkoKSEmhICA1FYaE1BSQmkJDQGoKCEmhoCA1BYWA1BQQkkJDQGoKCEmpICA1hYWA1BAQkkJBQGoKCEEpICA0hYSA1BQQikJAQGgKC0EpISAUhYSA1BQQgkJCQCgKCQEpISAUhYSAFBAQglJCQCgKCQEpoCAUhYSAEBASglJAQCgKCQEpqCgEhYSAkBAQAlJCQSgKCQEhoSAElISCEFAQAlJSQSgoCQUhoSAUpISCEFAWClJSQQgoCQUhoCgElISCEFAWClJCQQgoCQUhoCAElISCEFASCkJQQQgoCUUhoCAUlKSCAFCQikpQQQgoCAUBoCAUFKCCAFCQigpAQQAoCAUBoCAUFaCCAFCQCgpAQSAqAAUBoCAUFaCCAFSACgpAQSAqQAUBqAAUFYCCQFSAigJAUSgqQAWBqAAUFICCQFSACgpAASgqAAWBqAgUFYACUFSACgpBASgoAgWFqAgUFYACUFSACgpRATgoAgWEqAgUFYECUlCECgpBASgqAgWEoAgUFYMCUlCECohBASkoAgWEoAAUEIMCUlCECohBESkoBgWEoAAUEIMCUlCECghBASgoRgWkoAgUEKMCUlAECghBASggBAWkoAAUEIMCUFAECghBASggBAWkoAAUEIMCUFQACkhBASggBAWgoAAUEIICUFAACkhBASggBAWgoAgUEIICUEAIikBBASggBAWgoAAUgYICUEAIikJBESgiBQWgoAAUhYICUEQICkBBESgiBQWgiAAUhYIiUEQKqmR9/e/////trQkUgaIiUFQCikARESgKBUWgiAAUgSIiUBQCikARASgCRUSgqAAUgSIiUBQKiEARASgCRUSgKAQUgSIiUASKiEBRASoCRUSgKAQVgSIiUASKiEBRACoCRUSgCBQRgSIgVASKiEBRACoCRUCoCBQRgaIgVASKgEARKCICRUCoCBQBgaIgRASKgEARKCICRUCoCBQBgSJgRASKgFARKAICRUCoCBQBgSJgRASKgFARKAICRUCICBQBgSJABASKgBARKAICRcCICBQBgSJQBASKgBARKAICRYAICBQBISJQBAQKgBEQKAICRIAICBQAISJQAAQKABEQKAACRIAICBQAIyBQAAQIAAEQIABCAIAACBAAAiBAAAQAAAEQIAAGAIAACBAAAiBAAAQAAAEQIAAEAIAACAAAAiBAAAgAAIEAAAAEAIAAAAAAAgEAAAgAAAEAAAAEAAAAAAAAAgAAAAgAAAAQAAAEAAAAEAAAAgAAAAgEAAAAAAAEAAAAEAgAAAAAAAgAAAAgEAAEAAAAEAAAAAAgAAgAAAAgAAAAAAAAEAAAAEAAAAgAAAAgAAAAAAAAEAAAAEAAAAAAAAAgAAAAgAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAEAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

function landDots(): Float32Array {
  const bits = atob(LAND), golden = Math.PI * (3 - Math.sqrt(5));
  const out: number[] = [];
  for (let i = 0; i < LATTICE; i++) {
    if (!((bits.charCodeAt(i >> 3) >> (i & 7)) & 1)) continue;
    const y = 1 - (2 * (i + 0.5)) / LATTICE, r = Math.sqrt(1 - y * y), lon = i * golden;
    out.push(r * Math.sin(lon), y, r * Math.cos(lon));
  }
  return Float32Array.from(out);
}

/* ── The path ──────────────────────────────────────────────────────────── */
const RAD = Math.PI / 180;
type V3 = readonly [number, number, number];
const vec = (lat: number, lng: number): V3 => {
  const c = Math.cos(lat * RAD);
  return [c * Math.sin(lng * RAD), Math.sin(lat * RAD), c * Math.cos(lng * RAD)];
};
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);

type Anchor = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
// In the order he lived them. `prefer`: where the label likes to sit, best first.
const PLACES: { id: string; at: V3; prefer: Anchor[] }[] = [
  { id: 'tirana', at: vec(41.33, 19.82), prefer: ['s', 'se', 'e', 'sw', 'ne', 'n', 'w', 'nw'] },
  { id: 'brno', at: vec(49.2, 16.61), prefer: ['ne', 'e', 'n', 'se', 'nw', 's', 'w', 'sw'] },
  { id: 'new-york', at: vec(44.15, -73.78), prefer: ['s', 'sw', 'se', 'n', 'w', 'nw', 'ne', 'e'] },   // the Adirondacks, upstate
  { id: 'aachen', at: vec(50.78, 6.08), prefer: ['nw', 'n', 'w', 'ne', 'sw', 's', 'e', 'se'] },
];
const MAIN = 3;   // where he is now

// hold: how long a stop stays the highlighted one. draw: how long its route takes
// to draw itself the first time. packet: how long the signal takes along the route.
const STEPS = [
  { hold: 2600, draw: 0, packet: 0 },
  { hold: 2800, draw: 1100, packet: 1900 },
  { hold: 3200, draw: 1900, packet: 3200 },
  { hold: 6500, draw: 1500, packet: 2500 },
];
// The first run is quicker, so the whole path is there within five seconds.
const FIRST_RUN = [900, 800, 1600, 8200];

/** Great circle from a to b, lifted off the surface in the middle. Returns x,y,z triples. */
function arc(a: V3, b: V3, steps: number): Float32Array {
  const w = Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1)), sw = Math.sin(w);
  const lift = clamp(w * 0.42, 0.05, 0.34), out = new Float32Array((steps + 1) * 3);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, k1 = Math.sin((1 - t) * w) / sw, k2 = Math.sin(t * w) / sw, r = 1 + lift * Math.sin(Math.PI * t);
    out[i * 3] = (a[0] * k1 + b[0] * k2) * r;
    out[i * 3 + 1] = (a[1] * k1 + b[1] * k2) * r;
    out[i * 3 + 2] = (a[2] * k1 + b[2] * k2) * r;
  }
  return out;
}
// Every route starts at home. ROUTES[i] leads to PLACES[i]; there is none for Tirana itself.
const ROUTES = [new Float32Array(0), arc(PLACES[0].at, PLACES[1].at, 40), arc(PLACES[0].at, PLACES[2].at, 90), arc(PLACES[0].at, PLACES[3].at, 50)];

// Faint lines of latitude and longitude.
const GRID: Float32Array[] = [];
for (let lng = -180; lng < 180; lng += 30) {
  const l: number[] = [];
  for (let lat = -80; lat <= 80; lat += 5) l.push(...vec(lat, lng));
  GRID.push(Float32Array.from(l));
}
for (let lat = -60; lat <= 60; lat += 30) {
  const l: number[] = [];
  for (let lng = -180; lng <= 180; lng += 5) l.push(...vec(lat, lng));
  GRID.push(Float32Array.from(l));
}

const DARK = {
  land: '#8be9fb', landFar: 0.14, landNear: 0.7, grid: 'rgba(148,197,214,0.055)',
  halo: '34,211,238', route: '34,211,238', routeMain: 'rgba(190,247,255,0.98)',
  ring: '#67e8f9', dot: '#a5f3fc', dotMain: '#ffffff', packet: '#ffffff', leader: 'rgba(165,243,252,0.6)',
};
const LIGHT = {
  land: '#0e7490', landFar: 0.2, landNear: 0.6, grid: 'rgba(14,116,144,0.09)',
  halo: '8,145,178', route: '8,145,178', routeMain: '#0e7490',
  ring: '#0891b2', dot: '#0e7490', dotMain: '#083344', packet: '#083344', leader: 'rgba(14,116,144,0.6)',
};

/* ── Label placement ───────────────────────────────────────────────────── */
type Size = { w: number; h: number };
type Off = { dx: number; dy: number };
type Fit = { off: Off[]; pick: number[]; clean: boolean };
// One view of the globe: where the four dots are, and points on the routes that a label should not hide.
type View = { x: number[]; y: number[]; rx: number[]; ry: number[]; rw: number[] };
type Bounds = { x0: number; y0: number; x1: number; y1: number };

const ANCHORS: Anchor[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
const GAPS = [14, 40];   // a label sits next to its dot, or one step out on a short leader line
const SPOTS = ANCHORS.length * GAPS.length;

/** Top-left corner of a label, relative to its dot. */
function spot(anchor: Anchor, w: number, h: number, gap: number): Off {
  switch (anchor) {
    case 'n': return { dx: -w / 2, dy: -gap - 4 - h };
    case 'ne': return { dx: gap, dy: -gap * 0.3 - h };
    case 'e': return { dx: gap + 2, dy: -h / 2 };
    case 'se': return { dx: gap, dy: gap * 0.3 };
    case 's': return { dx: -w / 2, dy: gap + 4 };
    case 'sw': return { dx: -gap - w, dy: gap * 0.3 };
    case 'w': return { dx: -gap - 2 - w, dy: -h / 2 };
    default: return { dx: -gap - w, dy: -gap * 0.3 - h };
  }
}
const within = (px: number, py: number, x: number, y: number, w: number, h: number) => px >= x && px <= x + w && py >= y && py <= y + h;

/**
 * Finds the best spot for each of the four labels: no label on another label,
 * on a dot or outside `bounds`, and as little as possible on a route. `views`
 * are the same globe at the ends and the middle of its slow sway, so the answer
 * holds while it moves. `keep` asks to stay close to an earlier answer.
 * Four labels with sixteen spots each is 65,536 combinations, so all are tried.
 */
function placeLabels(sizes: Size[], views: View[], bounds: Bounds, keep: number[] | null): Fit {
  const n = PLACES.length;
  const offs: Off[][] = [], own: number[][] = [], bad: boolean[][] = [];
  const at = views.map(() => sizes.map(() => new Float32Array(SPOTS * 2)));   // [view][label] → x,y per spot, kept inside bounds
  for (let i = 0; i < n; i++) {
    const { w, h } = sizes[i];
    offs.push([]); own.push([]); bad.push([]);
    for (let c = 0; c < SPOTS; c++) {
      const anchor = ANCHORS[c % ANCHORS.length], far = Math.floor(c / ANCHORS.length);
      const off = spot(anchor, w, h, GAPS[far]);
      let cost = PLACES[i].prefer.indexOf(anchor) * 7 + far * 34 + (keep && keep[i] !== c ? 28 : 0), fails = false;
      views.forEach((view, v) => {
        const x0 = view.x[i] + off.dx, y0 = view.y[i] + off.dy;
        const x = clamp(x0, bounds.x0, Math.max(bounds.x0, bounds.x1 - w)), y = clamp(y0, bounds.y0, Math.max(bounds.y0, bounds.y1 - h));
        const pushed = Math.abs(x - x0) + Math.abs(y - y0);
        cost += pushed * 2.5;
        if (pushed > 26) fails = true;
        if (within(view.x[i], view.y[i], x - 5, y - 5, w + 10, h + 10)) { cost += 420; fails = true; }
        for (let j = 0; j < n; j++) if (j !== i && within(view.x[j], view.y[j], x - 8, y - 8, w + 16, h + 16)) { cost += 700; fails = true; }
        for (let r = 0; r < view.rx.length; r++) if (within(view.rx[r], view.ry[r], x - 2, y - 2, w + 4, h + 4)) cost += view.rw[r];
        at[v][i][c * 2] = x; at[v][i][c * 2 + 1] = y;
      });
      offs[i].push(off); own[i].push(cost); bad[i].push(fails);
    }
  }
  // cost of two labels touching, for every pair of labels and every pair of spots
  const pair: Float32Array[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const table = new Float32Array(SPOTS * SPOTS);
    if (i < j) for (let a = 0; a < SPOTS; a++) for (let b = 0; b < SPOTS; b++) {
      let cost = 0;
      for (let v = 0; v < views.length; v++) {
        const ax = at[v][i][a * 2], ay = at[v][i][a * 2 + 1], bx = at[v][j][b * 2], by = at[v][j][b * 2 + 1];
        const ow = Math.min(ax + sizes[i].w, bx + sizes[j].w) - Math.max(ax, bx) + 6;
        const oh = Math.min(ay + sizes[i].h, by + sizes[j].h) - Math.max(ay, by) + 6;
        if (ow > 0 && oh > 0) cost += 520 + ow * oh * 0.6;
      }
      table[a * SPOTS + b] = cost;
    }
    pair.push(table);
  }
  const p01 = pair[1], p02 = pair[2], p03 = pair[3], p12 = pair[n + 2], p13 = pair[n + 3], p23 = pair[2 * n + 3];
  let best = Infinity;
  const pick = [0, 0, 0, 0];
  for (let a = 0; a < SPOTS; a++) {
    const ca = own[0][a];
    if (ca >= best) continue;
    for (let b = 0; b < SPOTS; b++) {
      const cb = ca + own[1][b] + p01[a * SPOTS + b];
      if (cb >= best) continue;
      for (let c = 0; c < SPOTS; c++) {
        const cc = cb + own[2][c] + p02[a * SPOTS + c] + p12[b * SPOTS + c];
        if (cc >= best) continue;
        for (let d = 0; d < SPOTS; d++) {
          const cd = cc + own[3][d] + p03[a * SPOTS + d] + p13[b * SPOTS + d] + p23[c * SPOTS + d];
          if (cd < best) { best = cd; pick[0] = a; pick[1] = b; pick[2] = c; pick[3] = d; }
        }
      }
    }
  }
  const touching = p01[pick[0] * SPOTS + pick[1]] + p02[pick[0] * SPOTS + pick[2]] + p03[pick[0] * SPOTS + pick[3]]
    + p12[pick[1] * SPOTS + pick[2]] + p13[pick[1] * SPOTS + pick[3]] + p23[pick[2] * SPOTS + pick[3]];
  return { off: pick.map((c, i) => offs[i][c]), pick: pick.slice(), clean: touching === 0 && pick.every((c, i) => !bad[i][c]) };
}

/* ── Component ─────────────────────────────────────────────────────────── */
export default function HeroJourney() {
  const { t, lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);
  const placesRef = useRef<HTMLOListElement>(null);
  const barRef = useRef<HTMLOListElement>(null);
  const goRef = useRef<(i: number) => void>(() => {});
  const refitRef = useRef<() => void>(() => {});
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current, stage = stageRef.current, base = baseRef.current, live = liveRef.current;
    const list = placesRef.current, bar = barRef.current;
    const section = root?.parentElement, slot = section?.querySelector<HTMLElement>('[data-globe-slot]');
    const bg = base?.getContext('2d'), g = live?.getContext('2d');
    if (!root || !stage || !base || !live || !list || !bar || !section || !slot || !bg || !g) return;
    const labels = Array.from(list.children) as HTMLElement[];
    const fills = Array.from(bar.querySelectorAll<HTMLElement>('i'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let light = document.documentElement.getAttribute('data-theme') === 'light';
    const land = landDots();

    // where the globe is: all in pixels of the hero section, except bx.. (the canvas box)
    let W = 0, H = 0, R = 1, cx = 0, cy = 0, bx = 0, by = 0, bw = 1, bh = 1, scale = 1, dotSize = 2;
    let side = true, slotTop = 0, laidOut = '';
    let homeLon = -8, homeLat = 44, sway = 6;
    const bounds: Bounds = { x0: 0, y0: 0, x1: 1, y1: 1 };   // where labels may be
    // the camera
    let cl = 1, sl = 0, cp = 1, sp = 0, tx = 0, ty = 0, tz = 0;
    let userLon = 0, userLat = 0, spin = 0, touched = -1e9;
    let drag: { x: number; y: number } | null = null;
    // the story. `clock` only runs while frames are drawn, so it never jumps after a pause.
    let clock = 0, last = 0, raf = 0, onScreen = false, disposed = false, ready = false;
    let phase = reduced ? MAIN : 0, phaseAt = 0, firstRun = !reduced;
    const shownAt = PLACES.map((_, i) => (reduced || i === 0 ? -1e9 : Infinity));
    const routeAt = PLACES.map(() => (reduced ? -1e9 : Infinity));
    const lit = PLACES.map((_, i) => (reduced && i === MAIN ? 1 : 0));   // how strongly each stop is highlighted, 0..1
    // the labels
    let full: Size[] = PLACES.map(() => ({ w: 120, h: 42 })), small: Size[] = PLACES.map(() => ({ w: 60, h: 24 }));
    let detail = 2, snap = true;   // 2: every label in full, 1: only the highlighted one, 0: names only
    let fits: Fit[] = [];
    const px = [0, 0, 0, 0], py = [0, 0, 0, 0], pa = [0, 0, 0, 0];             // dots: position and visibility
    const la = [0, 0, 0, 0];                                                    // labels: visibility
    const lx = [0, 0, 0, 0], ly = [0, 0, 0, 0], lw = [0, 0, 0, 0], lh = [0, 0, 0, 0];   // labels: box
    const cur: Off[] = PLACES.map(() => ({ dx: 0, dy: 0 }));
    const wasAlpha = [-1, -1, -1, -1], wasFill = ['', '', '', ''];

    // soft glow under the markers on the dark page
    const spark = document.createElement('canvas');
    spark.width = spark.height = 64;
    const sg = spark.getContext('2d');
    if (sg) {
      const rg = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
      rg.addColorStop(0, 'rgba(103,232,249,0.6)');
      rg.addColorStop(0.35, 'rgba(34,211,238,0.2)');
      rg.addColorStop(1, 'rgba(34,211,238,0)');
      sg.fillStyle = rg; sg.fillRect(0, 0, 64, 64);
    }

    const aim = (lon: number, lat: number) => { cl = Math.cos(lon * RAD); sl = Math.sin(lon * RAD); cp = Math.cos(lat * RAD); sp = Math.sin(lat * RAD); };
    /** Turns a point on the globe towards the viewer: tx right, ty up, tz towards the viewer (all in radii). */
    const turn = (x: number, y: number, z: number) => { const z1 = x * sl + z * cl; tx = x * cl - z * sl; ty = y * cp - z1 * sp; tz = y * sp + z1 * cp; };
    const holdNow = () => (firstRun ? FIRST_RUN[phase] : STEPS[phase].hold);
    const opened = (i: number) => detail === 2 || (detail === 1 && i === phase);   // name and line, or the name only

    /** The static part: glow around the globe, the sphere, the light on its rim. */
    const paintBase = () => {
      const ox = cx - bx, oy = cy - by;
      bg.setTransform(scale, 0, 0, scale, 0, 0);
      bg.clearRect(0, 0, bw, bh);
      let gr = bg.createRadialGradient(ox, oy, R * 0.9, ox, oy, R * 1.34);
      gr.addColorStop(0, light ? 'rgba(8,145,178,0.18)' : 'rgba(34,211,238,0.22)');
      gr.addColorStop(0.3, light ? 'rgba(8,145,178,0.07)' : 'rgba(34,211,238,0.08)');
      gr.addColorStop(1, light ? 'rgba(8,145,178,0)' : 'rgba(34,211,238,0)');
      bg.fillStyle = gr; bg.beginPath(); bg.arc(ox, oy, R * 1.34, 0, 7); bg.fill();
      gr = bg.createRadialGradient(ox - R * 0.38, oy - R * 0.42, R * 0.05, ox, oy, R);
      gr.addColorStop(0, light ? '#ffffff' : 'rgb(17,46,64)');
      gr.addColorStop(0.55, light ? '#eef6fa' : 'rgb(9,22,34)');
      gr.addColorStop(1, light ? '#d9e9f1' : 'rgb(5,10,18)');
      bg.fillStyle = gr; bg.beginPath(); bg.arc(ox, oy, R, 0, 7); bg.fill();
      gr = bg.createRadialGradient(ox, oy, R * 0.78, ox, oy, R);
      gr.addColorStop(0, light ? 'rgba(8,145,178,0)' : 'rgba(34,211,238,0)');
      gr.addColorStop(1, light ? 'rgba(8,145,178,0.2)' : 'rgba(103,232,249,0.2)');
      bg.fillStyle = gr; bg.beginPath(); bg.arc(ox, oy, R, 0, 7); bg.fill();
    };

    /** The four dots and a few points on each route, for the globe turned to `lon`. */
    const viewAt = (lon: number): View => {
      aim(lon, homeLat);
      const view: View = { x: [], y: [], rx: [], ry: [], rw: [] };
      for (const place of PLACES) { turn(place.at[0], place.at[1], place.at[2]); view.x.push(cx + R * tx); view.y.push(cy - R * ty); }
      for (let k = 1; k < ROUTES.length; k++) {
        const pts = ROUTES[k], n = pts.length / 3;
        for (let s = 1; s <= 9; s++) {
          const j = Math.round((0.08 + 0.084 * s) * (n - 1)) * 3;
          turn(pts[j], pts[j + 1], pts[j + 2]);
          if (tz > 0 || tx * tx + ty * ty > 1) { view.rx.push(cx + R * tx); view.ry.push(cy - R * ty); view.rw.push(k === MAIN ? 55 : 14); }
        }
      }
      return view;
    };

    /** Shows the name only, or name and line, and marks the highlighted stop. */
    const dress = () => {
      labels.forEach((el, i) => {
        el.toggleAttribute('data-min', !opened(i));
        el.toggleAttribute('data-on', i === phase);
      });
    };

    /** Measures the labels and decides where each one sits. Needed after a resize, a font load or a language change. */
    const fit = (force = true) => {
      for (const el of labels) el.removeAttribute('data-min');
      const wide = labels.map((el) => ({ w: el.offsetWidth || 120, h: el.offsetHeight || 42 }));
      for (const el of labels) el.setAttribute('data-min', '');
      const narrow = labels.map((el) => ({ w: el.offsetWidth || 60, h: el.offsetHeight || 24 }));
      const same = (a: Size[], b: Size[]) => a.every((s, i) => s.w === b[i].w && s.h === b[i].h);
      if (!force && same(wide, full) && same(narrow, small)) { dress(); return; }   // nothing changed size
      full = wide; small = narrow;
      const views = (reduced ? [0] : [-sway, 0, sway]).map((d) => viewAt(homeLon + d));
      const all = placeLabels(full, views, bounds, null);
      detail = all.clean ? 2 : 1;
      if (detail === 2) fits = PLACES.map(() => all);
      else {
        // Not enough room for four full labels: names only, and the highlighted stop opens up.
        const names = placeLabels(small, views, bounds, null);
        fits = PLACES.map((_, on) => placeLabels(small.map((s, i) => (i === on ? full[i] : s)), views, bounds, names.pick));
        // Not even room for one full label: names only.
        if (fits.some((fit) => !fit.clean)) { detail = 0; fits = PLACES.map(() => names); }
      }
      dress();
      snap = true;
    };

    const layout = () => {
      const sr = section.getBoundingClientRect(), tr = slot.getBoundingClientRect();
      const w = Math.round(sr.width), h = Math.round(sr.height);
      if (!w || !h) return;
      const sLeft = Math.round(tr.left - sr.left), sTop = Math.round(tr.top - sr.top), sH = Math.round(tr.height);
      const beside = sLeft > w * 0.25;   // the slot sits next to the text, not under it
      const barH = bar.offsetHeight || 58;
      // Under the text, the globe hangs on the slot. If only the text above it grew or shrank
      // (the typed line wrapping, say), everything moves along and nothing is worked out again.
      const key = beside ? `side|${w}|${h}|${sLeft}` : `stack|${w}|${sH}|${h - sTop}`;
      if (key === laidOut) {
        const moved = beside ? 0 : sTop - slotTop;
        if (moved) {
          slotTop = sTop; H = h; cy += moved; by += moved; bounds.y0 += moved; bounds.y1 += moved;
          stage.style.top = `${by}px`;
          bar.style.top = `${parseFloat(bar.style.top) + moved}px`;
          snap = true; wake();
        }
        return;
      }
      laidOut = key; W = w; H = h; side = beside; slotTop = sTop;
      let barX: number, barY: number, barW: number;
      if (side) {
        // Bigger than the hero on purpose: its upper left part fills the right half.
        const room = W - 12 - sLeft;
        R = clamp(Math.min(H * 0.56, (room - 170) / 1.004), 190, 640);
        cx = sLeft + 0.654 * R + 70 + Math.max(0, room - (1.004 * R + 170)) * 0.4;
        cy = H * 0.6;
        homeLon = -8; homeLat = 44; sway = 6;
        barW = Math.min(440, room - 24);
        barX = clamp(cx - 0.152 * R - barW / 2, sLeft + 12, W - 12 - barW);
        barY = Math.min(H - 28 - barH, cy + R + 36);   // at the bottom, but never far below the globe
        // Below 1024px a dock floats over the bottom of the screen. The bar moves up clear of it,
        // as long as it then still sits below the four dots.
        const aboveDock = window.innerHeight - 104 - barH;
        if (W < 1024 && aboveDock < barY && aboveDock > cy + 30) barY = aboveDock;
        bounds.x0 = sLeft + 8; bounds.x1 = W - 12; bounds.y0 = 84; bounds.y1 = barY - 12;
      } else {
        // The top of the globe, wide enough to hold New York on the left and Tirana on the right.
        R = clamp(Math.min((W - 80) / 1.064, sH * 0.98), 150, 560);
        cx = W / 2 + 0.031 * R;
        cy = sTop + 26 + R;
        homeLon = -22; homeLat = 14; sway = 3;
        barW = Math.min(W - 32, 520);
        barX = (W - barW) / 2;
        barY = sTop + sH - barH;
        bounds.x0 = 8; bounds.x1 = W - 8; bounds.y0 = sTop + 4; bounds.y1 = barY - 10;
      }
      dotSize = clamp(R / 210, 1.8, 2.6);
      bx = Math.max(0, Math.floor(cx - R * 1.36)); by = Math.max(0, Math.floor(cy - R * 1.36));
      bw = Math.max(1, Math.min(W, Math.ceil(cx + R * 1.36)) - bx); bh = Math.max(1, Math.min(H, Math.ceil(cy + R * 1.36)) - by);
      // sharp on retina screens, but never a canvas of more than about 4 megapixels
      scale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4.4e6 / (bw * bh)));
      for (const c of [base, live]) { c.width = Math.round(bw * scale); c.height = Math.round(bh * scale); }
      g.setTransform(scale, 0, 0, scale, 0, 0);
      stage.style.left = `${bx}px`; stage.style.top = `${by}px`; stage.style.width = `${bw}px`; stage.style.height = `${bh}px`;
      bar.style.left = `${Math.round(barX)}px`; bar.style.top = `${Math.round(barY)}px`; bar.style.width = `${Math.round(barW)}px`;
      root.dataset.mode = side ? 'side' : 'stack';
      root.style.setProperty('--hj-x', `${sLeft}px`);
      paintBase();
      fit();
      if (!ready) { ready = true; root.setAttribute('data-ready', ''); }
      wake();
    };

    /** Where the dots are now, and how visible. */
    const locate = () => {
      for (let i = 0; i < PLACES.length; i++) {
        const at = PLACES[i].at;
        turn(at[0], at[1], at[2]);
        px[i] = cx + R * tx; py[i] = cy - R * ty;
        pa[i] = clamp((tz - 0.05) / 0.2, 0, 1) * ease((clock - shownAt[i]) / 500);
        // a label goes when its dot is dragged out of the picture, rather than sticking to the edge
        la[i] = pa[i] * clamp((Math.min(px[i] - bounds.x0, bounds.x1 - px[i]) + 10) / 16, 0, 1) * (py[i] > -10 && py[i] < H + 10 ? 1 : 0);
      }
    };

    /** Moves the labels along with their dots. */
    const moveLabels = (dt: number) => {
      const k = snap ? 1 : 1 - Math.pow(0.8, dt);
      const want = fits[phase]?.off;
      for (let i = 0; i < labels.length; i++) {
        const size = opened(i) ? full[i] : small[i];
        if (want) { cur[i].dx += (want[i].dx - cur[i].dx) * k; cur[i].dy += (want[i].dy - cur[i].dy) * k; }
        lw[i] = size.w; lh[i] = size.h;
        lx[i] = clamp(px[i] + cur[i].dx, bounds.x0, Math.max(bounds.x0, bounds.x1 - size.w));
        ly[i] = clamp(py[i] + cur[i].dy, bounds.y0, Math.max(bounds.y0, bounds.y1 - size.h));
        labels[i].style.transform = `translate3d(${lx[i].toFixed(1)}px,${ly[i].toFixed(1)}px,0)`;
        if (Math.abs(la[i] - wasAlpha[i]) > 0.008) { wasAlpha[i] = la[i]; labels[i].style.opacity = la[i].toFixed(2); }
      }
      snap = false;
    };

    /** Everything that moves: grid, land, routes, the travelling signal, the four markers. */
    const paint = () => {
      const ox = cx - bx, oy = cy - by, C = light ? LIGHT : DARK;
      g.clearRect(0, 0, bw, bh);

      g.beginPath();
      for (const line of GRID) {
        let pen = false;
        for (let i = 0; i < line.length; i += 3) {
          turn(line[i], line[i + 1], line[i + 2]);
          if (tz > 0) { if (pen) g.lineTo(ox + R * tx, oy - R * ty); else g.moveTo(ox + R * tx, oy - R * ty); pen = true; } else pen = false;
        }
      }
      g.lineWidth = 1; g.strokeStyle = C.grid; g.stroke();

      g.fillStyle = C.land;
      for (let i = 0; i < land.length; i += 3) {
        const x = land[i], y = land[i + 1], z = land[i + 2];
        const z1 = x * sl + z * cl, z2 = y * sp + z1 * cp;
        if (z2 <= 0) continue;   // on the far side
        const X = ox + R * (x * cl - z * sl), Y = oy - R * (y * cp - z1 * sp);
        if (X < -3 || Y < -3 || X > bw + 3 || Y > bh + 3) continue;
        const s = dotSize * (0.48 + 0.52 * z2);
        g.globalAlpha = C.landFar + C.landNear * z2;
        g.fillRect(X - s / 2, Y - s / 2, s, s);
      }
      g.globalAlpha = 1;

      g.lineCap = 'round'; g.lineJoin = 'round';
      for (let k = 1; k < ROUTES.length; k++) {
        const grown = ease((clock - routeAt[k]) / STEPS[k].draw);
        if (grown <= 0) continue;
        const pts = ROUTES[k], n = pts.length / 3, f = grown * (n - 1), upto = Math.floor(f);
        g.beginPath();
        let pen = false;
        for (let i = 0; i <= upto; i++) {
          turn(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]);
          // hidden only where it passes behind the globe
          if (tz > 0 || tx * tx + ty * ty > 1) { if (pen) g.lineTo(ox + R * tx, oy - R * ty); else g.moveTo(ox + R * tx, oy - R * ty); pen = true; } else pen = false;
        }
        if (upto < n - 1 && pen) {   // the growing tip, between two points
          const j = upto * 3, e = f - upto;
          turn(pts[j] + (pts[j + 3] - pts[j]) * e, pts[j + 1] + (pts[j + 4] - pts[j + 1]) * e, pts[j + 2] + (pts[j + 5] - pts[j + 2]) * e);
          g.lineTo(ox + R * tx, oy - R * ty);
        }
        const main = k === MAIN, on = lit[k];
        g.strokeStyle = `rgba(${C.halo},${((main ? 0.15 : 0.06) + 0.07 * on).toFixed(3)})`; g.lineWidth = main ? 8 : 5; g.stroke();
        if (main) { g.strokeStyle = `rgba(${C.halo},0.28)`; g.lineWidth = 4.5; g.stroke(); }
        g.strokeStyle = main ? C.routeMain : `rgba(${C.route},${(0.6 + 0.36 * on).toFixed(3)})`; g.lineWidth = main ? 2.2 : 1.3 + 0.5 * on; g.stroke();
      }

      // a signal keeps travelling from home to the highlighted stop
      if (phase > 0 && !reduced) {
        const since = clock - Math.max(phaseAt, routeAt[phase] + STEPS[phase].draw);
        if (since >= 0) {
          const pts = ROUTES[phase], n = pts.length / 3, u = (since % STEPS[phase].packet) / STEPS[phase].packet;
          const f = u * (n - 1), j = Math.min(Math.floor(f), n - 2) * 3, e = f - j / 3;
          turn(pts[j] + (pts[j + 3] - pts[j]) * e, pts[j + 1] + (pts[j + 4] - pts[j + 1]) * e, pts[j + 2] + (pts[j + 5] - pts[j + 2]) * e);
          if (tz > 0 || tx * tx + ty * ty > 1) {
            const X = ox + R * tx, Y = oy - R * ty;
            g.globalAlpha = Math.min(1, u * 9, (1 - u) * 9);
            if (!light) g.drawImage(spark, X - 13, Y - 13, 26, 26);
            g.fillStyle = C.packet; g.beginPath(); g.arc(X, Y, phase === MAIN ? 3 : 2.4, 0, 7); g.fill();
            g.globalAlpha = 1;
          }
        }
      }

      for (let i = 0; i < PLACES.length; i++) {
        const a = pa[i];
        if (a <= 0.01) continue;
        const X = px[i] - bx, Y = py[i] - by, on = lit[i], main = i === MAIN;
        // a short line to the label when the label could not sit right next to its dot
        const nx = clamp(px[i], lx[i], lx[i] + lw[i]) - bx, ny = clamp(py[i], ly[i], ly[i] + lh[i]) - by, d = Math.hypot(nx - X, ny - Y);
        if (d > 11 && la[i] > 0.01) {
          g.globalAlpha = la[i] * 0.55; g.strokeStyle = C.leader; g.lineWidth = 1;
          g.beginPath(); g.moveTo(X + ((nx - X) / d) * 6, Y + ((ny - Y) / d) * 6); g.lineTo(nx, ny); g.stroke();
        }
        const pulse = reduced ? 0.4 : ((clock + i * 550) % 2200) / 2200;
        g.globalAlpha = a * (1 - pulse) * (0.26 + 0.6 * on); g.strokeStyle = C.ring; g.lineWidth = 1.2;
        g.beginPath(); g.arc(X, Y, 4 + pulse * (9 + 11 * on), 0, 7); g.stroke();
        g.globalAlpha = a;
        if (!light) { const s = 26 + 12 * on; g.drawImage(spark, X - s / 2, Y - s / 2, s, s); }
        g.fillStyle = main ? C.dotMain : C.dot;
        g.beginPath(); g.arc(X, Y, (main ? 4.2 : 3.2) + 0.8 * on, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
    };

    /** The thin line over each stop in the bar: full for the ones passed, growing for the current one. */
    const progress = () => {
      const hold = holdNow();
      for (let i = 0; i < fills.length; i++) {
        const v = i < phase ? 1 : i > phase ? 0 : reduced ? 1 : clamp((clock - phaseAt) / hold, 0, 1);
        const s = v.toFixed(3);
        if (s !== wasFill[i]) { wasFill[i] = s; fills[i].style.transform = `scaleX(${s})`; }
      }
    };

    const render = (dt: number) => {
      aim(homeLon + userLon + (reduced ? 0 : Math.sin(clock * 0.00022) * sway), homeLat + userLat);
      locate();
      moveLabels(dt);
      paint();
      progress();
    };

    const go = (i: number, byHand = false) => {
      if (byHand && firstRun) {   // a click skips the opening: everything is there at once
        firstRun = false;
        for (let k = 0; k < PLACES.length; k++) { shownAt[k] = Math.min(shownAt[k], clock - 600); routeAt[k] = -1e9; }
      }
      phase = clamp(i, 0, PLACES.length - 1);
      phaseAt = clock;
      if (firstRun && phase > 0) { routeAt[phase] = clock; shownAt[phase] = clock + STEPS[phase].draw * 0.95; }
      if (reduced) for (let k = 0; k < lit.length; k++) lit[k] = k === phase ? 1 : 0;
      dress();
      setActive(phase);
      wake();
    };

    const frame = (now: number) => {
      raf = 0;
      const ms = last ? Math.min(50, now - last) : 16.7, dt = ms / 16.667;
      last = now;
      clock += ms;
      if (clock - phaseAt > holdNow()) {
        if (phase === MAIN) { firstRun = false; go(0); } else go(phase + 1);
      }
      if (!drag) {
        if (Math.abs(spin) > 0.002) { userLon += spin * dt; spin *= Math.pow(0.93, dt); } else spin = 0;
        // left alone for a while, the globe turns back to where the path is
        if (now - touched > 2600 && (userLon || userLat)) {
          const k = Math.pow(0.955, dt);
          userLon = Math.abs(userLon) < 0.02 ? 0 : userLon * k;
          userLat = Math.abs(userLat) < 0.02 ? 0 : userLat * k;
        }
      }
      for (let i = 0; i < lit.length; i++) lit[i] += ((i === phase ? 1 : 0) - lit[i]) * (1 - Math.pow(0.9, dt));
      render(dt);
      start();
    };

    function start() {
      if (raf || reduced || disposed || !ready || !onScreen || document.hidden) return;
      raf = requestAnimationFrame(frame);
    }
    function stop() { cancelAnimationFrame(raf); raf = 0; last = 0; }
    function wake() {
      if (!ready) return;
      if (reduced) { snap = true; render(1); } else start();
    }

    goRef.current = (i: number) => go(i, true);
    // With reduced motion nothing plays: the picture rests on where he is now.
    if (reduced) queueMicrotask(() => { if (!disposed) setActive(MAIN); });
    refitRef.current = () => { if (ready) { fit(false); wake(); } };

    // drag to turn the globe
    const onGlobe = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      return Math.hypot(e.clientX - r.left - cx, e.clientY - r.top - cy) < R * 1.02;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.pointerType === 'mouse' && e.button !== 0) || !onGlobe(e)) return;
      drag = { x: e.clientX, y: e.clientY }; spin = 0; touched = performance.now();
      try { stage.setPointerCapture(e.pointerId); } catch { /* the pointer is already gone */ }
      stage.style.cursor = 'grabbing';
      if (e.pointerType === 'mouse') e.preventDefault();   // no text selection while dragging
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) { stage.style.cursor = onGlobe(e) ? 'grab' : ''; return; }
      const k = (57.3 / R) * 1.15, dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      spin = -dx * k;
      userLon += spin;
      userLat = clamp(userLat + dy * k * 0.9, -40, 40);
      touched = performance.now();
      if (reduced) wake();
    };
    const onUp = () => {
      if (!drag) return;
      drag = null; touched = performance.now();
      userLon = ((((userLon + 180) % 360) + 360) % 360) - 180;   // turn back the short way round
      if (reduced) spin = 0;
      stage.style.cursor = '';
    };
    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);

    const onVisibility = () => { if (document.hidden) stop(); else wake(); };
    document.addEventListener('visibilitychange', onVisibility);

    const resize = new ResizeObserver(layout);
    resize.observe(section); resize.observe(slot);

    const theme = new MutationObserver(() => {
      light = document.documentElement.getAttribute('data-theme') === 'light';
      if (ready) { paintBase(); wake(); }
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) wake(); else stop();
    }, { threshold: 0.02 });
    seen.observe(section);

    layout();
    // the labels are measured again once the real font is in
    document.fonts?.ready.then(() => { if (!disposed) refitRef.current(); }).catch(() => {});

    return () => {
      disposed = true;
      stop();
      resize.disconnect(); theme.disconnect(); seen.disconnect();
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onUp);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Label widths change with the language, so the labels are placed again after a switch (not on the first render).
  const shownLang = useRef(lang);
  useEffect(() => {
    if (shownLang.current === lang) return;
    shownLang.current = lang;
    refitRef.current();
  }, [lang]);

  const names = PLACES.map((_, i) => t(`hero.j${i + 1}`));

  return (
    <div ref={rootRef} className="hj">
      <div ref={stageRef} className="hj-stage" role="img" aria-label={t('hero.journeyLabel')}>
        <canvas ref={baseRef} aria-hidden />
        <canvas ref={liveRef} aria-hidden />
      </div>
      <div className="hj-shade" aria-hidden />
      <ol ref={placesRef} className="hj-places" aria-hidden>
        {PLACES.map((place, i) => (
          <li key={place.id} className={`hj-place${i === MAIN ? ' is-main' : ''}`}>
            <b>{names[i]}</b>
            <span>{t(`hero.j${i + 1}s`)}</span>
          </li>
        ))}
      </ol>
      <ol ref={barRef} className="hj-bar" aria-label={t('hero.journeyStops')}>
        {PLACES.map((place, i) => (
          <li key={place.id}>
            <button
              type="button"
              className={`hj-step${i === active ? ' is-on' : i < active ? ' is-done' : ''}`}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => goRef.current(i)}
            >
              <i aria-hidden />
              <b>0{i + 1}</b>
              <span>{names[i]}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

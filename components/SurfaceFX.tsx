'use client';
import { useEffect } from 'react';

/**
 * Makes the glass behave like glass.
 *
 *  - a specular highlight follows the cursor across cards and buttons
 *  - cards lean towards the cursor, with real perspective
 *  - buttons drift towards the cursor when it comes close
 *
 * Everything is done by writing CSS custom properties, never `transform`, so
 * nothing here can fight framer-motion for control of an element.
 */

const SURFACE = '.glass, .btn-primary, .btn-ghost';
const MAGNETIC = '.btn-primary, .btn-ghost';
const REACH = 110;   // px around a button where it starts to feel the cursor
const PULL = 0.28;   // how far it follows
const TILT = 7;      // degrees at the corner of a card

export default function SurfaceFX() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm) return;

    let current: HTMLElement | null = null;
    let magnets: HTMLElement[] = [];
    let queued = false;
    let mx = 0, my = 0;

    const collect = () => { magnets = Array.from(document.querySelectorAll<HTMLElement>(MAGNETIC)); };
    collect();
    const watcher = new MutationObserver(collect);
    watcher.observe(document.body, { childList: true, subtree: true });

    const clear = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
      el.style.removeProperty('--tx');
      el.style.removeProperty('--ty');
      el.style.removeProperty('--ta');
    };

    const apply = () => {
      queued = false;

      // 1 + 2: highlight and lean on whatever is under the cursor.
      const under = document.elementFromPoint(mx, my);
      const el = under instanceof Element ? under.closest<HTMLElement>(SURFACE) : null;
      if (el !== current) { clear(current); current = el; }

      if (el) {
        const r = el.getBoundingClientRect();
        const px = (mx - r.left) / r.width;      // 0 → 1 across
        const py = (my - r.top) / r.height;
        el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);

        if (el.classList.contains('glass-hover')) {
          // Lean towards the cursor: rotate around the axis at right angles to it.
          const dx = (px - 0.5) * 2, dy = (py - 0.5) * 2;
          const mag = Math.min(1, Math.hypot(dx, dy));
          el.style.setProperty('--tx', dy.toFixed(3));
          el.style.setProperty('--ty', (-dx).toFixed(3));
          el.style.setProperty('--ta', `${(mag * TILT).toFixed(2)}deg`);
        }
      }

      // 3: buttons drift towards a cursor that comes near.
      for (const b of magnets) {
        const r = b.getBoundingClientRect();
        if (!r.width) continue;
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = mx - cx, dy = my - cy;
        const near = Math.max(0, 1 - Math.hypot(dx, dy) / (Math.max(r.width, r.height) / 2 + REACH));
        if (near <= 0) {
          b.style.removeProperty('--magx');
          b.style.removeProperty('--magy');
        } else {
          b.style.setProperty('--magx', `${(dx * PULL * near).toFixed(1)}px`);
          b.style.setProperty('--magy', `${(dy * PULL * near).toFixed(1)}px`);
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(apply); }
    };
    const onLeave = () => {
      clear(current);
      current = null;
      for (const b of magnets) {
        b.style.removeProperty('--magx');
        b.style.removeProperty('--magy');
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      watcher.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      onLeave();
    };
  }, []);

  return null;
}

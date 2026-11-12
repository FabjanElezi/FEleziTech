'use client';
import { useEffect } from 'react';

/**
 * Makes the glass behave like glass.
 *
 *  - a specular highlight follows the cursor across cards and buttons
 *  - cards lean towards the cursor, with real perspective
 *  - buttons lean a few pixels towards the cursor once it is almost on them (not in Admin)
 *
 * Everything is done by writing CSS custom properties, never `transform`, so
 * nothing here can fight framer-motion for control of an element.
 */

const SURFACE = '.glass, .btn-primary, .btn-ghost';
const MAGNETIC = '.btn-primary, .btn-ghost';
const REACH = 36;    // px outside a button's edge where it starts to feel the cursor
const DRIFT = 4;     // px: the furthest a button ever moves towards it
const TILT = 7;      // degrees at the corner of a card

export default function SurfaceFX() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm) return;

    // Touch: there is no cursor to follow, so the light is carried by the
    // scroll instead — it sweeps down each card as the card crosses the screen.
    if (!fine) {
      let cards = Array.from(document.querySelectorAll<HTMLElement>('.glass'));
      const recollect = new MutationObserver(() => {
        cards = Array.from(document.querySelectorAll<HTMLElement>('.glass'));
      });
      recollect.observe(document.body, { childList: true, subtree: true });

      let pending = false;
      const sweep = () => {
        pending = false;
        const vh = window.innerHeight;
        for (const el of cards) {
          const r = el.getBoundingClientRect();
          if (r.bottom < -40 || r.top > vh + 40 || !r.height) {
            el.style.removeProperty('--lit');
            continue;
          }
          // Brightest while the card sits in the middle of the screen.
          const middle = r.top + r.height / 2;
          const near = 1 - Math.min(1, Math.abs(middle - vh / 2) / (vh * 0.6));
          el.style.setProperty('--lit', (near * 0.5).toFixed(2));
          el.style.setProperty('--mx', '50%');
          el.style.setProperty('--my', `${Math.max(-20, Math.min(120, ((vh / 2 - r.top) / r.height) * 100)).toFixed(0)}%`);
        }
      };
      const onScroll = () => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(sweep);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();

      return () => {
        recollect.disconnect();
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };
    }

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

      // 3: buttons lean towards a cursor that is almost on them (public site
      // only; in Admin, buttons stay where they are).
      const still = window.location.pathname.startsWith('/admin');
      for (const b of magnets) {
        const r = still ? null : b.getBoundingClientRect();
        if (!r || !r.width) {
          b.style.removeProperty('--magx');
          b.style.removeProperty('--magy');
          continue;
        }
        const hw = r.width / 2, hh = r.height / 2;
        const dx = mx - (r.left + hw), dy = my - (r.top + hh);
        // 1 while the cursor is on the button, fading to 0 at REACH px from its edge.
        const gap = Math.hypot(Math.max(0, Math.abs(dx) - hw), Math.max(0, Math.abs(dy) - hh));
        const near = Math.max(0, 1 - gap / REACH);
        if (near <= 0) {
          b.style.removeProperty('--magx');
          b.style.removeProperty('--magy');
        } else {
          // Where on the button the cursor is, -1 → 1 each way, never longer than 1 in total.
          let ox = Math.max(-1, Math.min(1, dx / hw)), oy = Math.max(-1, Math.min(1, dy / hh));
          const len = Math.hypot(ox, oy);
          if (len > 1) { ox /= len; oy /= len; }
          // Small buttons move less than big ones.
          const far = Math.min(DRIFT, r.height * 0.09) * near;
          b.style.setProperty('--magx', `${(ox * far).toFixed(1)}px`);
          b.style.setProperty('--magy', `${(oy * far).toFixed(1)}px`);
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

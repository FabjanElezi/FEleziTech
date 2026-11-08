'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/components/LanguageProvider';
import CornerAccents from '@/components/CornerAccents';

/**
 * "traceroute fabjan-elezi" — the CV as a network path.
 *
 * Every hop is a real place with real dates, taken from the experience and
 * education entries on this site; nothing here is invented. The joke is for
 * the network people, but each line still reads as a plain CV entry so that
 * someone in HR loses nothing by not getting it.
 *
 * No canvas and no 3D: a list, a rail and one CSS animation.
 *
 * Rendered inside the Experience section as an alternate view of the same
 * dates, never as a section of its own. The timeline stays the default.
 */

type Hop = {
  /** Hop number, as traceroute prints it. */
  n: number;
  /** Hostname-shaped place. */
  host: string;
  /** Years, kept numeric so they read the same in every language. */
  when: string;
  /** i18n key: the one-line summary on the hop line itself. */
  line: string;
  /** i18n key: the one or two lines revealed on hover/click. */
  detail: string;
};

const HOPS: Hop[] = [
  { n: 1, host: 'tirana.al',         when: '2022–2026', line: 'tr.h1',  detail: 'tr.h1d' },
  { n: 2, host: 'stuttgart.de',      when: '2024',      line: 'tr.h2',  detail: 'tr.h2d' },
  { n: 3, host: 'brno.cz',           when: '2025',      line: 'tr.h3',  detail: 'tr.h3d' },
  { n: 4, host: 'adirondacks.ny.us', when: '2025, 2026',line: 'tr.h4',  detail: 'tr.h4d' },
  { n: 5, host: 'tirana.al',         when: '2026',      line: 'tr.h5',  detail: 'tr.h5d' },
  { n: 6, host: 'aachen.de',         when: '2026–',     line: 'tr.h6',  detail: 'tr.h6d' },
];

export default function Traceroute() {
  const { t, lang } = useLang();
  // Clicked stays open; hovering only previews. Both drive the same panel so a
  // phone (no hover) and a keyboard (no pointer) reach it the same way.
  const [open, setOpen] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const railRef = useRef<HTMLOListElement>(null);

  // The packet travels from the first node to the last one. That distance is
  // not a round percentage of the list: the last hop's text, and so the list's
  // height, changes with the language and the width. Measure it instead, and
  // keep it measured -- the observer catches font loading, rotation and a
  // language switch alike.
  useEffect(() => {
    const ol = railRef.current;
    if (!ol) return;
    const measure = () => {
      const nodes = ol.querySelectorAll<HTMLElement>('.tr-node');
      if (nodes.length < 2) return;
      const olTop = ol.getBoundingClientRect().top;
      const first = nodes[0].getBoundingClientRect().top;
      const last = nodes[nodes.length - 1].getBoundingClientRect().top;
      ol.style.setProperty('--rail-start', `${first - olTop}px`);
      ol.style.setProperty('--rail', `${last - first}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
  }, [lang]);

  return (
    <div className="glass rounded-2xl relative overflow-hidden tr-term">
      <CornerAccents color="rgba(8,145,178,0.38)" />

      {/* Window bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
        <span className="tr-dot" style={{ background: 'rgba(248,113,113,0.65)' }} />
        <span className="tr-dot" style={{ background: 'rgba(251,191,36,0.65)' }} />
        <span className="tr-dot" style={{ background: 'rgba(52,211,153,0.65)' }} />
        <span className="ml-2 text-[11px] text-slate-500 font-mono truncate">
          {t('tr.window')}
        </span>
      </div>

      <div className="px-4 sm:px-6 py-5 font-mono text-[12.5px] sm:text-sm leading-relaxed">
        {/* Command + preamble */}
        <p className="text-slate-300">
          <span className="text-cyan-400">$</span> traceroute fabjan-elezi
        </p>
        <p className="text-slate-500 text-[11.5px] sm:text-xs mt-1 mb-4">
          {t('tr.preamble')}
        </p>

        {/* Hops */}
        <ol ref={railRef} className="relative tr-rail">
          <span className="tr-packet" aria-hidden="true" />
          {HOPS.map((h, i) => {
            const shown = open === h.n || hover === h.n;
            const last = i === HOPS.length - 1;
            return (
              <li key={h.n} className="tr-hop">
                <button
                  type="button"
                  onClick={() => setOpen(open === h.n ? null : h.n)}
                  onMouseEnter={() => setHover(h.n)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(h.n)}
                  onBlur={() => setHover(null)}
                  aria-expanded={shown}
                  aria-controls={`hop-${h.n}`}
                  className="tr-hop-btn"
                >
                  <span className={`tr-node ${last ? 'tr-node-last' : ''}`} aria-hidden="true" />
                  <span className="tr-n">{h.n}</span>
                  <span className="tr-host">{h.host}</span>
                  <span className="tr-when">({h.when})</span>
                  <span className="tr-line">{t(h.line)}</span>
                </button>
                <div
                  id={`hop-${h.n}`}
                  className="tr-detail"
                  data-open={shown ? 'true' : 'false'}
                >
                  <p>{t(h.detail)}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-4 text-emerald-400">{t('tr.done')}</p>
        <p className="text-slate-600 text-[11px] sm:text-xs mt-2">{t('tr.hint')}</p>
      </div>
    </div>
  );
}

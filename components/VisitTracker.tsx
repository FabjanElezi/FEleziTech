'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Sends two lightweight pings per page view: one when the page has been open a
// moment, one when the visitor leaves with how long they stayed and how far
// they read. No cookies, no localStorage, nothing
// stored in the browser; the server records a pseudonymous row.
//
// A link shared as /?ref=company-name (or with utm_source) is reported back so
// the admin panel can show which shared link brought the visit.

const post = (body: string) => {
  try {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon?.('/api/track', blob)) return;
  } catch { /* fall through to fetch */ }
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
};

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') return;

    const params = new URLSearchParams(window.location.search);
    const tag = params.get('ref') || params.get('utm_source') || params.get('utm_campaign');

    const vid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const started = Date.now();

    // What the browser tells us about itself anyway, with each request.
    const nav = navigator as Navigator & {
      hardwareConcurrency?: number;
      deviceMemory?: number;
      connection?: { effectiveType?: string };
    };
    const hardware = [
      nav.hardwareConcurrency ? `${nav.hardwareConcurrency} cores` : '',
      nav.deviceMemory ? `${nav.deviceMemory} GB` : '',
    ].filter(Boolean).join(' · ') || null;

    let tz: string | null = null;
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch { /* ignore */ }

    const view = JSON.stringify({
      kind: 'view',
      vid,
      path: pathname,
      referrer: document.referrer || null,
      tag: tag || null,
      screen: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      lang: navigator.language || null,
      tz,
      hardware,
      connection: nav.connection?.effectiveType ?? null,
    });

    let sentView = false;
    // Wait a moment so a bounce or a prefetch doesn't count as a visit.
    const t = setTimeout(() => { sentView = true; post(view); }, 2500);

    // How far down they read, and what they clicked.
    let scroll = 0;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? ((window.scrollY / h) * 100) : 100;
      if (pct > scroll) scroll = Math.min(100, pct);
    };

    let left = false;
    const leave = () => {
      if (left || !sentView) return;
      left = true;
      post(JSON.stringify({
        kind: 'leave',
        vid,
        dwell: Math.round((Date.now() - started) / 1000),
        scroll: Math.round(scroll),
      }));
    };
    const onHide = () => { if (document.visibilityState === 'hidden') leave(); };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', leave);
    document.addEventListener('visibilitychange', onHide);

    return () => {
      clearTimeout(t);
      leave();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', leave);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [pathname]);

  return null;
}

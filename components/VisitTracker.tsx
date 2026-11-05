'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Sends one lightweight ping per page view. No cookies, no localStorage,
// nothing stored in the browser; the server records a pseudonymous row.
//
// A link shared as /?ref=company-name (or with utm_source) is reported back so
// the admin panel can show which shared link brought the visit.
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') return;

    const params = new URLSearchParams(window.location.search);
    const tag = params.get('ref') || params.get('utm_source') || params.get('utm_campaign');

    const body = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
      tag: tag || null,
    });

    const send = () => {
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

    // Wait a moment so a bounce or a prefetch doesn't count as a visit.
    const t = setTimeout(send, 2500);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}

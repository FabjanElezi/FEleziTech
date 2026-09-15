'use client';
import { useEffect, useRef, useState } from 'react';
import { Home, User, Code2, FolderOpen, Mail } from 'lucide-react';
import { usePathname } from 'next/navigation';

const sections = [
  { id: 'hero',     label: 'Home',    Icon: Home },
  { id: 'about',    label: 'About',   Icon: User },
  { id: 'skills',   label: 'Skills',  Icon: Code2 },
  { id: 'projects', label: 'Projects',Icon: FolderOpen },
  { id: 'contact',  label: 'Contact', Icon: Mail },
];

export default function MobileDock() {
  const pathname = usePathname();
  const [active, setActive] = useState('hero');
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    const observers: IntersectionObserver[] = [];
    sections.forEach(({ id }) => {
      if (id === 'hero') return;
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    let lastY = window.scrollY;
    let hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      const diff = y - lastY;
      if (y < 150) setActive('hero');
      if (diff > 8 && y > 80 && !hidden) {
        if (dockRef.current) dockRef.current.style.transform = 'translateX(-50%) translateY(calc(100% + 24px))';
        hidden = true;
      } else if (diff < -5 && hidden) {
        if (dockRef.current) dockRef.current.style.transform = 'translateX(-50%)';
        hidden = false;
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observers.forEach(o => o.disconnect());
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  if (pathname.startsWith('/admin')) return null;

  const handleClick = (id: string) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={dockRef}
      className="md:hidden fixed bottom-5 left-1/2 z-50"
      style={{ transform: 'translateX(-50%)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '6px 10px',
          borderRadius: '100px',
          background: 'rgba(7,8,12,0.6)',
          backdropFilter: 'blur(48px) saturate(210%) brightness(1.12) contrast(0.94)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(6,182,212,0.08), 0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.2)',
        }}
      >
        {sections.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              aria-label={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                padding: '7px 11px',
                borderRadius: '80px',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'rgba(34,211,238,0.11)' : 'transparent',
                boxShadow: isActive
                  ? 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(34,211,238,0.3)'
                  : 'none',
                transition: 'background 0.22s ease, box-shadow 0.22s ease',
                minWidth: 48,
                minHeight: 48,
              }}
            >
              <Icon
                size={19}
                style={{
                  color: isActive ? '#22d3ee' : 'rgba(148,163,184,0.75)',
                  filter: isActive ? 'drop-shadow(0 0 7px rgba(34,211,238,0.75))' : 'none',
                  transition: 'color 0.22s ease, filter 0.22s ease',
                }}
              />
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  color: isActive ? '#22d3ee' : 'rgba(148,163,184,0.55)',
                  transition: 'color 0.22s ease',
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

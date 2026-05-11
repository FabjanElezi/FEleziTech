'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const links = [
  { href: '#about',      label: 'About' },
  { href: '#skills',     label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects',   label: 'Projects' },
  { href: '#contact',    label: 'Contact' },
];

export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const linkRefs  = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [open, setOpen] = useState(false);

  // Scroll → glass + cyan glow + hide/show
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let lastY  = window.scrollY;
    let hidden = false;

    const update = () => {
      const y    = window.scrollY;
      const diff = y - lastY;

      if (y > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');

      if (diff > 8 && y > 80 && !hidden) {
        header.classList.add('nav-hidden');
        hidden = true;
      } else if (diff < -5 && hidden) {
        header.classList.remove('nav-hidden');
        hidden = false;
      }

      lastY = y;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Active section highlight
  useEffect(() => {
    const sectionIds = links.map((l) => l.href.slice(1));
    const setActive  = (id: string) => {
      linkRefs.current.forEach((el, key) => {
        if (key === id) el.classList.add('active');
        else el.classList.remove('active');
      });
    };

    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <header ref={headerRef} className="navbar fixed z-50">
      <nav className="h-14 flex items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" className="hover:opacity-80 transition-opacity flex items-center mt-1 shrink-0">
          <Image src="/logo.png" alt="Fabjan Elezi" width={160} height={53} className="object-contain" priority />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="nav-link text-sm text-slate-400"
                ref={(el) => {
                  if (el) linkRefs.current.set(l.href.slice(1), el);
                  else linkRefs.current.delete(l.href.slice(1));
                }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <Link href="/admin" className="btn-ghost text-xs py-1.5 px-4">
            Admin
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            className="text-slate-400 hover:text-white transition-colors flex items-center justify-center"
            style={{ minWidth: 44, minHeight: 44 }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden border-t"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(4,7,18,0.6)', backdropFilter: 'blur(24px)', borderRadius: '0 0 1rem 1rem' }}
        >
          <ul className="flex flex-col px-5 py-3 gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="mobile-menu-link text-slate-300 transition-colors flex items-center"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/admin"
                className="text-purple-400 text-sm flex items-center"
                style={{ minHeight: 44 }}
                onClick={() => setOpen(false)}
              >
                Admin Panel →
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

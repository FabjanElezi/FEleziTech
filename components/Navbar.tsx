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
  const headerRef  = useRef<HTMLElement>(null);
  const linkRefs   = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [open, setOpen] = useState(false);

  // Scroll → toggle glass background (no React re-render)
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const update = () => {
      if (window.scrollY > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Active section → highlight nav link (no React re-render)
  useEffect(() => {
    const sectionIds = links.map((l) => l.href.slice(1));
    const setActive = (id: string) => {
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
    <header ref={headerRef} className="navbar fixed top-0 inset-x-0 z-50">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity flex items-center self-center mt-1">
          <Image src="/logo.png" alt="Fabjan Elezi" width={200} height={66} className="object-contain" priority />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
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

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/admin" className="btn-ghost text-xs py-1.5 px-4">
            Admin
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="text-slate-400 hover:text-white transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden glass border-t border-white/5">
          <ul className="flex flex-col px-6 py-4 gap-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/admin" className="text-purple-400 text-sm" onClick={() => setOpen(false)}>
                Admin Panel →
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

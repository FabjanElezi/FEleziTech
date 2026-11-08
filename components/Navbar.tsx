'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitch from '@/components/LanguageSwitch';
import { useLang } from '@/components/LanguageProvider';

const links = [
  { href: '#about',      label: 'nav.about' },
  { href: '#skills',     label: 'nav.skills' },
  { href: '#experience', label: 'nav.experience' },
  { href: '#projects',   label: 'nav.projects' },
  { href: '#contact',    label: 'nav.contact' },
];

export default function Navbar() {
  const { t } = useLang();
  const headerRef = useRef<HTMLElement>(null);
  const linkRefs  = useRef<Map<string, HTMLAnchorElement>>(new Map());

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
          <Image src="/logo.svg" alt="Fabjan Elezi Tech" width={160} height={53} className="object-contain" priority fetchPriority="high" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-4 lg:gap-6 mx-4">
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
                {t(l.label)}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
          <LanguageSwitch />
          <ThemeToggle />
        </div>

        {/* Mobile right. No admin link: /admin is reached by typing the URL,
            so visitors are not shown a door they cannot open. */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          <LanguageSwitch compact />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, FileText, Lock } from 'lucide-react';
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

/** His own way into Admin: a quiet lock at the far edge of the bar. Not prefetched, and not for crawlers. */
function AdminLock({ label }: { label: string }) {
  return (
    <Link href="/admin" prefetch={false} rel="nofollow" aria-label={label} title={label} className="nav-lock">
      <Lock size={14} aria-hidden="true" />
    </Link>
  );
}

/** `hasCv`: a CV is uploaded, so the menu can offer it. */
export default function Navbar({ hasCv = false }: { hasCv?: boolean }) {
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
      <nav className="h-14 flex items-center justify-between px-3 sm:px-5">
        {/* Logo */}
        <Link href="/" className="hover:opacity-80 transition-opacity flex items-center mt-1 shrink-0">
          <Image src="/logo.svg" alt="Fabjan Elezi" width={160} height={53} className="object-contain w-[112px] sm:w-[160px] h-auto" priority fetchPriority="high" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-4 xl:gap-6 mx-4">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="nav-link whitespace-nowrap text-[13px] xl:text-sm text-slate-400"
                ref={(el) => {
                  if (el) linkRefs.current.set(l.href.slice(1), el);
                  else linkRefs.current.delete(l.href.slice(1));
                }}
              >
                {t(l.label)}
              </a>
            </li>
          ))}
          <li>
            <Link href="/services" className="nav-link whitespace-nowrap text-[13px] xl:text-sm text-slate-400 inline-flex items-center gap-0.5">
              {t('nav.services')} <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </li>
        </ul>

        {/* Desktop right */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
          <LanguageSwitch />
          <ThemeToggle />
          {hasCv && (
            <a
              href="/api/cv"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('hero.viewCv')}
              className="btn-ghost nav-cv text-xs py-1.5 px-4 inline-flex items-center gap-1.5"
            >
              CV <FileText size={13} aria-hidden="true" />
            </a>
          )}
          <AdminLock label={t('nav.admin')} />
        </div>

        {/* Mobile right: language, theme, CV, and the lock from 360px */}
        <div className="lg:hidden flex items-center gap-1.5 sm:gap-2 shrink-0">
          <LanguageSwitch compact />
          <ThemeToggle />
          {hasCv && (
            <a
              href="/api/cv"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('hero.viewCv')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              style={{ minHeight: 44, display: 'flex', alignItems: 'center', gap: 4, padding: '0 6px' }}
            >
              CV <FileText size={13} aria-hidden="true" />
            </a>
          )}
          <AdminLock label={t('nav.admin')} />
        </div>
      </nav>
    </header>
  );
}

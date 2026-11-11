'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, Mail } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { Portfolio } from '@/types';

interface Props { portfolio?: Portfolio | null }

// The hero's trend line, drawn once more as a quiet closing line.
const TREND =
  'M0 53.4C25 52.3 100 47.6 150 46.9C200 46.2 250 50.3 300 49C350 47.7 400 40.5 450 39.3C500 38.1 550 43.4 600 42C650 40.6 700 32.2 750 30.7C800 29.2 850 34.6 900 32.8C950 31 1000 23.4 1050 19.9C1100 16.4 1175 13.2 1200 11.8';

const SECTIONS = [
  { href: '/#about', label: 'nav.about' },
  { href: '/#skills', label: 'nav.skills' },
  { href: '/#experience', label: 'nav.experience' },
  { href: '/#projects', label: 'nav.projects' },
  { href: '/#contact', label: 'nav.contact' },
];

/**
 * The page is ~13,000px tall on a phone. Someone who reads to the end should
 * not have to scroll back to the top to find the menu or a way to reach him,
 * so the footer carries both: every section, and every contact route.
 */
export default function Footer({ portfolio }: Props) {
  const { t, lang } = useLang();
  const ref = useRef<HTMLElement>(null);
  const [time, setTime] = useState('');
  const linkedin = portfolio?.linkedin;
  const github = portfolio?.github;
  const email = portfolio?.email;
  const place = portfolio?.location || 'Aachen, Germany';

  // Draw the closing line when the footer comes into view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const seen = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('is-in'); seen.disconnect(); }
    }, { threshold: 0.2 });
    seen.observe(el);
    return () => seen.disconnect();
  }, []);

  // His local time, so someone in another time zone knows when to expect a reply.
  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Berlin' }).format(new Date()));
    const first = setTimeout(tick, 0);
    const every = setInterval(tick, 30_000);
    return () => { clearTimeout(first); clearInterval(every); };
  }, [lang]);

  // The scroll-to-top button is fixed at bottom 2rem, right 1.5rem, so on a
  // phone it parks exactly where the last lines sit. The extra bottom padding
  // lifts them clear of it and of the bottom bar.
  return (
    <footer ref={ref} className="site-footer relative px-6 pt-24 pb-28 lg:pb-8">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(8,145,178,0.25), rgba(6,182,212,0.2), transparent)' }}
      />
      <svg className="footer-trend" viewBox="0 0 1200 70" preserveAspectRatio="none" aria-hidden="true">
        <path d={TREND} pathLength={1} />
      </svg>

      {/* Phones: brand on top, the two link lists side by side below it */}
      <div className="max-w-5xl mx-auto grid gap-x-6 gap-y-10 grid-cols-2 text-center md:text-left md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Image src="/logo.svg" alt="Fabjan Elezi" width={130} height={43} className="h-auto w-[130px] mx-auto md:mx-0" />
          <p className="text-body text-sm mt-4 max-w-xs mx-auto md:mx-0">{t('hero.role1')}.</p>
          <p className="mt-3 text-xs text-slate-500 inline-flex items-center gap-2">
            <span className="footer-dot" aria-hidden="true" />
            {place}{time && ` · ${time} ${t('footer.localTime')}`}
          </p>
        </div>

        <nav aria-label={t('footer.navigate')}>
          <h2 className="footer-heading">{t('footer.navigate')}</h2>
          <ul className="footer-links">
            {SECTIONS.map((s) => (
              <li key={s.href}><a href={s.href}>{t(s.label)}</a></li>
            ))}
            <li><Link href="/services">{t('nav.services')}</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="footer-heading">{t('footer.contact')}</h2>
          <ul className="footer-links">
            {email && (
              <li><a href={`mailto:${email}`}><Mail size={14} aria-hidden="true" />{t('footer.email')}</a></li>
            )}
            {linkedin && (
              <li>
                <a href={linkedin} target="_blank" rel="noopener noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </li>
            )}
            {github && (
              <li>
                <a href={github} target="_blank" rel="noopener noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </li>
            )}
            {portfolio?.cvUrl && (
              <li><a href="/api/cv" target="_blank" rel="noopener noreferrer"><FileText size={14} aria-hidden="true" />{t('hero.viewCv')}</a></li>
            )}
          </ul>
        </div>
      </div>

      <div className="footer-bottom max-w-5xl mx-auto mt-10 pt-5 md:pr-20 xl:pr-0 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-600">
        <p>© {new Date().getFullYear()} Fabjan Elezi. {t('footer.rights')}</p>
        <p className="flex items-center gap-4">
          <span>{t('footer.built')}</span>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">{t('footer.privacy')}</Link>
        </p>
      </div>
    </footer>
  );
}

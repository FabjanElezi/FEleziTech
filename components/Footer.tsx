'use client';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { Portfolio } from '@/types';

interface Props { portfolio?: Portfolio | null }

/**
 * The page is ~13,000px tall on a phone. Someone who reads to the end should
 * not have to scroll back to the hero to find a way to reach him, and the
 * floating sidebar that carries these links is desktop-only.
 */
export default function Footer({ portfolio }: Props) {
  const { t } = useLang();
  const linkedin = portfolio?.linkedin;
  const github = portfolio?.github;
  const email = portfolio?.email;

  // The scroll-to-top button is fixed at bottom 2rem, right 1.5rem, so on a
  // phone it parks exactly where these last lines sit and covers the end of the
  // copyright. The extra bottom padding lifts them clear of it.
  return (
    <footer className="pt-8 pb-28 md:pb-8 px-6 text-center relative">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(8,145,178,0.25), rgba(6,182,212,0.2), transparent)' }}
      />

      {(linkedin || github || email) && (
        <div className="flex items-center justify-center gap-2 mb-5">
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex items-center justify-center w-11 h-11 rounded-xl text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex items-center justify-center w-11 h-11 rounded-xl text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              aria-label="Email"
              className="flex items-center justify-center w-11 h-11 rounded-xl text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <Mail size={20} aria-hidden="true" />
            </a>
          )}
        </div>
      )}

      <p className="text-slate-600 text-sm">
        © {new Date().getFullYear()} Fabjan Elezi. {t('footer.rights')}
      </p>
      <Link href="/privacy" className="text-slate-600 hover:text-cyan-400 text-xs mt-2 inline-block transition-colors">
        {t('footer.privacy')}
      </Link>
    </footer>
  );
}

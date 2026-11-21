'use client';
import Link from 'next/link';
import { useLang } from '@/components/LanguageProvider';
import { SITE_UPDATED } from '@/lib/site';

/**
 * The legal line at the very bottom: copyright, Impressum, privacy, last update.
 * One component so the home page footer and the text pages always say the same.
 * It wraps onto a few centred lines on phones instead of overflowing.
 */
export default function LegalBar() {
  const { t, lang } = useLang();

  return (
    <p className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 text-xs text-slate-600">
      <span>© {new Date().getFullYear()} Fabjan Elezi</span>
      <span aria-hidden="true">·</span>
      <Link href="/impressum" className="hover:text-cyan-400 transition-colors">{t('footer.impressum')}</Link>
      <span aria-hidden="true">·</span>
      <Link href="/privacy" className="hover:text-cyan-400 transition-colors">{t('footer.privacy')}</Link>
      <span aria-hidden="true">·</span>
      <span>{t('footer.updated')} {SITE_UPDATED[lang]}</span>
      <span aria-hidden="true">·</span>
      <span>{t('footer.builtWith')}</span>
    </p>
  );
}

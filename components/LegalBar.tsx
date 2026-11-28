'use client';
import Link from 'next/link';
import { useLang } from '@/components/LanguageProvider';

/**
 * The legal line at the very bottom: copyright, Impressum, privacy.
 * One component so the home page footer and the text pages always say the same.
 * It wraps onto a second centred line on narrow phones instead of overflowing.
 */
export default function LegalBar() {
  const { t } = useLang();

  return (
    <p className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 text-xs text-body">
      <span>© {new Date().getFullYear()} Fabjan Elezi</span>
      <span aria-hidden="true">·</span>
      <Link href="/impressum" className="hover:text-cyan-400 transition-colors">{t('footer.impressum')}</Link>
      <span aria-hidden="true">·</span>
      <Link href="/privacy" className="hover:text-cyan-400 transition-colors">{t('footer.privacy')}</Link>
    </p>
  );
}

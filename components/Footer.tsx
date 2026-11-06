'use client';
import Link from 'next/link';
import { useLang } from '@/components/LanguageProvider';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="py-8 px-6 text-center relative">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(8,145,178,0.25), rgba(6,182,212,0.2), transparent)' }}
      />
      <p className="text-slate-600 text-sm">
        © {new Date().getFullYear()} Fabjan Elezi. {t('footer.rights')}
      </p>
      <Link href="/privacy" className="text-slate-600 hover:text-cyan-400 text-xs mt-2 inline-block transition-colors">
        {t('footer.privacy')}
      </Link>
    </footer>
  );
}

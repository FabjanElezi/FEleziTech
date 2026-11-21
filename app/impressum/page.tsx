import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';
import LegalBar from '@/components/LegalBar';

/**
 * The legal notice (Impressum). German only, as it is a German legal notice.
 * Not in the sitemap and not indexed: people reach it from the footer link,
 * it does not need to show up in search results.
 */

// Fill these in before the page goes live.
const IMPRESSUM = { name: '[NAME]', street: '[STREET]', zipCity: '[ZIP CITY]', email: '[EMAIL]', secondContact: '[SECOND CONTACT]' };

export const metadata: Metadata = {
  title: 'Impressum',
  robots: { index: false, follow: true },
};

export default function ImpressumPage() {
  return (
    <main lang="de" className="relative min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-10">
          <ArrowLeft size={15} /> Zurück zum Portfolio
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Scale size={22} className="text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Impressum</h1>
        </div>

        <div className="space-y-7">
          <section>
            <h2 className="text-white font-semibold mb-2">Angaben gemäß § 5 DDG</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {IMPRESSUM.name}<br />
              {IMPRESSUM.street}<br />
              {IMPRESSUM.zipCity}
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">Kontakt</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              E-Mail: {IMPRESSUM.email}<br />
              {IMPRESSUM.secondContact}
            </p>
          </section>

          <p className="text-slate-400 text-sm leading-relaxed">
            Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV: {IMPRESSUM.name}, Anschrift wie oben
          </p>
        </div>

        <footer className="mt-16 pt-5 border-t border-white/5">
          <LegalBar />
        </footer>
      </div>
    </main>
  );
}

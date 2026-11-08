'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Mail, ArrowUpRight } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import LanguageSwitch from '@/components/LanguageSwitch';
import ThemeToggle from '@/components/ThemeToggle';
import ServiceCards from '@/components/Services';
import CornerAccents from '@/components/CornerAccents';
import Footer from '@/components/Footer';
import { Portfolio, Service } from '@/types';

const INSTAGRAM = { handle: 'revoweb_official', href: 'https://www.instagram.com/revoweb_official/' };
type Lang = 'en' | 'de' | 'sq';
const WORK: { title: string; img: string; href?: string; stack: string; tag: Record<Lang, string>; text: Record<Lang, string> }[] = [
  {
    title: 'ParaFluent',
    img: '/work/parafluent.jpg',
    href: 'https://parafluent.me',
    stack: 'Next.js · Postgres',
    tag: { en: 'Website + booking system', de: 'Website + Buchungssystem', sq: 'Faqe + sistem rezervimesh' },
    text: {
      en: 'Bilingual website and booking system for an online English teacher, with level test, live time slots, automatic emails and an admin panel she manages herself.',
      de: 'Zweisprachige Website mit Buchungssystem für eine Online-Englischlehrerin – mit Einstufungstest, Live-Terminen, automatischen E-Mails und einem Admin-Bereich, den sie selbst pflegt.',
      sq: 'Faqe dygjuhëshe me sistem rezervimesh për një mësuese anglishteje online – me test niveli, orare live, email-e automatike dhe panel që e menaxhon vetë.',
    },
  },
  {
    title: 'FETech Analytics',
    img: '/work/fetech-analytics.jpg',
    href: 'https://fetech-analytics.vercel.app/',
    stack: 'Next.js · PostgreSQL',
    tag: { en: 'Data dashboard', de: 'Daten-Dashboard', sq: 'Dashboard të dhënash' },
    text: {
      en: 'Sales, customers and forecasts for a retail business in one dashboard.',
      de: 'Umsatz, Kunden und Prognosen eines Händlers in einem Dashboard.',
      sq: 'Shitjet, klientët dhe parashikimet e një biznesi në një dashboard.',
    },
  },
  {
    title: 'Bio Farm',
    img: '/work/bio-farm.jpg',
    stack: 'Django · Bootstrap',
    tag: { en: 'Business website', de: 'Unternehmenswebsite', sq: 'Faqe biznesi' },
    text: {
      en: 'Website for a farm stay with menu, rooms and booking. Built during an internship.',
      de: 'Website für einen Bauernhof mit Menü, Zimmern und Buchung. Im Praktikum gebaut.',
      sq: 'Faqe për një agroturizëm me menu, dhoma dhe rezervim. E ndërtuar gjatë praktikës.',
    },
  },
  {
    title: 'RevoHelp',
    img: '/work/revohelp.jpg',
    href: 'https://monarchsilgrit.wixsite.com/revohelpofficial',
    stack: 'Wix',
    tag: { en: 'Startup website', de: 'Startup-Website', sq: 'Faqe startup-i' },
    text: {
      en: 'Landing page and product pages for a startup concept.',
      de: 'Landingpage und Produktseiten für ein Startup-Konzept.',
      sq: 'Landing page dhe faqe produkti për një koncept startup-i.',
    },
  },
];

const FALLBACK_PHONE = '+49 174 8696164';
// Client work goes to the RevoWeb inbox, not the job-application one.
const SERVICES_EMAIL = 'revowebofficial@gmail.com';

const COPY = {
  en: {
    back: 'Portfolio',
    eyebrow: 'Freelance services',
    title: 'Websites, dashboards',
    titleAccent: '& IT for your business',
    sub: 'I take on a small number of projects for businesses and professionals. You get one person from the first call to launch.',
    chips: ['Albania · Europe · Worldwide', 'Free first consultation', 'Price on request'],
    whatsapp: 'Message on WhatsApp',
    instagram: 'See my work',
    whatTitle: 'What I offer',
    workTitle: 'Recent work',
    visit: 'Visit',
    howTitle: 'How it works',
    steps: [
      { h: 'Free consultation', p: 'Tell me what you need on WhatsApp, Telegram or email. We figure out together what makes sense.' },
      { h: 'Clear offer', p: 'You get the scope, timeline and price in writing before any work starts. No surprises.' },
      { h: 'Build & launch', p: 'You see progress along the way. I set everything up, go live with you and hand it over.' },
    ],
    contactTitle: 'Let’s talk',
    contactSub: 'The fastest way to reach me is WhatsApp or Telegram.',
    phoneLabel: 'WhatsApp · Telegram',
    emailLabel: 'Email',
    igLabel: 'Instagram',
    igNote: 'Client work and updates',
  },
  de: {
    back: 'Portfolio',
    eyebrow: 'Freelance-Leistungen',
    title: 'Websites, Dashboards',
    titleAccent: '& IT für Ihr Unternehmen',
    sub: 'Ich übernehme eine kleine Zahl von Projekten für Unternehmen und Selbstständige. Vom ersten Gespräch bis zum Launch haben Sie eine Ansprechperson.',
    chips: ['Albanien · Europa · weltweit', 'Kostenloses Erstgespräch', 'Preis auf Anfrage'],
    whatsapp: 'Auf WhatsApp schreiben',
    instagram: 'Meine Arbeiten',
    whatTitle: 'Was ich anbiete',
    workTitle: 'Aktuelle Arbeiten',
    visit: 'Ansehen',
    howTitle: 'So läuft es ab',
    steps: [
      { h: 'Kostenloses Erstgespräch', p: 'Schreiben Sie mir per WhatsApp, Telegram oder E-Mail, was Sie brauchen. Gemeinsam klären wir, was sinnvoll ist.' },
      { h: 'Klares Angebot', p: 'Umfang, Zeitplan und Preis bekommen Sie schriftlich, bevor die Arbeit beginnt. Keine Überraschungen.' },
      { h: 'Umsetzung & Launch', p: 'Sie sehen den Fortschritt unterwegs. Ich richte alles ein, gehe mit Ihnen live und übergebe das Projekt.' },
    ],
    contactTitle: 'Sprechen wir',
    contactSub: 'Am schnellsten erreichen Sie mich per WhatsApp oder Telegram.',
    phoneLabel: 'WhatsApp · Telegram',
    emailLabel: 'E-Mail',
    igLabel: 'Instagram',
    igNote: 'Kundenprojekte und Neuigkeiten',
  },
  sq: {
    back: 'Portofoli',
    eyebrow: 'Shërbime freelance',
    title: 'Faqe web, dashboard-e',
    titleAccent: '& IT për biznesin tuaj',
    sub: 'Marr përsipër një numër të vogël projektesh për biznese dhe profesionistë. Keni një person të vetëm nga biseda e parë deri në publikim.',
    chips: ['Shqipëri · Europë · Mbarë botën', 'Konsulta e parë falas', 'Çmimi sipas kërkesës'],
    whatsapp: 'Shkruani në WhatsApp',
    instagram: 'Shikoni punët',
    whatTitle: 'Çfarë ofroj',
    workTitle: 'Punë të fundit',
    visit: 'Shiko',
    howTitle: 'Si funksionon',
    steps: [
      { h: 'Konsultë falas', p: 'Më tregoni çfarë ju duhet në WhatsApp, Telegram ose email. Bashkë shohim çfarë ka kuptim.' },
      { h: 'Ofertë e qartë', p: 'Merrni me shkrim fushën, afatin dhe çmimin para se të fillojë puna. Pa surpriza.' },
      { h: 'Ndërtim & publikim', p: 'E shihni progresin gjatë rrugës. Unë i konfiguroj të gjitha, e publikojmë bashkë dhe jua dorëzoj.' },
    ],
    contactTitle: 'Le të flasim',
    contactSub: 'Mënyra më e shpejtë për të më kontaktuar është WhatsApp ose Telegram.',
    phoneLabel: 'WhatsApp · Telegram',
    emailLabel: 'Email',
    igLabel: 'Instagram',
    igNote: 'Punë për klientë dhe të reja',
  },
} as const;

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="w-8 h-px bg-cyan-500" />
      <h2 className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">{children}</h2>
    </div>
  );
}

/**
 * Freelance services on a page of their own, so the home page stays a
 * portfolio for job applications. Short on purpose: what, how, and how to reach me.
 */
export default function ServicesView({ portfolio, services }: { portfolio: Portfolio | null; services: Service[] }) {
  const { lang } = useLang();
  const c = COPY[lang] ?? COPY.en;
  const l: Lang = lang in COPY ? (lang as Lang) : 'en';
  const phone = portfolio?.phone || FALLBACK_PHONE;
  const email = SERVICES_EMAIL;
  const personalEmail = portfolio?.email || '';
  const whatsapp = `https://wa.me/${phone.replace(/\D/g, '')}`;

  return (
    <main className="relative min-h-screen">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: [
            'radial-gradient(ellipse 65% 55% at 88% 10%, rgba(6,182,212,0.08) 0%, transparent 62%)',
            'radial-gradient(ellipse 60% 50% at 15% 85%, rgba(21,94,117,0.06) 0%, transparent 64%)',
          ].join(', '),
        }}
      />

      <div className="relative z-10">
        <header className="max-w-5xl mx-auto px-6 pt-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors min-h-11">
            <ArrowLeft size={15} /> {c.back}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitch compact />
            <ThemeToggle />
          </div>
        </header>

        {/* Intro */}
        <section className="max-w-5xl mx-auto px-6 pt-14 pb-16">
          <motion.div {...fade} className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-12">
           {/* A face next to the offer: on phones above the headline, on desktop to the right. */}
           <div className="order-1 md:order-2 shrink-0">
            <div
              className="relative w-28 h-28 md:w-60 md:h-60 rounded-full p-[3px] md:p-1"
              style={{ background: 'linear-gradient(135deg, #67e8f9, #0891b2)', boxShadow: '0 0 48px rgba(34,211,238,0.28)' }}
            >
              <Image
                src="/og-photo.jpg"
                alt="Fabjan Elezi"
                width={240}
                height={240}
                priority
                className="w-full h-full rounded-full object-cover"
              />
            </div>
           </div>

           <div className="order-2 md:order-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-cyan-500" />
              <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">{c.eyebrow}</span>
            </div>
            <h1 className="section-title text-white max-w-3xl">
              {c.title} <span className="gradient-text">{c.titleAccent}</span>
            </h1>
            <p className="text-slate-400 mt-5 max-w-2xl leading-relaxed">{c.sub}</p>

            <ul className="flex flex-wrap gap-2 mt-6">
              {c.chips.map((chip) => (
                <li key={chip} className="text-xs text-cyan-300 px-3 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/5">
                  {chip}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 mt-8">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                <MessageCircle size={16} /> {c.whatsapp}
              </a>
              <a href={INSTAGRAM.href} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
                <InstagramIcon size={16} /> {c.instagram}
              </a>
            </div>
           </div>
          </motion.div>
        </section>

        {/* What */}
        {services.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 pb-16">
            <Heading>{c.whatTitle}</Heading>
            <ServiceCards services={services} />
          </section>
        )}

        {/* Work */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <Heading>{c.workTitle}</Heading>
          <div className="grid sm:grid-cols-2 gap-6">
            {WORK.map((w, i) => (
              <motion.article
                key={w.title}
                {...fade}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass rounded-2xl overflow-hidden relative group"
              >
                <div className="relative aspect-[2/1] overflow-hidden border-b border-white/5">
                  <Image
                    src={w.img}
                    alt={`${w.title} — ${w.tag[l]}`}
                    fill
                    sizes="(min-width: 640px) 480px, 100vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-xs text-cyan-400 font-medium">{w.tag[l]}</span>
                    <span className="text-[11px] text-slate-500">{w.stack}</span>
                  </div>
                  <h3 className="text-white font-semibold">{w.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mt-1">{w.text[l]}</p>
                  {w.href && (
                    <a href={w.href} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 mt-3 transition-colors">
                      {c.visit} <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* How */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <Heading>{c.howTitle}</Heading>
          <ol className="grid md:grid-cols-3 gap-6">
            {c.steps.map((s, i) => (
              <motion.li
                key={s.h}
                {...fade}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass rounded-2xl p-6 relative"
              >
                <span className="text-3xl font-bold gradient-text">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-white font-semibold mt-3 mb-2">{s.h}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.p}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* Contact */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <motion.div {...fade} className="glass rounded-2xl p-6 md:p-8 relative">
            <CornerAccents color="rgba(8,145,178,0.38)" />
            <h2 className="text-2xl font-bold text-white">{c.contactTitle}</h2>
            <p className="text-slate-400 text-sm mt-2 mb-6">{c.contactSub}</p>

            <div className="grid md:grid-cols-3 gap-4">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer"
                 className="rounded-xl p-4 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/15 transition-colors">
                <span className="flex items-center gap-2 text-xs text-cyan-300 mb-1"><MessageCircle size={14} /> {c.phoneLabel}</span>
                <span className="text-white font-semibold">{phone}</span>
              </a>
              <div className="rounded-xl p-4 border border-white/10">
                <span className="flex items-center gap-2 text-xs text-slate-400 mb-1"><Mail size={14} /> {c.emailLabel}</span>
                <a href={`mailto:${email}`} className="block text-white font-semibold break-all hover:text-cyan-400 transition-colors">{email}</a>
                {personalEmail && personalEmail !== email && (
                  <a href={`mailto:${personalEmail}`} className="block text-slate-400 text-sm mt-1 break-all hover:text-cyan-400 transition-colors">{personalEmail}</a>
                )}
              </div>
              <a href={INSTAGRAM.href} target="_blank" rel="noopener noreferrer"
                 className="rounded-xl p-4 border border-white/10 hover:border-cyan-500/30 transition-colors">
                <span className="flex items-center gap-2 text-xs text-slate-400 mb-1"><InstagramIcon size={14} /> {c.igLabel} · {c.igNote}</span>
                <span className="text-white font-semibold">@{INSTAGRAM.handle}</span>
              </a>
            </div>
          </motion.div>
        </section>

        <Footer portfolio={portfolio} />
      </div>
    </main>
  );
}

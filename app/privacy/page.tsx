'use client';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';

/**
 * What the site actually does with data, in the visitor's own language.
 * Everything here is checkable against the code: no visit records, no analytics,
 * no cookies, no third-party requests, no IP address stored.
 */

const COPY = {
  en: {
    back: 'Back to portfolio',
    title: 'Privacy',
    updated: 'Last updated 13 November 2026',
    intro:
      'This is a personal portfolio. It does not track its visitors. It sets no cookies, loads nothing from other companies, and shows no advertising.',
    sections: [
      {
        h: 'Nothing is recorded when you visit',
        p: 'The site keeps no record of its visitors. It does not store your IP address, your location, your device or the pages you open. Opening the CV is not counted either.',
      },
      {
        h: 'Earlier visit statistics',
        p: 'Until 13 November 2026 the site kept simple visit statistics. They were switched off on that day and the stored records were deleted.',
      },
      {
        h: 'Storage in your browser',
        p: 'Your chosen language and colour theme are saved in your browser’s local storage so the site remembers them. They never leave your device. No cookies are set.',
      },
      {
        h: 'Hosting',
        p: 'The site runs on Vercel and its content is stored with Neon, both acting as processors. To deliver a page, their servers handle your IP address for that moment, as every web server does, and may keep short-lived technical logs. Nothing is sold, shared or sent to advertisers.',
      },
      {
        h: 'If you contact me',
        p: 'When you write to me by email, WhatsApp, Telegram or LinkedIn, I use what you send only to answer you.',
      },
      {
        h: 'Security',
        p: 'Failed admin login attempts are counted against a salted hash of the address they came from, so that repeated guessing can be stopped. That record is deleted on a successful sign-in and expires by itself.',
      },
      {
        h: 'Your rights',
        p: 'The security record above rests on legitimate interest (Art. 6(1)(f) GDPR). You can ask what is held about you, ask for it to be deleted, or object to its use. Write to the email address in the contact section and it will be done.',
      },
    ],
  },
  de: {
    back: 'Zurück zum Portfolio',
    title: 'Datenschutz',
    updated: 'Zuletzt aktualisiert am 13. November 2026',
    intro:
      'Dies ist ein persönliches Portfolio. Es erfasst seine Besucher nicht. Es setzt keine Cookies, lädt nichts von anderen Unternehmen und zeigt keine Werbung.',
    sections: [
      {
        h: 'Beim Besuch wird nichts erfasst',
        p: 'Die Seite führt keine Aufzeichnungen über ihre Besucher. Weder Ihre IP-Adresse noch Ihr Standort, Ihr Gerät oder die aufgerufenen Seiten werden gespeichert. Auch das Öffnen des Lebenslaufs wird nicht gezählt.',
      },
      {
        h: 'Frühere Besuchsstatistik',
        p: 'Bis zum 13. November 2026 führte die Seite eine einfache Besuchsstatistik. Sie wurde an diesem Tag abgeschaltet, die gespeicherten Einträge wurden gelöscht.',
      },
      {
        h: 'Speicherung in Ihrem Browser',
        p: 'Die gewählte Sprache und das Farbschema werden im lokalen Speicher Ihres Browsers abgelegt, damit die Seite sie behält. Sie verlassen Ihr Gerät nicht. Cookies werden nicht gesetzt.',
      },
      {
        h: 'Hosting',
        p: 'Die Seite läuft bei Vercel, die Inhalte liegen bei Neon; beide handeln als Auftragsverarbeiter. Um eine Seite auszuliefern, verarbeiten ihre Server für diesen Moment Ihre IP-Adresse, wie jeder Webserver, und führen gegebenenfalls kurzlebige technische Protokolle. Es wird nichts verkauft, weitergegeben oder an Werbenetzwerke gesendet.',
      },
      {
        h: 'Wenn Sie mich kontaktieren',
        p: 'Wenn Sie mir per E-Mail, WhatsApp, Telegram oder LinkedIn schreiben, verwende ich Ihre Angaben nur, um Ihnen zu antworten.',
      },
      {
        h: 'Sicherheit',
        p: 'Fehlgeschlagene Anmeldeversuche im Adminbereich werden gegen einen gesalzenen Hash der Herkunftsadresse gezählt, damit wiederholtes Raten gestoppt werden kann. Dieser Eintrag wird bei erfolgreicher Anmeldung gelöscht und verfällt von selbst.',
      },
      {
        h: 'Ihre Rechte',
        p: 'Der Sicherheitseintrag oben beruht auf berechtigtem Interesse (Art. 6 Abs. 1 lit. f DSGVO). Sie können Auskunft verlangen, die Löschung verlangen oder der Verarbeitung widersprechen — eine E-Mail an die im Kontaktbereich genannte Adresse genügt.',
      },
    ],
  },
  sq: {
    back: 'Kthehu te portofoli',
    title: 'Privatësia',
    updated: 'Përditësuar më 13 nëntor 2026',
    intro:
      'Kjo është një faqe personale portofoli. Nuk i gjurmon vizitorët. Nuk vendos cookie, nuk ngarkon asgjë nga kompani të tjera dhe nuk shfaq reklama.',
    sections: [
      {
        h: 'Nuk regjistrohet asgjë kur vizitoni',
        p: 'Faqja nuk mban asnjë të dhënë për vizitorët. Nuk ruhet as adresa juaj IP, as vendndodhja, as pajisja dhe as faqet që hapni. Nuk numërohet as hapja e CV-së.',
      },
      {
        h: 'Statistikat e mëparshme',
        p: 'Deri më 13 nëntor 2026 faqja mbante statistika të thjeshta vizitash. Atë ditë u çaktivizuan dhe të dhënat e ruajtura u fshinë.',
      },
      {
        h: 'Ruajtja në shfletuesin tuaj',
        p: 'Gjuha dhe tema e zgjedhur ruhen në hapësirën lokale të shfletuesit tuaj që faqja t’i mbajë mend. Nuk largohen kurrë nga pajisja juaj. Nuk vendoset asnjë cookie.',
      },
      {
        h: 'Hosting',
        p: 'Faqja funksionon në Vercel dhe përmbajtja ruhet në Neon, të dy si përpunues. Për të dërguar një faqe, serverët e tyre e përdorin adresën tuaj IP për atë çast, si çdo server web, dhe mund të mbajnë regjistra teknikë për një kohë të shkurtër. Asgjë nuk shitet, nuk ndahet dhe nuk u dërgohet rrjeteve reklamuese.',
      },
      {
        h: 'Nëse më kontaktoni',
        p: 'Kur më shkruani me email, WhatsApp, Telegram ose LinkedIn, ato që dërgoni i përdor vetëm për t’ju përgjigjur.',
      },
      {
        h: 'Siguria',
        p: 'Përpjekjet e dështuara për hyrje në panelin e administrimit numërohen kundrejt një hash-i të kripëzuar të adresës nga erdhën, që të ndalet gjetja me hamendje. Ky regjistrim fshihet sapo hyrja është e suksesshme dhe skadon vetvetiu.',
      },
      {
        h: 'Të drejtat tuaja',
        p: 'Regjistrimi i sigurisë më sipër bazohet në interesin legjitim (neni 6(1)(f) i GDPR-së). Mund të kërkoni çfarë mbahet për ju, të kërkoni fshirjen ose të kundërshtoni — mjafton një email në adresën te seksioni i kontaktit.',
      },
    ],
  },
} as const;

export default function PrivacyPage() {
  const { lang } = useLang();
  const c = COPY[lang] ?? COPY.en;

  return (
    <main className="relative min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-10">
          <ArrowLeft size={15} /> {c.back}
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck size={22} className="text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">{c.title}</h1>
        </div>
        <p className="text-xs text-slate-600 mb-8">{c.updated}</p>

        <p className="text-slate-400 leading-relaxed mb-10">{c.intro}</p>

        <div className="space-y-7">
          {c.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-white font-semibold mb-2">{s.h}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

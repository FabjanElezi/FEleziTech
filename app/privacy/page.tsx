'use client';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';

/**
 * What the site actually does with data, in the visitor's own language.
 * Everything here is checkable against the code: no cookies, no third-party
 * requests, no IP address stored.
 */

const COPY = {
  en: {
    back: 'Back to portfolio',
    title: 'Privacy',
    updated: 'Last updated 6 November 2026',
    intro:
      'This is a personal portfolio. It sets no cookies, loads nothing from other companies, and shows no advertising. What follows is the complete list of what it records.',
    sections: [
      {
        h: 'What is recorded when you visit',
        p: 'Each page view is stored as a single row: the page, the site you came from, an approximate location (country, region, city) derived from your IP address, your device type, browser, operating system, screen size, browser language and time zone, how long the page stayed open, and how far you scrolled.',
      },
      {
        h: 'Your IP address is not stored',
        p: 'It is used for three things in the moment the request arrives — to work out the approximate city, to build a pseudonymous identifier, and to check whether it belongs to a cloud data centre (then the visit is marked as a bot) — and is then discarded. The identifier is a SHA-256 hash of the IP address, the browser string, the date and a secret key. It cannot be reversed, and because the date is part of it, it changes every day. Nobody, including the site owner, can connect two visits on different days to the same person.',
      },
      {
        h: 'Opening the CV',
        p: 'Opening the CV is counted, with the same approximate location and device details, plus the ?ref= tag of the link it was opened from if there was one.',
      },
      {
        h: 'Shared links',
        p: 'A link may carry a tag such as /?ref=company-name. It records which shared link was opened. It identifies the link, not you.',
      },
      {
        h: 'Storage in your browser',
        p: 'Your chosen language and colour theme are saved in your browser’s local storage so the site remembers them. They never leave your device. No cookies are set.',
      },
      {
        h: 'Do Not Track',
        p: 'If your browser sends a Do Not Track signal, nothing at all is recorded.',
      },
      {
        h: 'Who else sees it',
        p: 'The site runs on Vercel and its data is stored with Neon, both acting as processors. Nothing is sold, shared or sent to advertisers, and there are no analytics companies involved.',
      },
      {
        h: 'How long it is kept',
        p: 'Visit records are deleted automatically after 180 days.',
      },
      {
        h: 'Security',
        p: 'Failed admin login attempts are counted against a salted hash of the address they came from, so that repeated guessing can be stopped. That record is deleted on a successful sign-in and expires by itself.',
      },
      {
        h: 'Legal basis and your rights',
        p: 'The basis is legitimate interest (Art. 6(1)(f) GDPR) in understanding whether the site works and is read. You can ask what is held about you, ask for it to be deleted, or object to it entirely — write to the email address on the contact section, and it will be done.',
      },
    ],
  },
  de: {
    back: 'Zurück zum Portfolio',
    title: 'Datenschutz',
    updated: 'Zuletzt aktualisiert am 6. November 2026',
    intro:
      'Dies ist ein persönliches Portfolio. Es setzt keine Cookies, lädt nichts von anderen Unternehmen und zeigt keine Werbung. Nachfolgend steht vollständig, was erfasst wird.',
    sections: [
      {
        h: 'Was bei einem Besuch erfasst wird',
        p: 'Jeder Seitenaufruf wird als eine Zeile gespeichert: die Seite, die Herkunftsseite, ein ungefährer Ort (Land, Region, Stadt) aus der IP-Adresse, Gerätetyp, Browser, Betriebssystem, Bildschirmgröße, Browsersprache und Zeitzone, die Verweildauer sowie die Scrolltiefe.',
      },
      {
        h: 'Ihre IP-Adresse wird nicht gespeichert',
        p: 'Sie wird im Moment der Anfrage für drei Dinge verwendet — die ungefähre Stadt zu bestimmen, eine pseudonyme Kennung zu bilden und zu prüfen, ob sie zu einem Cloud-Rechenzentrum gehört (dann wird der Besuch als Bot markiert) — und danach verworfen. Die Kennung ist ein SHA-256-Hash aus IP-Adresse, Browser-Kennung, Datum und einem geheimen Schlüssel. Sie ist nicht umkehrbar und ändert sich täglich, weil das Datum Teil davon ist. Niemand, auch nicht der Betreiber, kann zwei Besuche an verschiedenen Tagen derselben Person zuordnen.',
      },
      {
        h: 'Öffnen des Lebenslaufs',
        p: 'Das Öffnen des Lebenslaufs wird gezählt, mit denselben ungefähren Orts- und Geräteangaben sowie, falls vorhanden, dem ?ref=-Kennzeichen des verwendeten Links.',
      },
      {
        h: 'Geteilte Links',
        p: 'Ein Link kann ein Kennzeichen wie /?ref=firmenname tragen. Erfasst wird, welcher geteilte Link geöffnet wurde — der Link, nicht die Person.',
      },
      {
        h: 'Speicherung in Ihrem Browser',
        p: 'Die gewählte Sprache und das Farbschema werden im lokalen Speicher Ihres Browsers abgelegt, damit die Seite sie behält. Sie verlassen Ihr Gerät nicht. Cookies werden nicht gesetzt.',
      },
      {
        h: 'Do Not Track',
        p: 'Sendet Ihr Browser ein Do-Not-Track-Signal, wird überhaupt nichts erfasst.',
      },
      {
        h: 'Wer sonst Zugriff hat',
        p: 'Die Seite läuft bei Vercel, die Daten liegen bei Neon; beide handeln als Auftragsverarbeiter. Es wird nichts verkauft, weitergegeben oder an Werbenetzwerke gesendet, und es sind keine Analyse-Unternehmen beteiligt.',
      },
      {
        h: 'Speicherdauer',
        p: 'Besuchsdaten werden nach 180 Tagen automatisch gelöscht.',
      },
      {
        h: 'Sicherheit',
        p: 'Fehlgeschlagene Anmeldeversuche im Adminbereich werden gegen einen gesalzenen Hash der Herkunftsadresse gezählt, damit wiederholtes Raten gestoppt werden kann. Dieser Eintrag wird bei erfolgreicher Anmeldung gelöscht und verfällt von selbst.',
      },
      {
        h: 'Rechtsgrundlage und Ihre Rechte',
        p: 'Grundlage ist das berechtigte Interesse (Art. 6 Abs. 1 lit. f DSGVO) daran, zu erkennen, ob die Seite funktioniert und gelesen wird. Sie können Auskunft verlangen, die Löschung verlangen oder der Verarbeitung widersprechen — eine E-Mail an die im Kontaktbereich genannte Adresse genügt.',
      },
    ],
  },
  sq: {
    back: 'Kthehu te portofoli',
    title: 'Privatësia',
    updated: 'Përditësuar më 6 nëntor 2026',
    intro:
      'Kjo është një faqe personale portofoli. Nuk vendos cookie, nuk ngarkon asgjë nga kompani të tjera dhe nuk shfaq reklama. Më poshtë është e gjithë lista e asaj që regjistrohet.',
    sections: [
      {
        h: 'Çfarë regjistrohet kur vizitoni',
        p: 'Çdo hapje faqeje ruhet si një rresht: faqja, faqja nga erdhët, një vendndodhje e përafërt (shtet, rajon, qytet) e nxjerrë nga adresa IP, lloji i pajisjes, shfletuesi, sistemi operativ, madhësia e ekranit, gjuha e shfletuesit dhe zona kohore, sa gjatë qëndroi e hapur faqja dhe sa larg lexuat.',
      },
      {
        h: 'Adresa juaj IP nuk ruhet',
        p: 'Përdoret në çastin e kërkesës për tri gjëra — për të përcaktuar qytetin e përafërt, për të ndërtuar një identifikues pseudonim dhe për të kontrolluar nëse vjen nga një qendër të dhënash në cloud (atëherë vizita shënohet si bot) — dhe pastaj hidhet. Identifikuesi është një hash SHA-256 i adresës IP, i të dhënave të shfletuesit, i datës dhe i një çelësi sekret. Nuk mund të kthehet mbrapsht dhe ndryshon çdo ditë, sepse data është pjesë e tij. Askush, as pronari i faqes, nuk mund t’i lidhë dy vizita në ditë të ndryshme me të njëjtin person.',
      },
      {
        h: 'Hapja e CV-së',
        p: 'Hapja e CV-së numërohet, me të njëjtat të dhëna të përafërta vendndodhjeje e pajisjeje, si dhe me etiketën ?ref= të linkut nga u hap, nëse kishte.',
      },
      {
        h: 'Linket e ndara',
        p: 'Një link mund të mbajë një etiketë si /?ref=emri-i-kompanise. Regjistrohet se cili link i ndarë u hap — linku, jo ju.',
      },
      {
        h: 'Ruajtja në shfletuesin tuaj',
        p: 'Gjuha dhe tema e zgjedhur ruhen në hapësirën lokale të shfletuesit tuaj që faqja t’i mbajë mend. Nuk largohen kurrë nga pajisja juaj. Nuk vendoset asnjë cookie.',
      },
      {
        h: 'Do Not Track',
        p: 'Nëse shfletuesi juaj dërgon sinjalin Do Not Track, nuk regjistrohet absolutisht asgjë.',
      },
      {
        h: 'Kush tjetër ka qasje',
        p: 'Faqja funksionon në Vercel dhe të dhënat ruhen në Neon, të dy si përpunues. Asgjë nuk shitet, nuk ndahet dhe nuk u dërgohet rrjeteve reklamuese, dhe nuk përfshihet asnjë kompani analitike.',
      },
      {
        h: 'Sa kohë ruhen',
        p: 'Të dhënat e vizitave fshihen automatikisht pas 180 ditësh.',
      },
      {
        h: 'Siguria',
        p: 'Përpjekjet e dështuara për hyrje në panelin e administrimit numërohen kundrejt një hash-i të kripëzuar të adresës nga erdhën, që të ndalet gjetja me hamendje. Ky regjistrim fshihet sapo hyrja është e suksesshme dhe skadon vetvetiu.',
      },
      {
        h: 'Baza ligjore dhe të drejtat tuaja',
        p: 'Baza është interesi legjitim (neni 6(1)(f) i GDPR-së) për të kuptuar nëse faqja funksionon dhe lexohet. Mund të kërkoni çfarë mbahet për ju, të kërkoni fshirjen ose të kundërshtoni plotësisht — mjafton një email në adresën te seksioni i kontaktit.',
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

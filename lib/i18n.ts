// Three languages, English first. The UI strings live here; the content
// (bio, project and experience text) lives in the database with a column per
// language — see the *_de / *_sq fields.

export const LANGS = [
  { code: 'en', label: 'English',  short: 'EN' },
  { code: 'de', label: 'Deutsch',  short: 'DE' },
  { code: 'sq', label: 'Shqip',    short: 'SQ' },
] as const;

export type Lang = (typeof LANGS)[number]['code'];
export const DEFAULT_LANG: Lang = 'en';

export const isLang = (v: unknown): v is Lang =>
  typeof v === 'string' && LANGS.some((l) => l.code === v);

type Dict = Record<string, string>;

const en: Dict = {
  'nav.about': 'About',
  'nav.skills': 'Skills',
  'nav.experience': 'Experience',
  'nav.projects': 'Projects',
  'nav.contact': 'Contact',
  'nav.home': 'Home',
  'nav.admin': 'Admin',

  'hero.badge': 'Open to Werkstudent & internship roles · Aachen',
  'hero.greeting': "Hi, I'm",
  'hero.viewProjects': 'View Projects',
  'hero.viewCv': 'View CV',
  'hero.getInTouch': 'Get in Touch',
  'hero.role1': 'Turning business data into decisions',
  'hero.role2': 'Building BI dashboards from real data',
  'hero.role3': 'SQL · Python · Excel',
  'hero.role4': 'IT infrastructure & security background',

  'about.eyebrow': 'About Me',
  'about.headline': 'Where business meets',
  'about.headlineAccent': 'data and IT systems',
  'about.location': 'Location',
  'about.education': 'Education',
  'about.remote': 'Open to Remote',

  'skills.eyebrow': 'Skills',
  'skills.technical': 'Technical Skills',
  'skills.language': 'Languages',
  'skills.tool': 'Tools & Soft Skills',

  'experience.eyebrow': 'Timeline',
  'experience.headline': 'Experience &',
  'experience.headlineAccent': 'Education',
  'experience.work': 'Experience',
  'experience.education': 'Education',
  'experience.awards': 'Awards',
  'experience.other': 'Other experience',
  'experience.present': 'Present',
  'experience.certificate': 'View Certificate',

  'projects.headline': 'My',
  'projects.headlineAccent': 'Work',
  'projects.eyebrow': 'Projects',
  'projects.empty': 'Projects will appear here once added via the admin panel.',
  'projects.readMore': 'Read more ↓',
  'projects.showLess': 'Show less ↑',
  'projects.featured': 'Featured',
  'projects.view': 'View Project',
  'projects.code': 'Code',
  'projects.liveDemo': 'Live Demo',
  'projects.docs': 'Docs',

  'contact.eyebrow': 'Contact',
  'contact.headline': "Let's",
  'contact.headlineAccent': 'Connect',
  'contact.sub': 'Open to Werkstudent, internship and junior roles in IT, data and software development, in Aachen/NRW or remote.',
  'contact.ready': 'Ready to collaborate?',
  'contact.readyText': "Whether it's an internship, project collaboration, or just a chat about tech — I'd love to hear from you.",
  'contact.sendEmail': 'Send me an email',
  'footer.rights': 'All rights reserved.',
  'footer.privacy': 'Privacy',
  'contact.email': 'Email',
  'contact.phone': 'Phone',
  'contact.location': 'Location',
  'contact.linkedin': 'LinkedIn',
  'contact.connect': 'Connect on LinkedIn',
  'contact.copy': 'Copy email',
  'contact.copied': 'Email copied',

  'orb.hintSkills': 'Drag to spin · click a ringed node for a skill · double-click to shatter',
  'orb.hintPlain': 'Drag to spin · tap it to send a ripple',

  'lang.label': 'Language',
};

const de: Dict = {
  'nav.about': 'Über mich',
  'nav.skills': 'Kenntnisse',
  'nav.experience': 'Erfahrung',
  'nav.projects': 'Projekte',
  'nav.contact': 'Kontakt',
  'nav.home': 'Start',
  'nav.admin': 'Admin',

  'hero.badge': 'Offen für Werkstudenten- & Praktikumsstellen · Aachen',
  'hero.greeting': 'Hallo, ich bin',
  'hero.viewProjects': 'Projekte ansehen',
  'hero.viewCv': 'Lebenslauf',
  'hero.getInTouch': 'Kontakt aufnehmen',
  'hero.role1': 'Aus Unternehmensdaten werden Entscheidungen',
  'hero.role2': 'BI-Dashboards aus echten Daten',
  'hero.role3': 'SQL · Python · Excel',
  'hero.role4': 'Hintergrund in IT-Infrastruktur & Sicherheit',

  'about.eyebrow': 'Über mich',
  'about.headline': 'Wo Wirtschaft auf',
  'about.headlineAccent': 'Daten und IT-Systeme trifft',
  'about.location': 'Standort',
  'about.education': 'Ausbildung',
  'about.remote': 'Offen für Remote',

  'skills.eyebrow': 'Kenntnisse',
  'skills.technical': 'Technische Kenntnisse',
  'skills.language': 'Sprachen',
  'skills.tool': 'Tools & Soft Skills',

  'experience.eyebrow': 'Werdegang',
  'experience.headline': 'Erfahrung &',
  'experience.headlineAccent': 'Ausbildung',
  'experience.work': 'Berufserfahrung',
  'experience.education': 'Ausbildung',
  'experience.awards': 'Auszeichnungen',
  'experience.other': 'Weitere Erfahrung',
  'experience.present': 'heute',
  'experience.certificate': 'Zeugnis ansehen',

  'projects.headline': 'Meine',
  'projects.headlineAccent': 'Arbeit',
  'projects.eyebrow': 'Projekte',
  'projects.empty': 'Projekte erscheinen hier, sobald sie im Admin-Bereich angelegt sind.',
  'projects.readMore': 'Mehr lesen ↓',
  'projects.showLess': 'Weniger anzeigen ↑',
  'projects.featured': 'Hervorgehoben',
  'projects.view': 'Projekt ansehen',
  'projects.code': 'Code',
  'projects.liveDemo': 'Live-Demo',
  'projects.docs': 'Doku',

  'contact.eyebrow': 'Kontakt',
  'contact.headline': 'Lass uns',
  'contact.headlineAccent': 'vernetzen',
  'contact.sub': 'Offen für Werkstudenten-, Praktikums- und Junior-Stellen in IT, Daten und Softwareentwicklung — in Aachen/NRW oder remote.',
  'contact.ready': 'Bereit für eine Zusammenarbeit?',
  'contact.readyText': 'Ob Praktikum, gemeinsames Projekt oder einfach ein Gespräch über Technik — ich freue mich, von Ihnen zu hören.',
  'contact.sendEmail': 'Schreib mir eine E-Mail',
  'footer.rights': 'Alle Rechte vorbehalten.',
  'footer.privacy': 'Datenschutz',
  'contact.email': 'E-Mail',
  'contact.phone': 'Telefon',
  'contact.location': 'Standort',
  'contact.linkedin': 'LinkedIn',
  'contact.connect': 'Auf LinkedIn vernetzen',
  'contact.copy': 'E-Mail kopieren',
  'contact.copied': 'E-Mail kopiert',

  'orb.hintSkills': 'Ziehen zum Drehen · Knoten mit Ring anklicken für eine Kenntnis · Doppelklick zerlegt die Kugel',
  'orb.hintPlain': 'Ziehen zum Drehen · antippen für eine Welle',

  'lang.label': 'Sprache',
};

const sq: Dict = {
  'nav.about': 'Rreth meje',
  'nav.skills': 'Aftësitë',
  'nav.experience': 'Përvoja',
  'nav.projects': 'Projektet',
  'nav.contact': 'Kontakti',
  'nav.home': 'Ballina',
  'nav.admin': 'Admin',

  'hero.badge': 'I hapur për pozita Werkstudent & praktikë · Aachen',
  'hero.greeting': 'Përshëndetje, unë jam',
  'hero.viewProjects': 'Shih projektet',
  'hero.viewCv': 'Shih CV-në',
  'hero.getInTouch': 'Më kontakto',
  'hero.role1': 'Nga të dhënat e biznesit te vendimet',
  'hero.role2': 'Dashboard-e BI nga të dhëna reale',
  'hero.role3': 'SQL · Python · Excel',
  'hero.role4': 'Përvojë në infrastrukturë IT & siguri',

  'about.eyebrow': 'Rreth meje',
  'about.headline': 'Aty ku biznesi takon',
  'about.headlineAccent': 'të dhënat dhe sistemet IT',
  'about.location': 'Vendndodhja',
  'about.education': 'Arsimimi',
  'about.remote': 'I hapur për punë në distancë',

  'skills.eyebrow': 'Aftësitë',
  'skills.technical': 'Aftësi teknike',
  'skills.language': 'Gjuhët',
  'skills.tool': 'Mjete & aftësi personale',

  'experience.eyebrow': 'Rrugëtimi',
  'experience.headline': 'Përvoja &',
  'experience.headlineAccent': 'arsimimi',
  'experience.work': 'Përvoja e punës',
  'experience.education': 'Arsimimi',
  'experience.awards': 'Çmime',
  'experience.other': 'Përvojë tjetër',
  'experience.present': 'tani',
  'experience.certificate': 'Shih certifikatën',

  'projects.headline': 'Puna',
  'projects.headlineAccent': 'ime',
  'projects.eyebrow': 'Projektet',
  'projects.empty': 'Projektet shfaqen këtu pasi të shtohen nga paneli i administrimit.',
  'projects.readMore': 'Lexo më shumë ↓',
  'projects.showLess': 'Trego më pak ↑',
  'projects.featured': 'I veçuar',
  'projects.view': 'Shih projektin',
  'projects.code': 'Kodi',
  'projects.liveDemo': 'Demo live',
  'projects.docs': 'Dokumentet',

  'contact.eyebrow': 'Kontakti',
  'contact.headline': 'Le të',
  'contact.headlineAccent': 'lidhemi',
  'contact.sub': 'I hapur për pozita Werkstudent, praktikë dhe junior në IT, të dhëna dhe zhvillim softueri — në Aachen/NRW ose në distancë.',
  'contact.ready': 'Gati për bashkëpunim?',
  'contact.readyText': 'Qoftë praktikë, bashkëpunim në projekt apo thjesht një bisedë për teknologjinë — do të më vinte mirë të dëgjoja nga ju.',
  'contact.sendEmail': 'Më dërgo një email',
  'footer.rights': 'Të gjitha të drejtat e rezervuara.',
  'footer.privacy': 'Privatësia',
  'contact.email': 'Email',
  'contact.phone': 'Telefoni',
  'contact.location': 'Vendndodhja',
  'contact.linkedin': 'LinkedIn',
  'contact.connect': 'Lidhu në LinkedIn',
  'contact.copy': 'Kopjo email-in',
  'contact.copied': 'Email-i u kopjua',

  'orb.hintSkills': 'Tërhiq për ta rrotulluar · kliko një nyjë me unazë për një aftësi · klik i dyfishtë e shpërbën',
  'orb.hintPlain': 'Tërhiq për ta rrotulluar · prek për një valë',

  'lang.label': 'Gjuha',
};

export const DICT: Record<Lang, Dict> = { en, de, sq };

/** A translated string, falling back to English and then to the key itself. */
export function translate(lang: Lang, key: string) {
  return DICT[lang]?.[key] ?? DICT.en[key] ?? key;
}

/**
 * The right language's version of a database field: `bio` in English,
 * `bio_de` in German, and back to `bio` whenever a translation is missing, so
 * a half-filled translation never shows an empty section.
 */
export function localized(
  row: object | null | undefined,
  field: string,
  lang: Lang
): string {
  if (!row) return '';
  const r = row as Record<string, unknown>;
  const base = (r[field] ?? '') as string;
  if (lang === DEFAULT_LANG) return base;
  const translated = r[`${field}_${lang}`];
  return typeof translated === 'string' && translated.trim() ? translated : base;
}

import type { Lang } from '@/lib/i18n';

type Text = Record<Lang, string>;
type List = Record<Lang, string[]>;

export interface Screenshot {
  src: string;
  /** Pixel size of the stored image, so the page reserves the right space before it loads. */
  w: number;
  h: number;
  caption: Text;
}

export interface StudyLink {
  kind: 'live' | 'code' | 'report';
  href: string;
}

/**
 * One case-study page. Every section is optional: a section without text is not
 * shown at all, so nothing half-written reaches the live site.
 */
export interface CaseStudy {
  /** The page's address, without the slash. */
  slug: string;
  title: string;
  icon: 'chart' | 'calendar' | 'database' | 'server';
  /** Title and description for search results and link previews (English only). */
  meta: { title: string; description: string };
  /** False keeps the page out of the sitemap and out of search engines. */
  indexable: boolean;
  subtitle?: Text;
  /** ParaFluent is a real client's site, so its link says "Live site". */
  liveLabel?: 'demo' | 'site';
  problem?: Text;
  data?: Text;
  tools?: string[];
  role?: Text;
  approach?: List;
  results?: List;
  screenshots?: Screenshot[];
  differently?: Text;
  links?: StudyLink[];
}

// Screenshots and the sample report are the files already uploaded in /admin.
const BLOB = 'https://zidb6ezdsz9bazru.public.blob.vercel-storage.com';

const FETECH: CaseStudy = {
  slug: 'fetech-analytics',
  title: 'FETech Analytics',
  icon: 'chart',
  indexable: true,
  meta: {
    title: 'FETech Analytics – Case study',
    description: 'Case study: FETech Analytics, a retail BI dashboard that turns a CSV of orders into KPIs, charts, customer segments, a 12-month forecast and automatic insights.',
  },
  subtitle: {
    en: 'Personal project · Solo build · 2026',
    de: 'Eigenes Projekt · allein umgesetzt · 2026',
    sq: 'Projekt personal · i realizuar vetëm · 2026',
  },
  problem: {
    en: 'Sales data often sits in spreadsheets and system exports, so comparing years, seeing customer segments or looking ahead takes manual work. FETech Analytics is a showcase of what a BI platform does: upload a CSV of orders, and the dashboards, segments, forecast and insights build themselves.',
    de: 'Verkaufsdaten liegen oft in Tabellen und Systemexporten. Jahresvergleiche, Kundensegmente oder ein Blick nach vorn kosten dann Handarbeit. FETech Analytics zeigt, was eine BI-Plattform leistet: Man lädt eine CSV-Datei mit Bestellungen hoch, und Dashboards, Segmente, Prognose und Hinweise entstehen von selbst.',
    sq: 'Të dhënat e shitjeve shpesh qëndrojnë në tabela dhe eksporte sistemesh, ndaj krahasimi i viteve, segmentet e klientëve apo një vështrim përpara kërkojnë punë manuale. FETech Analytics tregon çfarë bën një platformë BI: ngarkon një skedar CSV me porosi, dhe dashboard-et, segmentet, parashikimi dhe njohuritë krijohen vetë.',
  },
  data: {
    en: 'A built-in synthetic retail dataset, or your own CSV. The import expects 10 columns: date, order_id, customer_id, customer_name, product, category, amount, channel, region and status. All numbers on the screenshot come from the demo data.',
    de: 'Ein eingebauter synthetischer Handelsdatensatz oder eine eigene CSV-Datei. Der Import erwartet 10 Spalten: date, order_id, customer_id, customer_name, product, category, amount, channel, region und status. Alle Zahlen auf dem Screenshot stammen aus den Demodaten.',
    sq: 'Një grup i integruar të dhënash sintetike shitjesh me pakicë, ose skedari juaj CSV. Importi pret 10 kolona: date, order_id, customer_id, customer_name, product, category, amount, channel, region dhe status. Të gjithë numrat në pamjen nga ekrani vijnë nga të dhënat demo.',
  },
  tools: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Recharts 3', 'PapaParse', 'Clerk', 'Neon Postgres'],
  role: {
    en: 'Personal project, built alone: concept, design, development and deployment.',
    de: 'Eigenes Projekt, allein umgesetzt: Idee, Design, Entwicklung und Deployment.',
    sq: 'Projekt personal, i realizuar vetëm: ideja, dizajni, zhvillimi dhe publikimi.',
  },
  approach: {
    en: [
      'CSV import: the file is read in the browser, and columns are detected automatically, with a manual mapper as a fallback. The orders are then grouped into monthly revenue, categories, regions, channels, products, customers and cohorts.',
      'Forecast: single exponential smoothing (α = 0.3) with a seasonal index per month projects the next 12 months, with a confidence band. Its fit (MAPE, RMSE, R²) is calculated on whatever data is loaded.',
      'Customer segments: RFM scoring (recency, frequency, monetary value) sorts customers into five segments: Premium, Loyal, Regular, Occasional and At-Risk.',
      'Insight engine: 25 rules turn the numbers into short plain-language cards, for example on the revenue trend, dependence on the fourth quarter or high return rates.',
      'Health score: one 0–100 score from five weighted parts: revenue growth (30%), gross margin (25%), customer retention (20%), customer risk (15%) and return rate (10%).',
      'Storage: data stays in the browser by default. After signing in (Clerk), it is saved to a Postgres database (Neon). With neither, the demo data loads.',
      'Chat helper: answers questions about the loaded data on 18 topics, by keyword matching in the browser, with no outside service.',
      'Everyday use: date-range filter, page search with Ctrl/Cmd+K, PDF export through the print view, dark mode and a mobile layout.',
    ],
    de: [
      'CSV-Import: Die Datei wird im Browser eingelesen, die Spalten werden automatisch erkannt (mit manueller Zuordnung als Rückfallebene), und die Bestellungen werden zu Monatsumsätzen, Kategorien, Regionen, Kanälen, Produkten, Kunden und Kohorten zusammengefasst.',
      'Prognose: Einfache exponentielle Glättung (α = 0,3) mit einem saisonalen Index je Monat schreibt die nächsten 12 Monate fort, mit Konfidenzband. Die Güte (MAPE, RMSE, R²) wird auf den jeweils geladenen Daten berechnet.',
      'Kundensegmente: Eine RFM-Bewertung (Recency, Frequency, Monetary Value) teilt die Kunden in fünf Segmente ein: Premium, Loyal, Regular, Occasional und At-Risk.',
      'Insight-Engine: 25 Regeln machen aus den Zahlen kurze Hinweise in Klartext, etwa zum Umsatztrend, zur Abhängigkeit vom vierten Quartal oder zu hohen Retourenquoten.',
      'Health Score: ein Wert von 0–100 aus fünf gewichteten Teilen: Umsatzwachstum (30 %), Bruttomarge (25 %), Kundenbindung (20 %), Kundenrisiko (15 %) und Retourenquote (10 %).',
      'Speicherung: Die Daten bleiben standardmäßig im Browser; nach der Anmeldung (Clerk) werden sie in einer Postgres-Datenbank (Neon) gespeichert; ohne beides werden die Demodaten geladen.',
      'Chat-Hilfe: beantwortet Fragen zu den geladenen Daten in 18 Themen, per Stichwortabgleich im Browser, ohne externen Dienst.',
      'Im Alltag: Datumsfilter, Seitensuche mit Strg/Cmd+K, PDF-Export über die Druckansicht, Dark Mode und mobiles Layout.',
    ],
    sq: [
      'Importi CSV: skedari lexohet në shfletues, kolonat njihen automatikisht (me caktim manual si rrugëdalje), dhe porositë përmblidhen në të ardhura mujore, kategori, rajone, kanale, produkte, klientë dhe kohorta.',
      'Parashikimi: zbutja e thjeshtë eksponenciale (α = 0,3) me një indeks sezonal për çdo muaj parashikon 12 muajt e ardhshëm, me brez besueshmërie. Saktësia (MAPE, RMSE, R²) llogaritet mbi të dhënat e ngarkuara.',
      'Segmentet e klientëve: vlerësimi RFM (recency, frequency, monetary value) i ndan klientët në pesë segmente: Premium, Loyal, Regular, Occasional dhe At-Risk.',
      'Motori i njohurive: 25 rregulla i kthejnë numrat në karta të shkurtra në gjuhë të thjeshtë, p.sh. për trendin e të ardhurave, varësinë nga tremujori i katërt ose kthimet e larta.',
      'Vlerësimi i shëndetit: një notë 0–100 nga pesë pjesë me pesha: rritja e të ardhurave (30%), marzhi bruto (25%), mbajtja e klientëve (20%), rreziku i klientëve (15%) dhe shkalla e kthimeve (10%).',
      'Ruajtja: të dhënat qëndrojnë në shfletues si parazgjedhje; pas hyrjes (Clerk) ruhen në një databazë Postgres (Neon); pa asnjërën, ngarkohen të dhënat demo.',
      'Ndihmësi i chat-it: u përgjigjet pyetjeve për të dhënat e ngarkuara në 18 tema, me përputhje fjalësh kyçe në shfletues, pa shërbim të jashtëm.',
      'Për përdorim të përditshëm: filtër datash, kërkim faqesh me Ctrl/Cmd+K, eksport PDF përmes pamjes së printimit, modalitet i errët dhe pamje për celular.',
    ],
  },
  results: {
    en: [
      '8 pages: Overview, Sales, Products, Customers, Forecasting, Insights, Import and About',
      '25 insight rules and a 0–100 health score',
      '12-month forecast with a confidence band',
      '18 chat topics',
      'Works on demo data or your own CSV, with no account needed',
    ],
    de: [
      '8 Seiten: Overview, Sales, Products, Customers, Forecasting, Insights, Import und About',
      '25 Insight-Regeln und ein Health Score von 0–100',
      '12-Monats-Prognose mit Konfidenzband',
      '18 Chat-Themen',
      'Funktioniert mit Demodaten oder eigener CSV-Datei, ohne Konto',
    ],
    sq: [
      '8 faqe: Overview, Sales, Products, Customers, Forecasting, Insights, Import dhe About',
      '25 rregulla njohurish dhe një vlerësim shëndeti 0–100',
      'Parashikim 12-mujor me brez besueshmërie',
      '18 tema chat-i',
      'Punon me të dhëna demo ose me CSV-në tuaj, pa llogari',
    ],
  },
  screenshots: [
    {
      src: `${BLOB}/projects/1778517407526-78gghsl00a.png`,
      w: 1080, h: 519,
      caption: {
        en: 'Overview page: four KPI cards, automatic insight cards and the 0–100 health score (demo data).',
        de: 'Overview-Seite: vier KPI-Karten, automatische Hinweise und der Health Score von 0–100 (Demodaten).',
        sq: 'Faqja Overview: katër karta KPI, njohuri automatike dhe vlerësimi i shëndetit 0–100 (të dhëna demo).',
      },
    },
  ],
  links: [
    { kind: 'live', href: 'https://fetech-analytics.vercel.app/' },
    { kind: 'code', href: 'https://github.com/FabjanElezi/fetech-analytics' },
    { kind: 'report', href: `${BLOB}/documents/1778518958236-y8skb4dc46.pdf` },
  ],
};

const PARAFLUENT: CaseStudy = {
  slug: 'parafluent',
  title: 'ParaFluent',
  icon: 'calendar',
  indexable: true,
  liveLabel: 'site',
  meta: {
    title: 'ParaFluent – Case study',
    description: 'Case study: a bilingual website with trial-lesson booking, a level test, live time slots and an admin panel the client runs herself.',
  },
  subtitle: {
    en: 'Client project · Website & booking system · November 2026',
    de: 'Kundenprojekt · Website & Buchungssystem · November 2026',
    sq: 'Projekt për klient · Faqe & sistem rezervimesh · nëntor 2026',
  },
  problem: {
    en: 'An online English teacher needed a bilingual website where new students can book a free trial lesson, and that she can keep up to date herself.',
    de: 'Eine Online-Englischlehrerin brauchte eine zweisprachige Website, auf der neue Schülerinnen und Schüler eine kostenlose Probestunde buchen können und die sie selbst aktuell halten kann.',
    sq: 'Një mësuese anglishteje online kishte nevojë për një faqe dygjuhëshe ku nxënësit e rinj të rezervojnë një orë provë falas, dhe që ajo ta mbajë vetë të përditësuar.',
  },
  tools: ['Next.js 16 (App Router)', 'TypeScript', 'Tailwind CSS 4', 'Neon Postgres', 'Vercel Blob', 'Resend', 'Vercel', 'Custom domain'],
  role: {
    en: 'Design implementation, development of the website and booking system, deployment, and domain and email set-up.',
    de: 'Umsetzung des Designs, Entwicklung von Website und Buchungssystem, Deployment sowie Einrichtung von Domain und E-Mail.',
    sq: 'Zbatimi i dizajnit, zhvillimi i faqes dhe i sistemit të rezervimeve, publikimi, si dhe konfigurimi i domain-it dhe i email-it.',
  },
  approach: {
    en: [
      'One-page site in Ukrainian and English, with SEO basics: hreflang, sitemap, Open Graph and structured data.',
      'Trial-lesson booking in steps, with an optional A1–B2 level test scored on the server and live time slots in Kyiv time.',
      'An atomic database update rules out double bookings.',
      'Automatic emails from the client’s own domain, including a calendar invite.',
      'Spam protection (honeypot, timing check, rate limiting) and server-side validation.',
      'An admin panel for texts, photos, slots, bookings, prices, moderated reviews, PDF materials and which sections are shown.',
      'Uploads go straight to storage, and changes go live without a redeploy.',
      'Keyboard-accessible tabs, carousel and lightbox.',
    ],
    de: [
      'Einseitige Website auf Ukrainisch und Englisch mit SEO-Grundlagen: hreflang, Sitemap, Open Graph und strukturierte Daten.',
      'Buchung der Probestunde in Schritten, mit optionalem A1–B2-Einstufungstest, der auf dem Server ausgewertet wird, und Live-Terminen in Kyjiwer Zeit.',
      'Eine atomare Datenbankoperation schließt Doppelbuchungen aus.',
      'Automatische E-Mails von der eigenen Domain der Kundin, inklusive Kalendereinladung.',
      'Spam-Schutz (Honeypot, Zeitprüfung, Rate Limiting) und serverseitige Validierung.',
      'Admin-Bereich für Texte, Fotos, Termine, Buchungen, Preise, moderierte Bewertungen, PDF-Materialien und die Sichtbarkeit einzelner Bereiche.',
      'Uploads gehen direkt in den Speicher, Änderungen sind ohne neues Deployment live.',
      'Tastaturbedienbare Tabs, Karussell und Lightbox.',
    ],
    sq: [
      'Faqe njëfaqëshe në ukrainisht dhe anglisht, me bazat e SEO-së: hreflang, sitemap, Open Graph dhe të dhëna të strukturuara.',
      'Rezervimi i orës provë hap pas hapi, me test opsional niveli A1–B2 të vlerësuar në server dhe orare live sipas orës së Kievit.',
      'Një përditësim atomik në databazë shmang rezervimet e dyfishta.',
      'Email-e automatike nga domain-i i klientes, me ftesë kalendari.',
      'Mbrojtje nga spam-i (honeypot, kontroll kohe, kufizim kërkesash) dhe validim në server.',
      'Panel administrimi për tekste, foto, orare, rezervime, çmime, vlerësime të moderuara, materiale PDF dhe dukshmërinë e seksioneve.',
      'Ngarkimet shkojnë direkt në storage dhe ndryshimet dalin live pa ri-publikim.',
      'Tab-e, karusel dhe lightbox të përdorshme me tastierë.',
    ],
  },
  results: {
    en: [
      'Live on the client’s own domain, parafluent.me, since November 2026.',
      'She updates texts, photos, slots and prices herself in the admin panel.',
    ],
    de: [
      'Live auf der eigenen Domain der Kundin, parafluent.me, seit November 2026.',
      'Texte, Fotos, Termine und Preise pflegt sie selbst im Admin-Bereich.',
    ],
    sq: [
      'Live në domain-in e klientes, parafluent.me, që nga nëntori 2026.',
      'Tekstet, fotot, oraret dhe çmimet i përditëson vetë në panelin e administrimit.',
    ],
  },
  screenshots: [
    {
      src: `${BLOB}/projects/1794168375789-lvxffagpzhs.jpg`, w: 1080, h: 457,
      caption: {
        en: 'Start page on a desktop (English version).',
        de: 'Startseite auf dem Desktop (englische Version).',
        sq: 'Faqja kryesore në desktop (versioni anglisht).',
      },
    },
    {
      src: `${BLOB}/projects/1794168376434-g3gvsmcoja5.jpg`, w: 1080, h: 443,
      caption: {
        en: 'Booking a trial lesson, step 1 of 4: name, email and Telegram or phone.',
        de: 'Buchung einer Probestunde, Schritt 1 von 4: Name, E-Mail und Telegram oder Telefon.',
        sq: 'Rezervimi i orës provë, hapi 1 nga 4: emri, email-i dhe Telegram ose telefoni.',
      },
    },
    {
      src: `${BLOB}/projects/1794168377065-ijqr7p1qmwp.jpg`, w: 1080, h: 525,
      caption: {
        en: '“What my lessons look like”: lesson boards you can swipe through.',
        de: '„So sehen meine Stunden aus“: Lernboards zum Durchwischen.',
        sq: '„Si duken orët e mia“: tabela mësimi që shfletohen anash.',
      },
    },
    {
      src: `${BLOB}/projects/1794168377675-g1gdva1yh8e.jpg`, w: 780, h: 1688,
      caption: {
        en: 'Start page on a phone.',
        de: 'Startseite auf dem Smartphone.',
        sq: 'Faqja kryesore në celular.',
      },
    },
    {
      src: `${BLOB}/projects/1794168378201-02xl6d177n9q.jpg`, w: 780, h: 1688,
      caption: {
        en: 'Booking step 1 on a phone.',
        de: 'Buchungsschritt 1 auf dem Smartphone.',
        sq: 'Hapi 1 i rezervimit në celular.',
      },
    },
    {
      src: `${BLOB}/projects/1794168378830-1hl4eb5g709.jpg`, w: 780, h: 1240,
      caption: {
        en: 'Lesson boards on a phone.',
        de: 'Lernboards auf dem Smartphone.',
        sq: 'Tabelat e mësimit në celular.',
      },
    },
  ],
  links: [{ kind: 'live', href: 'https://parafluent.me' }],
};

const VIDEO_GAME_LIBRARY: CaseStudy = {
  slug: 'videogame-library',
  title: 'Video Game Library',
  icon: 'database',
  indexable: true,
  meta: {
    title: 'Video Game Library – Case study',
    description: 'Case study: a normalized MySQL database for a video game library, with 9 tables, 6 relationships and 8 foreign keys.',
  },
  subtitle: {
    en: 'Course project · Database design · 2026 · Team of 3 students',
    de: 'Studienprojekt · Datenbankentwurf · 2026 · Team aus 3 Studierenden',
    sq: 'Projekt studimi · Dizajn i bazës së të dhënave · 2026 · Ekip me 3 studentë',
  },
  problem: {
    en: 'A video game library needs one place to manage its games, users and borrowing.',
    de: 'Eine Videospielbibliothek braucht einen Ort, an dem sie ihre Spiele, Nutzer und Ausleihen verwaltet.',
    sq: 'Një bibliotekë lojërash video ka nevojë për një vend ku të menaxhojë lojërat, përdoruesit dhe huazimet e saj.',
  },
  data: {
    en: 'Schema only: the repository holds the MySQL CREATE TABLE statements, with no sample data.',
    de: 'Nur das Schema: Das Repository enthält die MySQL-Anweisungen CREATE TABLE, ohne Beispieldaten.',
    sq: 'Vetëm skema: repository përmban urdhrat MySQL CREATE TABLE, pa të dhëna shembull.',
  },
  tools: ['MySQL', 'SQL', 'Database Design', 'Normalization', 'ERD', 'Relational Modeling'],
  // "My role" stays empty until Fabjan describes his part.
  approach: {
    en: [
      'Seven entities: developer, publisher, game, genre, platform, user and borrowing.',
      'Each game refers to its developer and its publisher (one-to-many).',
      'Genres and platforms are many-to-many with games, resolved by the junction tables game_genre and game_platform, each keyed by both IDs.',
      'Each borrowing links one user to one game, with a borrow date and a return date that stays empty until the game comes back.',
      'Foreign keys keep the data consistent: a borrowing can’t point to a user or game that doesn’t exist.',
    ],
    de: [
      'Sieben Entitäten: developer, publisher, game, genre, platform, user und borrowing.',
      'Jedes Spiel verweist auf seinen Entwickler und seinen Publisher (1:n).',
      'Genres und Plattformen stehen in einer n:m-Beziehung zu Spielen, aufgelöst über die Verknüpfungstabellen game_genre und game_platform, jeweils mit beiden IDs als Schlüssel.',
      'Jede Ausleihe verbindet einen Nutzer mit einem Spiel, mit Ausleihdatum und einem Rückgabedatum, das leer bleibt, bis das Spiel zurück ist.',
      'Fremdschlüssel halten die Daten konsistent: Eine Ausleihe kann nicht auf einen Nutzer oder ein Spiel verweisen, das es nicht gibt.',
    ],
    sq: [
      'Shtatë entitete: developer, publisher, game, genre, platform, user dhe borrowing.',
      'Çdo lojë i referohet zhvilluesit dhe botuesit të saj (një-me-shumë).',
      'Zhanret dhe platformat kanë marrëdhënie shumë-me-shumë me lojërat, të zgjidhura me tabelat lidhëse game_genre dhe game_platform, secila me të dy ID-të si çelës.',
      'Çdo huazim lidh një përdorues me një lojë, me datën e huazimit dhe një datë kthimi që mbetet bosh derisa loja të kthehet.',
      'Çelësat e huaj i mbajnë të dhënat të qëndrueshme: një huazim nuk mund t’i referohet një përdoruesi ose një loje që nuk ekziston.',
    ],
  },
  results: {
    en: ['9 tables (7 entities and 2 junction tables), 6 relationships and 8 foreign keys.'],
    de: ['9 Tabellen (7 Entitäten und 2 Verknüpfungstabellen), 6 Beziehungen und 8 Fremdschlüssel.'],
    sq: ['9 tabela (7 entitete dhe 2 tabela lidhëse), 6 marrëdhënie dhe 8 çelësa të huaj.'],
  },
  screenshots: [
    {
      src: `${BLOB}/projects/1777820761749-l1alg1htyka.png`, w: 1080, h: 603,
      caption: {
        en: 'Overview slide from our project presentation.',
        de: 'Übersichtsfolie aus unserer Projektpräsentation.',
        sq: 'Sllajdi përmbledhës nga prezantimi i projektit tonë.',
      },
    },
    {
      src: `${BLOB}/projects/1778454453044-3wfhmi92o54.png`, w: 1080, h: 561,
      caption: {
        en: 'ER diagram of the nine tables with their keys and relations.',
        de: 'ER-Diagramm der neun Tabellen mit Schlüsseln und Beziehungen.',
        sq: 'Diagrami ER i nëntë tabelave me çelësat dhe marrëdhëniet.',
      },
    },
  ],
  // The project's PDF is an internal speaker script, so it is not linked.
  links: [{ kind: 'code', href: 'https://github.com/FabjanElezi/videogame-library-db' }],
};

// Empty until Fabjan writes it: the page answers "not found" while every section is empty.
const IT_SYSTEMS_LAB: CaseStudy = {
  slug: 'it-systems-lab',
  title: 'IT systems lab',
  icon: 'server',
  indexable: false,
  meta: { title: 'IT systems lab', description: '' },
};

export const CASE_STUDIES: CaseStudy[] = [FETECH, PARAFLUENT, VIDEO_GAME_LIBRARY, IT_SYSTEMS_LAB];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((s) => s.slug === slug);
}

/** True once at least one section has content. */
export function hasContent(s: CaseStudy): boolean {
  return Boolean(
    s.problem?.en || s.data?.en || s.role?.en || s.differently?.en ||
    s.tools?.length || s.approach?.en.length || s.results?.en.length ||
    s.screenshots?.length || s.links?.length,
  );
}

import { query } from './db';
import { Portfolio, Project, Experience, Skill, Service, ServiceIcon } from '@/types';

type Row = Record<string, unknown>;

// One column per language for everything a visitor reads. Added lazily, the
// same way the visits table is, so there is no migration step to remember.
let translationsReady = false;
const TRANSLATED: [string, string[]][] = [
  ['portfolio', ['title_de', 'title_sq', 'bio_de', 'bio_sq', 'hero_tagline_de', 'hero_tagline_sq']],
  ['projects', ['description_de', 'description_sq']],
  ['experience', ['role_de', 'role_sq', 'description_de', 'description_sq']],
];

export async function ensureTranslationColumns() {
  if (translationsReady) return;
  try {
    for (const [table, columns] of TRANSLATED) {
      for (const c of columns) {
        await query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${c} TEXT`);
      }
    }
  } catch { /* never block a page render */ }
  translationsReady = true;
}

let skillCategoriesReady = false;

/**
 * The skills.category column was created when there were three groups
 * (technical / language / tool) and the database still refuses anything else:
 * writing 'data' comes back a 500 while 'technical' succeeds. The site now has
 * four groups, so widen the column once, lazily, the same way the translation
 * columns are added.
 *
 * Converting to plain text covers both shapes this can take -- a CHECK
 * constraint or a named enum -- and dropping any category CHECK afterwards
 * covers the case where the column was already text. Values are preserved
 * either way, and a failure here must never block a page render.
 */
export async function ensureSkillCategories() {
  if (skillCategoriesReady) return;
  try {
    await query('ALTER TABLE skills ALTER COLUMN category TYPE TEXT USING category::text');
  } catch { /* already text, or not permitted — the DROP below may still help */ }
  try {
    await query(`
      DO $$
      DECLARE c text;
      BEGIN
        FOR c IN
          SELECT conname FROM pg_constraint
           WHERE conrelid = 'skills'::regclass
             AND contype = 'c'
             AND pg_get_constraintdef(oid) ILIKE '%category%'
        LOOP
          EXECUTE format('ALTER TABLE skills DROP CONSTRAINT %I', c);
        END LOOP;
      END $$;
    `);
  } catch { /* never block a page render */ }
  skillCategoriesReady = true;
}

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined);

export async function getPortfolio(): Promise<Portfolio | null> {
  await ensureTranslationColumns();
  const { rows } = await query('SELECT * FROM portfolio WHERE id = $1', ['main']);
  if (!rows[0]) return null;
  const d = rows[0] as Row;
  return {
    name: (d.name ?? '') as string,
    title: (d.title ?? '') as string,
    bio: (d.bio ?? '') as string,
    email: (d.email ?? '') as string,
    phone: (d.phone ?? '') as string,
    linkedin: (d.linkedin ?? '') as string,
    github: d.github as string | undefined,
    location: d.location as string | undefined,
    profileImage: d.profile_image as string | undefined,
    cvUrl: d.cv_url as string | undefined,
    heroTagline: d.hero_tagline as string | undefined,
    availableForWork: d.available_for_work as boolean | undefined,
    university: d.university as string | undefined,
    openToRemote: d.open_to_remote as boolean | undefined,
    title_de: str(d.title_de),
    title_sq: str(d.title_sq),
    bio_de: str(d.bio_de),
    bio_sq: str(d.bio_sq),
    heroTagline_de: str(d.hero_tagline_de),
    heroTagline_sq: str(d.hero_tagline_sq),
  };
}

export async function getProjects(): Promise<Project[]> {
  await ensureTranslationColumns();
  const { rows } = await query('SELECT * FROM projects ORDER BY "order" ASC');
  return rows.map((d: Row) => ({
    id: d.id as string,
    title: d.title as string,
    description: (d.description ?? '') as string,
    techStack: (d.tech_stack ?? []) as string[],
    images: (d.images ?? []) as string[],
    githubLink: d.github_link as string | undefined,
    liveDemoLink: d.live_demo_link as string | undefined,
    documentUrl: d.document_url as string | undefined,
    dbDesignImages: (d.db_design_images ?? []) as string[],
    featured: (d.featured ?? false) as boolean,
    order: (d.order ?? 0) as number,
    createdAt: (d.created_at ?? '') as string,
    description_de: str(d.description_de),
    description_sq: str(d.description_sq),
  }));
}

export async function getExperiences(): Promise<Experience[]> {
  await ensureTranslationColumns();
  const { rows } = await query('SELECT * FROM experience ORDER BY "order" ASC');
  return rows.map((d: Row) => ({
    id: d.id as string,
    company: d.company as string,
    role: d.role as string,
    startDate: (d.start_date ?? '') as string,
    endDate: d.end_date as string | undefined,
    current: (d.current ?? false) as boolean,
    description: (d.description ?? '') as string,
    order: (d.order ?? 0) as number,
    type: d.type as 'work' | 'education' | 'award' | 'other',
    certificateUrl: d.certificate_url as string | undefined,
    role_de: str(d.role_de),
    role_sq: str(d.role_sq),
    description_de: str(d.description_de),
    description_sq: str(d.description_sq),
  }));
}

export async function getSkills(): Promise<Skill[]> {
  await ensureSkillCategories();
  const { rows } = await query('SELECT * FROM skills ORDER BY "order" ASC');
  return rows.map((d: Row) => ({
    id: d.id as string,
    name: d.name as string,
    category: d.category as Skill['category'],
    level: d.level as string | undefined,
    order: (d.order ?? 0) as number,
  }));
}

// ── Services ──────────────────────────────────────────────────────────────

let servicesReady = false;

// The four offers the site launched with. Each is backed by real work on the
// site: this portfolio, FETech Analytics, the SHET internship plus the Cisco
// course, and the video game library database.
const SERVICE_SEED: Omit<Service, 'id'>[] = [
  {
    order: 0, icon: 'web',
    title: 'Website building',
    title_de: 'Websites erstellen',
    title_sq: 'Ndërtim faqesh web',
    description: 'Portfolio sites, landing pages and small business websites — fast, mobile-first and built with Next.js and React. This site is an example.',
    description_de: 'Portfolio-Websites, Landingpages und Websites für kleine Unternehmen — schnell, mobil optimiert und mit Next.js und React gebaut. Diese Seite ist ein Beispiel.',
    description_sq: 'Faqe portofoli, landing pages dhe faqe për biznese të vogla — të shpejta, të optimizuara për celular dhe të ndërtuara me Next.js dhe React. Kjo faqe është një shembull.',
  },
  {
    order: 1, icon: 'data',
    title: 'Data & BI dashboards',
    title_de: 'Daten- & BI-Dashboards',
    title_sq: 'Dashboard-e të dhënash & BI',
    description: 'Dashboards and reports that turn raw data into decisions — Power BI, SQL and custom web dashboards like FETech Analytics.',
    description_de: 'Dashboards und Berichte, die aus Rohdaten Entscheidungen machen — Power BI, SQL und individuelle Web-Dashboards wie FETech Analytics.',
    description_sq: 'Dashboard-e dhe raporte që i kthejnë të dhënat e papërpunuara në vendime — Power BI, SQL dhe dashboard-e web si FETech Analytics.',
  },
  {
    order: 2, icon: 'network',
    title: 'IT setup & networking',
    title_de: 'IT-Einrichtung & Netzwerke',
    title_sq: 'Konfigurim IT & rrjeta',
    description: 'Network and remote-access setup for small offices and teams: VPN, user access and backups. Backed by a Cisco CCNA course and hands-on infrastructure work.',
    description_de: 'Netzwerk- und Fernzugriffs-Einrichtung für kleine Büros und Teams: VPN, Benutzerzugriff und Backups. Gestützt auf einen Cisco-CCNA-Kurs und praktische Infrastrukturarbeit.',
    description_sq: 'Konfigurim rrjeti dhe qasjeje në distancë për zyra e ekipe të vogla: VPN, qasje përdoruesish dhe backup. I mbështetur nga kursi Cisco CCNA dhe punë praktike në infrastrukturë.',
  },
  {
    order: 3, icon: 'database',
    title: 'Database design',
    title_de: 'Datenbankdesign',
    title_sq: 'Dizajn bazash të dhënash',
    description: 'Relational database design — schemas, normalisation and ER diagrams, so your data stays consistent as it grows.',
    description_de: 'Relationales Datenbankdesign — Schemata, Normalisierung und ER-Diagramme, damit Ihre Daten auch beim Wachsen konsistent bleiben.',
    description_sq: 'Dizajn bazash të dhënash relacionale — skema, normalizim dhe diagrame ER, që të dhënat të mbeten të qëndrueshme ndërsa rriten.',
  },
];

/**
 * Created lazily like every other table here. The seed runs only on the
 * request that actually creates the table: if Fabjo later deletes every
 * service in Admin, they must stay deleted rather than reappear on the next
 * page load, which a plain "seed when empty" would do.
 */
export async function ensureServicesTable() {
  if (servicesReady) return;
  try {
    const { rows } = await query(`SELECT to_regclass('public.services') IS NULL AS missing`);
    const missing = Boolean((rows[0] as Row | undefined)?.missing);
    await query(`
      CREATE TABLE IF NOT EXISTS services (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title          TEXT NOT NULL,
        description    TEXT NOT NULL DEFAULT '',
        icon           TEXT NOT NULL DEFAULT 'web',
        "order"        INT  NOT NULL DEFAULT 0,
        title_de       TEXT,
        title_sq       TEXT,
        description_de TEXT,
        description_sq TEXT
      )`);
    if (missing) {
      for (const s of SERVICE_SEED) {
        await query(
          `INSERT INTO services (title,description,icon,"order",title_de,title_sq,description_de,description_sq)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [s.title, s.description, s.icon, s.order,
           s.title_de ?? null, s.title_sq ?? null, s.description_de ?? null, s.description_sq ?? null]
        );
      }
    }
    servicesReady = true;
  } catch { /* never block a page render; try again on the next request */ }
}

const ICONS: ServiceIcon[] = ['web', 'data', 'network', 'database'];

export function rowToService(d: Row): Service {
  const icon = ICONS.includes(d.icon as ServiceIcon) ? (d.icon as ServiceIcon) : 'web';
  return {
    id: d.id as string,
    title: (d.title ?? '') as string,
    description: (d.description ?? '') as string,
    icon,
    order: (d.order ?? 0) as number,
    title_de: str(d.title_de),
    title_sq: str(d.title_sq),
    description_de: str(d.description_de),
    description_sq: str(d.description_sq),
  };
}

export async function getServices(): Promise<Service[]> {
  await ensureServicesTable();
  try {
    const { rows } = await query('SELECT * FROM services ORDER BY "order" ASC');
    return (rows as Row[]).map(rowToService);
  } catch {
    return [];
  }
}

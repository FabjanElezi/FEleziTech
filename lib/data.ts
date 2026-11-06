import { query } from './db';
import { Portfolio, Project, Experience, Skill } from '@/types';

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
  const { rows } = await query('SELECT * FROM skills ORDER BY "order" ASC');
  return rows.map((d: Row) => ({
    id: d.id as string,
    name: d.name as string,
    category: d.category as 'technical' | 'language' | 'tool',
    level: d.level as string | undefined,
    order: (d.order ?? 0) as number,
  }));
}

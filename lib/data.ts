import { query } from './db';
import { Portfolio, Project, Experience, Skill } from '@/types';

type Row = Record<string, unknown>;

export async function getPortfolio(): Promise<Portfolio | null> {
  try {
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
    };
  } catch { return null; }
}

export async function getProjects(): Promise<Project[]> {
  try {
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
    }));
  } catch { return []; }
}

export async function getExperiences(): Promise<Experience[]> {
  try {
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
      type: d.type as 'work' | 'education',
      certificateUrl: d.certificate_url as string | undefined,
    }));
  } catch { return []; }
}

export async function getSkills(): Promise<Skill[]> {
  try {
    const { rows } = await query('SELECT * FROM skills ORDER BY "order" ASC');
    return rows.map((d: Row) => ({
      id: d.id as string,
      name: d.name as string,
      category: d.category as 'technical' | 'language' | 'tool',
      level: d.level as string | undefined,
      order: (d.order ?? 0) as number,
    }));
  } catch { return []; }
}

import pool from './db';
import { Portfolio, Project, Experience, Skill } from '@/types';

export async function getPortfolio(): Promise<Portfolio | null> {
  try {
    const { rows } = await pool.query('SELECT * FROM portfolio WHERE id = $1', ['main']);
    if (!rows[0]) return null;
    const d = rows[0];
    return {
      name: d.name ?? '',
      title: d.title ?? '',
      bio: d.bio ?? '',
      email: d.email ?? '',
      phone: d.phone ?? '',
      linkedin: d.linkedin ?? '',
      github: d.github,
      location: d.location,
      profileImage: d.profile_image,
      cvUrl: d.cv_url,
      heroTagline: d.hero_tagline,
      availableForWork: d.available_for_work,
      university: d.university,
      openToRemote: d.open_to_remote,
    };
  } catch { return null; }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const { rows } = await pool.query('SELECT * FROM projects ORDER BY "order" ASC');
    return rows.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      techStack: d.tech_stack ?? [],
      images: d.images ?? [],
      githubLink: d.github_link,
      liveDemoLink: d.live_demo_link,
      documentUrl: d.document_url,
      featured: d.featured,
      order: d.order,
      createdAt: d.created_at,
    }));
  } catch { return []; }
}

export async function getExperiences(): Promise<Experience[]> {
  try {
    const { rows } = await pool.query('SELECT * FROM experience ORDER BY "order" ASC');
    return rows.map((d) => ({
      id: d.id,
      company: d.company,
      role: d.role,
      startDate: d.start_date,
      endDate: d.end_date,
      current: d.current,
      description: d.description,
      order: d.order,
      type: d.type,
    }));
  } catch { return []; }
}

export async function getSkills(): Promise<Skill[]> {
  try {
    const { rows } = await pool.query('SELECT * FROM skills ORDER BY "order" ASC');
    return rows.map((d) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      level: d.level,
      order: d.order,
    }));
  } catch { return []; }
}

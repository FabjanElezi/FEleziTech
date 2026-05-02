import { Portfolio, Project, Experience, Skill } from '@/types';

// ── Portfolio ──────────────────────────────────────────────

export async function getPortfolio(): Promise<Portfolio | null> {
  const r = await fetch('/api/portfolio');
  if (!r.ok) return null;
  return r.json();
}

export async function savePortfolio(data: Partial<Portfolio>) {
  const r = await fetch('/api/portfolio', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to save portfolio');
}

// ── Projects ───────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const r = await fetch('/api/projects');
  if (!r.ok) throw new Error('Failed to fetch projects');
  return r.json();
}

export async function addProject(data: Omit<Project, 'id' | 'createdAt'>): Promise<string> {
  const r = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to add project');
  const row = await r.json();
  return row.id as string;
}

export async function updateProject(id: string, data: Partial<Project>) {
  const r = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to update project');
}

export async function deleteProject(id: string) {
  const r = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete project');
}

// ── Experience ─────────────────────────────────────────────

export async function getExperiences(): Promise<Experience[]> {
  const r = await fetch('/api/experience');
  if (!r.ok) throw new Error('Failed to fetch experience');
  return r.json();
}

export async function addExperience(data: Omit<Experience, 'id'>): Promise<string> {
  const r = await fetch('/api/experience', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to add experience');
  const row = await r.json();
  return row.id as string;
}

export async function updateExperience(id: string, data: Partial<Experience>) {
  const r = await fetch(`/api/experience/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to update experience');
}

export async function deleteExperience(id: string) {
  const r = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete experience');
}

// ── Skills ─────────────────────────────────────────────────

export async function getSkills(): Promise<Skill[]> {
  const r = await fetch('/api/skills');
  if (!r.ok) throw new Error('Failed to fetch skills');
  return r.json();
}

export async function addSkill(data: Omit<Skill, 'id'>): Promise<string> {
  const r = await fetch('/api/skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to add skill');
  const row = await r.json();
  return row.id as string;
}

export async function updateSkill(id: string, data: Partial<Skill>) {
  const r = await fetch(`/api/skills/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to update skill');
}

export async function deleteSkill(id: string) {
  const r = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete skill');
}

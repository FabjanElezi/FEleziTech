export type MadeAt = 'course' | 'client' | 'internship' | 'personal' | 'thesis' | 'workshop';

/**
 * Year and "made at" for the project archive, keyed by the project's exact title
 * in /admin. hidePdf keeps a project's PDF out of the archive.
 */
export const ARCHIVE_INFO: Record<string, { year: number; madeAt: MadeAt; hidePdf?: boolean }> = {
  'Dual Vision Analyzer': { year: 2026, madeAt: 'thesis' },
  'AI Security & Adversarial ML Demo': { year: 2026, madeAt: 'course' },
  // Its PDF is outdated and will be replaced.
  'Lucky7Flights': { year: 2026, madeAt: 'course', hidePdf: true },
  'RevoGames': { year: 2026, madeAt: 'course' },
  'TechDeal – Django Webshop (Internship Project)': { year: 2025, madeAt: 'internship' },
  'RevoHelp – Startup Concept Website': { year: 2024, madeAt: 'workshop' },
  // Featured today; listed so they read right if they ever move to the archive.
  'FETech Analytics': { year: 2026, madeAt: 'personal' },
  'ParaFluent – Website & Booking System': { year: 2026, madeAt: 'client' },
  // Its PDF is an internal speaker script, never linked.
  'Video Game Library Database': { year: 2026, madeAt: 'course', hidePdf: true },
};

/**
 * The home page shows the featured projects and the archive has the rest. If none
 * is featured, the first six show on the home page, as they did before.
 */
export function splitProjects<P extends { featured: boolean }>(projects: P[]): { shown: P[]; rest: P[] } {
  const featured = projects.filter((p) => p.featured);
  if (featured.length > 0) return { shown: featured, rest: projects.filter((p) => !p.featured) };
  return { shown: projects.slice(0, 6), rest: projects.slice(6) };
}

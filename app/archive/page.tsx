import type { Metadata } from 'next';
import ArchiveView, { type ArchiveRow } from '@/components/ArchiveView';
import { getProjects } from '@/lib/data';
import { ARCHIVE_INFO, splitProjects } from '@/lib/archive';
import { url } from '@/lib/site';

// Read from the database on every request, like the home page, so /admin edits show up at once.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Project archive',
  description: 'Projects by Fabjan Elezi with year, context, tools and links.',
  alternates: { canonical: url('/archive') },
};

export default async function ArchivePage() {
  const { rest } = splitProjects(await getProjects());
  const rows: ArchiveRow[] = rest
    .map((p) => {
      const info = ARCHIVE_INFO[p.title];
      return {
        id: p.id,
        title: p.title,
        year: info?.year,
        madeAt: info?.madeAt,
        techStack: p.techStack ?? [],
        live: p.liveDemoLink || undefined,
        code: p.githubLink || undefined,
        pdf: info?.hidePdf ? undefined : p.documentUrl || undefined,
      };
    })
    // Newest first, projects without a year last; within a year, the order set in /admin.
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  return <ArchiveView rows={rows} />;
}

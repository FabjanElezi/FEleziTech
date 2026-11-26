import type { Metadata } from 'next';
import ArchiveView, { type ArchiveRow } from '@/components/ArchiveView';
import { getProjects } from '@/lib/data';
import { ARCHIVE_INFO, splitProjects } from '@/lib/archive';
import { SHARE_IMAGE, url } from '@/lib/site';

// Read from the database on every request, like the home page, so /admin edits show up at once.
export const dynamic = 'force-dynamic';

const TITLE = 'Project archive';
const DESCRIPTION = 'Projects by Fabjan Elezi with year, context, tools and links.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: url('/archive') },
  // A shared link shows this page's own title and text, not the home page's.
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/archive', siteName: 'Fabjan Elezi', type: 'website', images: [SHARE_IMAGE] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE.url] },
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

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CaseStudyView from '@/components/CaseStudyView';
import { getCaseStudy, hasContent } from '@/lib/caseStudies';

const study = getCaseStudy('it-systems-lab')!;

// Not linked anywhere, not in the sitemap, and kept out of search engines until it is written.
export const metadata: Metadata = {
  title: study.meta.title,
  robots: { index: false, follow: false },
};

export default function ITSystemsLabPage() {
  // While every section is empty, the address shows the normal "page not found".
  if (!hasContent(study)) notFound();
  return <CaseStudyView study={study} />;
}

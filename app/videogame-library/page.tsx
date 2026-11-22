import type { Metadata } from 'next';
import CaseStudyView from '@/components/CaseStudyView';
import VideoGameLibraryExtras from '@/components/VideoGameLibraryExtras';
import { getCaseStudy } from '@/lib/caseStudies';
import { url } from '@/lib/site';

const study = getCaseStudy('videogame-library')!;

export const metadata: Metadata = {
  title: study.meta.title,
  description: study.meta.description,
  // Its own address; without this the page would inherit the home page's canonical link.
  alternates: { canonical: url(`/${study.slug}`) },
};

// The Video Game Library's case study, at the same address the project page had before.
export default function VideoGameLibraryPage() {
  return <CaseStudyView study={study} extra={<VideoGameLibraryExtras />} />;
}

import type { Metadata } from 'next';
import CaseStudyView from '@/components/CaseStudyView';
import VideoGameLibraryExtras from '@/components/VideoGameLibraryExtras';
import { getCaseStudy } from '@/lib/caseStudies';
import { SHARE_IMAGE, url } from '@/lib/site';

const study = getCaseStudy('videogame-library')!;

export const metadata: Metadata = {
  title: study.meta.title,
  description: study.meta.description,
  alternates: { canonical: url(`/${study.slug}`) },
  // A shared link shows this page's own title and text, not the home page's.
  openGraph: { title: study.meta.title, description: study.meta.description, url: `/${study.slug}`, siteName: 'Fabjan Elezi', type: 'article', images: [SHARE_IMAGE] },
  twitter: { card: 'summary_large_image', title: study.meta.title, description: study.meta.description, images: [SHARE_IMAGE.url] },
};

// The Video Game Library's case study, at the same address the project page had before.
export default function VideoGameLibraryPage() {
  return <CaseStudyView study={study} extra={<VideoGameLibraryExtras />} />;
}

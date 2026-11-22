import type { Metadata } from 'next';
import CaseStudyView from '@/components/CaseStudyView';
import { getCaseStudy } from '@/lib/caseStudies';
import { url } from '@/lib/site';

const study = getCaseStudy('parafluent')!;

export const metadata: Metadata = {
  title: study.meta.title,
  description: study.meta.description,
  // Its own address; without this the page would inherit the home page's canonical link.
  alternates: { canonical: url(`/${study.slug}`) },
};

export default function ParaFluentPage() {
  return <CaseStudyView study={study} />;
}

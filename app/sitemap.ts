import { MetadataRoute } from 'next';
import { SITE_URL, url } from '@/lib/site';
import { CASE_STUDIES } from '@/lib/caseStudies';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: url('/services'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: url('/archive'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Case studies; a page that is still being written (indexable: false) stays out.
    ...CASE_STUDIES.filter((s) => s.indexable).map((s) => ({
      url: url(`/${s.slug}`),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}

import type { Metadata } from 'next';
import { url } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Video Game Library Database',
  description:
    'A normalised MySQL relational database for a video game lending library — 9 tables, foreign keys, M:N junctions. Project by Fabjan Elezi.',
  alternates: {
    canonical: url('/videogame-library'),
  },
  openGraph: {
    title: 'Video Game Library Database | Fabjan Elezi',
    description: 'Relational MySQL database project by Fabjan Elezi — 9 tables with proper normalisation, foreign keys and M:N junction tables.',
    url: url('/videogame-library'),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

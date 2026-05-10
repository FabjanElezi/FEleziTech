import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Game Library Database',
  description:
    'A normalised MySQL relational database for a video game lending library — 9 tables, foreign keys, M:N junctions. Project by Fabjan Elezi (FeleziTech).',
  alternates: {
    canonical: 'https://felezitech.vercel.app/videogame-library',
  },
  openGraph: {
    title: 'Video Game Library Database | FeleziTech',
    description: 'Relational MySQL database project by Fabjan Elezi — 9 tables with proper normalisation, foreign keys and M:N junction tables.',
    url: 'https://felezitech.vercel.app/videogame-library',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

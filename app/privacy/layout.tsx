import type { Metadata } from 'next';
import { url } from '@/lib/site';

// page.tsx is a client component (it reads the chosen language), so its
// metadata lives here. The root template turns this into "Privacy | Fabjan Elezi".
export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What this site records and what it does not: no cookies, no third-party requests, no IP address stored. Privacy notice for the portfolio of Fabjan Elezi.',
  alternates: {
    canonical: url('/privacy'),
  },
  openGraph: {
    title: 'Privacy | Fabjan Elezi',
    description:
      'No cookies, no third-party requests, no IP address stored. The complete list of what this site records.',
    url: url('/privacy'),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

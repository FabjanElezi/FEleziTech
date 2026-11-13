import type { Metadata } from 'next';
import { url } from '@/lib/site';

// page.tsx is a client component (it reads the chosen language), so its
// metadata lives here. The root template turns this into "Privacy | Fabjan Elezi".
export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'This site does not track its visitors: no visit records, no cookies, no third-party requests. Privacy notice for the portfolio of Fabjan Elezi.',
  alternates: {
    canonical: url('/privacy'),
  },
  openGraph: {
    title: 'Privacy | Fabjan Elezi',
    description:
      'No tracking, no cookies, no third-party requests. What this site does with data, in full.',
    url: url('/privacy'),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

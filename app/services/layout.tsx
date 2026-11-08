import type { Metadata } from 'next';
import { url } from '@/lib/site';

// The page itself is rendered per request (it reads services from the
// database), so its metadata lives here. Root template → "Services | Fabjan Elezi".
export const metadata: Metadata = {
  title: 'Services',
  description:
    'Freelance websites, data dashboards, IT setup and database design for businesses in Albania, Europe and worldwide. Free first consultation, price on request.',
  alternates: {
    canonical: url('/services'),
  },
  openGraph: {
    title: 'Services | Fabjan Elezi',
    description:
      'Websites, data dashboards, IT setup and database design. Free first consultation, price on request.',
    url: url('/services'),
  },
  // The root layout sets the portfolio title for X/Twitter; override it here.
  twitter: {
    title: 'Services | Fabjan Elezi',
    description:
      'Websites, data dashboards, IT setup and database design. Free first consultation, price on request.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

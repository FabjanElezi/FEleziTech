import type { Metadata } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/next';
import CursorGlow from '@/components/CursorGlow';
import ParticleBackground from '@/components/ParticleBackground';
import ScrollProgress from '@/components/ScrollProgress';
import ScrollToTop from '@/components/ScrollToTop';
import './globals.css';

const geistSans  = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono  = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const BASE_URL = 'https://felezitech.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Fabjan Elezi – FeleziTech | Developer Portfolio',
    template: '%s | FeleziTech',
  },
  description:
    'Fabjan Elezi (FeleziTech) – Computer Science & Engineering student from Tirana, Albania. Building secure, scalable web applications. Open to internships in IT, Data Analytics and Business Intelligence.',
  keywords: [
    'FeleziTech', 'felezitech', 'Fabjan Elezi', 'fabjan elezi',
    'developer portfolio', 'computer science student', 'Albania developer',
    'web developer', 'full stack developer', 'junior developer',
    'cybersecurity', 'data analytics', 'business intelligence',
    'React developer', 'Next.js developer', 'TypeScript',
    'Tirana developer', 'felezitech.vercel.app',
  ],
  authors: [{ name: 'Fabjan Elezi', url: BASE_URL }],
  creator: 'Fabjan Elezi',
  publisher: 'Fabjan Elezi',
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'FeleziTech',
    title: 'Fabjan Elezi – FeleziTech | Developer Portfolio',
    description:
      'Computer Science & Engineering student from Albania. Building secure, scalable web applications. Open to internships in IT, Data Analytics and BI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fabjan Elezi – FeleziTech | Developer Portfolio',
    description:
      'Computer Science & Engineering student from Albania. Open to internships in IT, Data Analytics and Business Intelligence.',
  },
  verification: {
    google: 'ApA9oAURAiu_EPby9jZmU5EqyfNM4A4SxV50uQ1e9j8',
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${BASE_URL}/#person`,
      name: 'Fabjan Elezi',
      alternateName: 'FeleziTech',
      url: BASE_URL,
      jobTitle: 'Computer Science & Engineering Student',
      description:
        'Developer and CS student from Tirana, Albania. Focused on web development, cybersecurity, data analytics and business intelligence.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Tirana',
        addressCountry: 'AL',
      },
      knowsAbout: [
        'Web Development', 'React', 'Next.js', 'TypeScript',
        'Cybersecurity', 'Data Analytics', 'Business Intelligence',
        'MySQL', 'Relational Databases',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'FeleziTech',
      description: 'Developer portfolio of Fabjan Elezi',
      publisher: { '@id': `${BASE_URL}/#person` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* Set theme before paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();` }} />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ScrollProgress />
        <CursorGlow />
        <ParticleBackground />
        {children}
        <ScrollToTop />
        <Analytics />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/next';
import VisitTracker from '@/components/VisitTracker';
import CursorGlow from '@/components/CursorGlow';
import SurfaceFX from '@/components/SurfaceFX';
import { LanguageProvider } from '@/components/LanguageProvider';
import ParticleBackground from '@/components/ParticleBackground';
import ScrollProgress from '@/components/ScrollProgress';
import ScrollToTop from '@/components/ScrollToTop';
import MobileDock from '@/components/MobileDock';
import MotionProvider from '@/components/MotionProvider';
import { SITE_URL, SITE_HOST } from '@/lib/site';
import './globals.css';

const geistSans  = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono  = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Fabjan Elezi – F.EleziTech | Data & Information Systems Portfolio',
    template: '%s | F.EleziTech',
  },
  description:
    'Fabjan Elezi (F.EleziTech) – M.Sc. Information Systems student at FH Aachen with a B.Sc. in Business Informatics. Working where business meets technology: data, IT systems and software. Open to Werkstudent, internship and junior roles in IT, data and software development.',
  keywords: [
    'F.EleziTech', 'felezitech', 'Fabjan Elezi', 'fabjan elezi',
    'developer portfolio', 'information systems student', 'business informatics', 'FH Aachen',
    'web developer', 'data analyst', 'junior developer',
    'cybersecurity', 'data analytics', 'business intelligence', 'IT systems', 'software development', 'werkstudent',
    'React developer', 'Next.js developer', 'TypeScript',
    'Aachen', SITE_HOST,
  ],
  authors: [{ name: 'Fabjan Elezi', url: SITE_URL }],
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
    url: SITE_URL,
    siteName: 'F.EleziTech',
    title: 'Fabjan Elezi – F.EleziTech | Data & Information Systems Portfolio',
    description:
      'Information Systems master\'s student (FH Aachen), B.Sc. Business Informatics. Data, IT systems and software. Open to Werkstudent and internship roles.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fabjan Elezi – F.EleziTech | Data & Information Systems Portfolio',
    description:
      'M.Sc. Information Systems student at FH Aachen, B.Sc. Business Informatics. Open to Werkstudent and internship roles in IT, data and software.',
  },
  verification: {
    google: 'ApA9oAURAiu_EPby9jZmU5EqyfNM4A4SxV50uQ1e9j8',
  },
  alternates: {
    canonical: SITE_URL,
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
      '@id': `${SITE_URL}/#person`,
      name: 'Fabjan Elezi',
      alternateName: 'F.EleziTech',
      url: SITE_URL,
      jobTitle: 'M.Sc. Information Systems Student',
      description:
        'Information Systems master\'s student at FH Aachen, Germany, with a B.Sc. in Business Informatics. Working across data, IT systems and software development.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Aachen',
        addressCountry: 'DE',
      },
      knowsAbout: [
        'Web Development', 'React', 'Next.js', 'TypeScript',
        'Cybersecurity', 'Data Analytics', 'Business Intelligence',
        'MySQL', 'Relational Databases',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'F.EleziTech',
      description: 'Developer portfolio of Fabjan Elezi',
      publisher: { '@id': `${SITE_URL}/#person` },
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
      <body className="min-h-screen antialiased pb-24 md:pb-0" suppressHydrationWarning>
        <LanguageProvider>
          <MotionProvider>
            <ScrollProgress />
            <CursorGlow />
            <SurfaceFX />
            <div className="grain" aria-hidden />
            <ParticleBackground />
            {children}
            <MobileDock />
            <ScrollToTop />
          </MotionProvider>
        </LanguageProvider>
        <Analytics />
        <VisitTracker />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#131926',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </body>
    </html>
  );
}

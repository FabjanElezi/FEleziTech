import type { Metadata } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import SurfaceFX from '@/components/SurfaceFX';
import { LanguageProvider } from '@/components/LanguageProvider';
import ParticleBackground from '@/components/ParticleBackground';
import ScrollProgress from '@/components/ScrollProgress';
import ScrollToTop from '@/components/ScrollToTop';
import MobileDock from '@/components/MobileDock';
import MotionProvider from '@/components/MotionProvider';
import SkipLink from '@/components/SkipLink';
import { SITE_URL } from '@/lib/site';
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
    default: 'Fabjan Elezi – Data Analytics & IT Systems',
    template: '%s | Fabjan Elezi',
  },
  description:
    'Fabjan Elezi – M.Sc. Information Systems student at FH Aachen with a B.Sc. in Business Informatics. Working where business meets technology: data, IT systems and software. Open to Werkstudent roles in data analytics, BI or IT.',
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
    // './' is each page's own address, so a shared link names the page that was shared.
    url: './',
    siteName: 'Fabjan Elezi',
    title: 'Fabjan Elezi – Data Analytics & IT Systems',
    description:
      'Information Systems master\'s student (FH Aachen), B.Sc. Business Informatics. Data, IT systems and software. Open to Werkstudent roles in data analytics, BI or IT.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fabjan Elezi – Data Analytics & IT Systems',
    description:
      'M.Sc. Information Systems student at FH Aachen, B.Sc. Business Informatics. Open to Werkstudent roles in data analytics, BI or IT.',
  },
  verification: {
    google: 'ApA9oAURAiu_EPby9jZmU5EqyfNM4A4SxV50uQ1e9j8',
  },
  // './' resolves to each page's own address. A fixed SITE_URL here told search engines
  // that every page (/services, /privacy …) was really the home page.
  alternates: {
    canonical: './',
  },
  // No icons here on purpose. The files app/favicon.ico, app/icon.png and app/apple-icon.png are linked
  // by Next itself, each with a version in its address. A fixed address ('/logo.png') let browsers keep
  // showing an old logo long after it was replaced, because for them nothing had changed.
};

// The site itself. The profile (ProfilePage with the Person) is on the home page,
// where the photo and profile links from /admin are available.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Fabjan Elezi',
  description: 'Portfolio of Fabjan Elezi',
  publisher: { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: 'Fabjan Elezi', url: SITE_URL },
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
      <body className="min-h-screen antialiased pb-24 lg:pb-0" suppressHydrationWarning>
        <LanguageProvider>
          <SkipLink />
          <MotionProvider>
            <ScrollProgress />
            <SurfaceFX />
            <div className="grain" aria-hidden />
            <ParticleBackground />
            {children}
            <MobileDock />
            <ScrollToTop />
          </MotionProvider>
        </LanguageProvider>
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

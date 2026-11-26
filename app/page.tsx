import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import SectionDivider from '@/components/SectionDivider';
import { getPublicPortfolio, getProjects, getExperiences, getSkills } from '@/lib/data';
import SocialSidebar from '@/components/SocialSidebar';
import { SITE_URL } from '@/lib/site';

// Always render from the database so Admin edits show up on the very next visit.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [portfolio, projects, experiences, skills] = await Promise.all([
    getPublicPortfolio(),
    getProjects(),
    getExperiences(),
    getSkills(),
  ]);

  // Structured data for search engines: this page is Fabjan's profile. The photo,
  // university and profile links come from /admin, so they stay current.
  const profile = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${SITE_URL}/#profile`,
    url: SITE_URL,
    mainEntity: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Fabjan Elezi',
      url: SITE_URL,
      ...(portfolio?.profileImage ? { image: portfolio.profileImage } : {}),
      jobTitle: 'M.Sc. Information Systems student',
      description:
        'Information Systems master\'s student at FH Aachen, Germany, with a B.Sc. in Business Informatics. Working across data, IT systems and software development.',
      affiliation: { '@type': 'CollegeOrUniversity', name: portfolio?.university || 'FH Aachen – Aachen University of Applied Sciences' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'University Metropolitan Tirana' },
      address: { '@type': 'PostalAddress', addressLocality: 'Aachen', addressCountry: 'DE' },
      knowsAbout: [
        'Web Development', 'React', 'Next.js', 'TypeScript',
        'Cybersecurity', 'Data Analytics', 'Business Intelligence',
        'MySQL', 'Relational Databases',
      ],
      sameAs: [portfolio?.linkedin, portfolio?.github].filter(Boolean),
    },
  };

  return (
    <main className="relative">
      {/* "<" is escaped so text from /admin can never close the script tag early. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profile).replace(/</g, '\\u003c') }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          // Two soft pools of light, top-right and bottom-left, instead of five.
          background: [
            'radial-gradient(ellipse 65% 55% at 88% 10%, rgba(6,182,212,0.08) 0%, transparent 62%)',
            'radial-gradient(ellipse 60% 50% at 15% 85%, rgba(21,94,117,0.06) 0%, transparent 64%)',
          ].join(', '),
        }}
      />
      <div className="relative z-10">
        <SocialSidebar linkedin={portfolio?.linkedin} github={portfolio?.github} email={portfolio?.email} />
        <Navbar />
        <Hero portfolio={portfolio} projects={projects} />
        <SectionDivider />
        <About portfolio={portfolio} />
        <SectionDivider flip />
        <Skills skills={skills} />
        <SectionDivider />
        <Experience experiences={experiences} />
        <SectionDivider flip />
        <Projects projects={projects} />
        <SectionDivider />
        <Contact portfolio={portfolio} />
        <Footer portfolio={portfolio} />
      </div>
    </main>
  );
}

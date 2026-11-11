import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import SectionDivider from '@/components/SectionDivider';
import { getPortfolio, getProjects, getExperiences, getSkills } from '@/lib/data';
import SocialSidebar from '@/components/SocialSidebar';

// Always render from the database so Admin edits show up on the very next visit.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [portfolio, projects, experiences, skills] = await Promise.all([
    getPortfolio(),
    getProjects(),
    getExperiences(),
    getSkills(),
  ]);

  return (
    <main className="relative">
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
        <Navbar hasCv={Boolean(portfolio?.cvUrl)} />
        <Hero portfolio={portfolio} />
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

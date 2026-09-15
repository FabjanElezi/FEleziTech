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

export const revalidate = 60;

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
          background: [
            'radial-gradient(ellipse 75% 60% at 10% 18%, rgba(59,130,246,0.1) 0%, transparent 65%)',
            'radial-gradient(ellipse 65% 55% at 92% 12%, rgba(6,182,212,0.14) 0%, transparent 62%)',
            'radial-gradient(ellipse 72% 58% at 48% 94%, rgba(30,64,175,0.08) 0%, transparent 66%)',
            'radial-gradient(ellipse 50% 45% at 80% 58%, rgba(34,211,238,0.04) 0%, transparent 58%)',
            'radial-gradient(ellipse 55% 40% at 22% 75%, rgba(6,182,212,0.1) 0%, transparent 60%)',
          ].join(', '),
        }}
      />
      <div className="relative z-10">
        <SocialSidebar linkedin={portfolio?.linkedin} github={portfolio?.github} email={portfolio?.email} />
        <Navbar />
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
        <Footer />
      </div>
    </main>
  );
}

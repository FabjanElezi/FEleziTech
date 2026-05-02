import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { getPortfolio, getProjects, getExperiences, getSkills } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [portfolio, projects, experiences, skills] = await Promise.all([
    getPortfolio().catch(() => null),
    getProjects().catch(() => []),
    getExperiences().catch(() => []),
    getSkills().catch(() => []),
  ]);

  return (
    <main className="relative">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(124,58,237,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(6,182,212,0.07) 0%, transparent 60%)',
        }}
      />
      <div className="relative z-10">
        <Navbar />
        <Hero portfolio={portfolio} />
        <About portfolio={portfolio} />
        <Skills skills={skills} />
        <Experience experiences={experiences} />
        <Projects projects={projects} />
        <Contact portfolio={portfolio} />
        <Footer />
      </div>
    </main>
  );
}

import { savePortfolio, addExperience, addSkill, getExperiences, getSkills } from './firestore';

export async function seedInitialData() {
  const [existing, existingSkills] = await Promise.all([getExperiences(), getSkills()]);
  if (existing.length > 0 || existingSkills.length > 0) {
    throw new Error('Data already exists. Clear it first before seeding.');
  }
  await savePortfolio({
    name: 'Fabjan Elezi',
    title: 'Computer Science & Engineering Student',
    heroTagline: 'Building secure, scalable digital experiences.',
    bio: 'I am a Computer Science & Engineering student at Metropolitan University of Tirana with a passion for cybersecurity, networking, and full-stack development. Currently completing an exchange semester at Masaryk University. I thrive at the intersection of systems thinking and creative problem-solving.',
    email: 'fabio.elezi485@icloud.com',
    phone: '+3550693404140',
    linkedin: 'https://linkedin.com/in/fabjan-elezi-7527b2295',
    github: '',
    location: 'Tirana, Albania',
    profileImage: '',
    cvUrl: '',
    availableForWork: true,
    university: 'Metropolitan University of Tirana',
    openToRemote: true,
  });

  const experiences = [
    {
      company: 'Metropolitan University of Tirana',
      role: 'BSc Computer Science & Engineering',
      startDate: '2023',
      endDate: '2026',
      current: true,
      description: 'Studying computer science fundamentals, networking, and software engineering. Active in cybersecurity and programming clubs.',
      order: 0,
      type: 'education' as const,
    },
    {
      company: 'Masaryk University',
      role: 'Exchange Semester',
      startDate: '2025',
      endDate: '2025',
      current: false,
      description: 'International exchange semester broadening academic perspective in computer science and software development.',
      order: 1,
      type: 'education' as const,
    },
  ];

  for (const exp of experiences) {
    await addExperience(exp);
  }

  const skills = [
    { name: 'HTML & CSS', category: 'technical' as const, order: 0 },
    { name: 'Python', category: 'technical' as const, order: 1 },
    { name: 'SQL', category: 'technical' as const, order: 2 },
    { name: 'Networking', category: 'technical' as const, order: 3 },
    { name: 'Cybersecurity Basics', category: 'technical' as const, order: 4 },
    { name: 'Excel', category: 'tool' as const, order: 5 },
    { name: 'Albanian', category: 'language' as const, level: 'Fluent', order: 6 },
    { name: 'English', category: 'language' as const, level: 'Fluent', order: 7 },
    { name: 'German', category: 'language' as const, level: 'Basic', order: 8 },
    { name: 'Spanish', category: 'language' as const, level: 'Basic', order: 9 },
  ];

  for (const skill of skills) {
    await addSkill(skill);
  }
}

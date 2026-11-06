export interface Portfolio {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  linkedin: string;
  github?: string;
  location?: string;
  profileImage?: string;
  cvUrl?: string;
  heroTagline?: string;
  availableForWork?: boolean;
  university?: string;
  openToRemote?: boolean;
  // Translations. The suffix is what lib/i18n looks up, so it stays snake_case.
  title_de?: string;
  title_sq?: string;
  bio_de?: string;
  bio_sq?: string;
  heroTagline_de?: string;
  heroTagline_sq?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  images: string[];
  githubLink?: string;
  liveDemoLink?: string;
  documentUrl?: string;
  dbDesignImages?: string[];
  featured: boolean;
  order: number;
  createdAt: string;
  description_de?: string;
  description_sq?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  order: number;
  type: 'work' | 'education' | 'award' | 'other';
  certificateUrl?: string;
  role_de?: string;
  role_sq?: string;
  description_de?: string;
  description_sq?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'language' | 'tool';
  level?: string;
  order: number;
}

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
  type: 'work' | 'education' | 'award';
  certificateUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'language' | 'tool';
  level?: string;
  order: number;
}

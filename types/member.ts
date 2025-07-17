export interface ProjectTimeline {
  id: string;
  title: string;
  description: string;
  period: string;
  date: string;
  technologies: string[];
  status: "completed" | "ongoing" | "planned";
  type: "web" | "mobile" | "ai" | "infrastructure" | "desktop" | "other";
}

export interface Member {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  bio: string;
  avatar: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  email?: string;
  skills: string[];
  projects: string[];
  experience: string;
  location: string;
  projectTimeline?: ProjectTimeline[];
}

export type FilterCategory =
  | "all"
  | "frontend"
  | "backend"
  | "mobile"
  | "ai"
  | "devops";

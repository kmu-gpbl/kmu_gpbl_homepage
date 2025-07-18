import type { BadgeType } from "./api";

export interface ProjectTimeline {
  id: string;
  title: string;
  description: string;
  period: string;
  date: string;
  technologies: string[];
  status: "completed" | "ongoing" | "planned" | "live";
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
  certifications?: Array<{
    id: string;
    name: string;
    organization: string;
    issueDate: string;
    expiryDate?: string | null;
    credentialId?: string | null;
    credentialUrl?: string | null;
  }>;
  badges?: BadgeType[];
  resumeUrl?: string | null;
  resumeFileName?: string | null;
  projectTimeline?: ProjectTimeline[];
}

export type FilterCategory =
  | "all"
  | "frontend"
  | "backend"
  | "mobile"
  | "ai"
  | "devops";

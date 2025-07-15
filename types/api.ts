// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  status: number;
  message: string;
  timestamp: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  bio: string;
  avatar: string;
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  email: string;
  skills: string[];
  experience: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  name: string;
  role: string;
  avatar: string;
  specialties: string[];
}

// Media Types
export interface ProjectMedia {
  id: string;
  type: "video" | "presentation" | "url" | "file";
  title: string;
  url: string;
  description?: string;
  fileName?: string;
  originalName?: string;
}

// Project Types
export interface Project {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string | null;
  period: string;
  status: "completed" | "ongoing" | "planned";
  type: "web" | "mobile" | "ai" | "infrastructure" | "other";
  technologies: string[];
  memberIds: string[];
  teamSize?: number;
  media?: ProjectMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithMembers extends Project {
  members: UserSummary[];
}

export interface ProjectSummary {
  id: string;
  title: string;
  description: string;
  period: string;
  status: "completed" | "ongoing" | "planned";
  type: "web" | "mobile" | "ai" | "infrastructure" | "other";
  technologies: string[];
  memberCount: number;
}

// API Query Types
export interface GetUsersQuery {
  specialty?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetProjectsQuery {
  type?: string;
  status?: string;
  memberId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// API Error Types
export interface ApiError {
  status: number;
  message: string;
  code: string;
  timestamp: string;
  details?: any;
}

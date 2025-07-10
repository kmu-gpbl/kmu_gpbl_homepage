import type {
  Project,
  ProjectWithMembers,
  ProjectSummary,
  UserSummary,
  ApiResponse,
  PaginatedResponse,
  GetProjectsQuery,
} from "@/types/api";
import projectsData from "@/data/projects.json";
import { getUsersByIds } from "./users";

// Type assertion for JSON data
const projects = projectsData.projects as Project[];

// Simulate API delay
const simulateDelay = (ms: number = 100) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Create API response format
const createApiResponse = <T>(
  data: T,
  message: string = "Success"
): ApiResponse<T> => ({
  data,
  status: 200,
  message,
  timestamp: new Date().toISOString(),
});

const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = "Success"
): PaginatedResponse<T> => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
  status: 200,
  message,
  timestamp: new Date().toISOString(),
});

/**
 * Get all projects with optional filtering and pagination
 * GET /api/projects
 */
export async function getProjects(
  query: GetProjectsQuery = {}
): Promise<PaginatedResponse<ProjectSummary>> {
  await simulateDelay();

  const { type, status, memberId, page = 1, limit = 10, search } = query;
  let filteredProjects = projectsData.projects;

  // Filter by type
  if (type && type !== "all") {
    filteredProjects = filteredProjects.filter(
      (project) => project.type === type
    );
  }

  // Filter by status
  if (status && status !== "all") {
    filteredProjects = filteredProjects.filter(
      (project) => project.status === status
    );
  }

  // Filter by member ID
  if (memberId) {
    filteredProjects = filteredProjects.filter((project) =>
      project.memberIds.includes(memberId)
    );
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProjects = filteredProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.technologies.some((tech) =>
          tech.toLowerCase().includes(searchLower)
        )
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  // Convert to ProjectSummary
  const projectSummaries: ProjectSummary[] = paginatedProjects.map(
    (project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      period: project.period,
      status: project.status,
      type: project.type,
      technologies: project.technologies,
      memberCount: project.memberIds.length,
    })
  );

  return createPaginatedResponse(
    projectSummaries,
    page,
    limit,
    filteredProjects.length,
    `Retrieved ${projectSummaries.length} projects`
  );
}

/**
 * Get project by ID
 * GET /api/projects/:id
 */
export async function getProjectById(
  id: string
): Promise<ApiResponse<Project | null>> {
  await simulateDelay();

  const project = projectsData.projects.find((p) => p.id === id);

  if (!project) {
    return {
      data: null,
      status: 404,
      message: `Project with ID ${id} not found`,
      timestamp: new Date().toISOString(),
    };
  }

  return createApiResponse(
    project,
    `Project ${project.title} retrieved successfully`
  );
}

/**
 * Get project with members by ID
 * GET /api/projects/:id/with-members
 */
export async function getProjectWithMembersById(
  id: string
): Promise<ApiResponse<ProjectWithMembers | null>> {
  await simulateDelay();

  const project = projectsData.projects.find((p) => p.id === id);

  if (!project) {
    return {
      data: null,
      status: 404,
      message: `Project with ID ${id} not found`,
      timestamp: new Date().toISOString(),
    };
  }

  // Get member details
  const membersResponse = await getUsersByIds(project.memberIds);
  const members = membersResponse.data;

  const projectWithMembers: ProjectWithMembers = {
    ...project,
    members,
  };

  return createApiResponse(
    projectWithMembers,
    `Project ${project.title} with members retrieved successfully`
  );
}

/**
 * Get projects by member ID
 * GET /api/projects/member/:memberId
 */
export async function getProjectsByMemberId(
  memberId: string
): Promise<ApiResponse<Project[]>> {
  await simulateDelay();

  const memberProjects = projectsData.projects.filter((project) =>
    project.memberIds.includes(memberId)
  );

  // Sort by start date (newest first)
  const sortedProjects = memberProjects.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return createApiResponse(
    sortedProjects,
    `Retrieved ${sortedProjects.length} projects for member ${memberId}`
  );
}

/**
 * Get projects by type
 * GET /api/projects/type/:type
 */
export async function getProjectsByType(
  type: string
): Promise<ApiResponse<ProjectSummary[]>> {
  await simulateDelay();

  const filteredProjects = projectsData.projects.filter(
    (project) => type === "all" || project.type === type
  );

  const projectSummaries: ProjectSummary[] = filteredProjects.map(
    (project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      period: project.period,
      status: project.status,
      type: project.type,
      technologies: project.technologies,
      memberCount: project.memberIds.length,
    })
  );

  return createApiResponse(
    projectSummaries,
    `Retrieved ${projectSummaries.length} projects of type: ${type}`
  );
}

/**
 * Get projects by status
 * GET /api/projects/status/:status
 */
export async function getProjectsByStatus(
  status: string
): Promise<ApiResponse<ProjectSummary[]>> {
  await simulateDelay();

  const filteredProjects = projectsData.projects.filter(
    (project) => status === "all" || project.status === status
  );

  const projectSummaries: ProjectSummary[] = filteredProjects.map(
    (project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      period: project.period,
      status: project.status,
      type: project.type,
      technologies: project.technologies,
      memberCount: project.memberIds.length,
    })
  );

  return createApiResponse(
    projectSummaries,
    `Retrieved ${projectSummaries.length} projects with status: ${status}`
  );
}

/**
 * Get project statistics
 * GET /api/projects/stats
 */
export async function getProjectStats(): Promise<ApiResponse<any>> {
  await simulateDelay();

  const stats = {
    total: projectsData.projects.length,
    byStatus: {
      completed: projectsData.projects.filter((p) => p.status === "completed")
        .length,
      ongoing: projectsData.projects.filter((p) => p.status === "ongoing")
        .length,
      planned: projectsData.projects.filter((p) => p.status === "planned")
        .length,
    },
    byType: {
      web: projectsData.projects.filter((p) => p.type === "web").length,
      mobile: projectsData.projects.filter((p) => p.type === "mobile").length,
      ai: projectsData.projects.filter((p) => p.type === "ai").length,
      infrastructure: projectsData.projects.filter(
        (p) => p.type === "infrastructure"
      ).length,
      other: projectsData.projects.filter((p) => p.type === "other").length,
    },
    technologies: Array.from(
      new Set(projectsData.projects.flatMap((p) => p.technologies))
    ).length,
  };

  return createApiResponse(stats, "Project statistics retrieved successfully");
}

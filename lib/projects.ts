import type { ProjectTimeline, Member } from "@/types/member";
import { members } from "./members";

export interface ProjectWithMember extends ProjectTimeline {
  member: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
}

export function getAllProjects(): ProjectWithMember[] {
  const allProjects: ProjectWithMember[] = [];

  members.forEach((member) => {
    if (member.projectTimeline) {
      member.projectTimeline.forEach((project) => {
        allProjects.push({
          ...project,
          member: {
            id: member.id,
            name: member.name,
            role: member.role,
            avatar: member.avatar || "/placeholder.svg",
          },
        });
      });
    }
  });

  return allProjects;
}

export function getProjectById(
  projectId: string
): ProjectWithMember | undefined {
  const allProjects = getAllProjects();
  return allProjects.find((project) => project.id === projectId);
}

export function getProjectsByMemberId(memberId: string): ProjectTimeline[] {
  const member = members.find((m) => m.id === memberId);
  return member?.projectTimeline || [];
}

export function getProjectsByType(
  type: ProjectTimeline["type"]
): ProjectWithMember[] {
  const allProjects = getAllProjects();
  return allProjects.filter((project) => project.type === type);
}

export function getProjectsByStatus(
  status: ProjectTimeline["status"]
): ProjectWithMember[] {
  const allProjects = getAllProjects();
  return allProjects.filter((project) => project.status === status);
}

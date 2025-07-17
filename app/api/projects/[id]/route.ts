import { NextRequest, NextResponse } from "next/server";
import {
  projectsApi,
  projectMembersApi,
  projectMediaApi,
} from "@/lib/supabase-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Get project information
    const project = await projectsApi.getById(projectId);

    // Get project member information
    const members = await projectMembersApi.getProjectMembers(projectId);

    // Get project media information
    const media = await projectMediaApi.getByProjectId(projectId);

    // Field name mapping (Supabase -> Client)
    const mappedProject = {
      ...project,
      startDate: project.start_date,
      endDate: project.end_date,
      teamSize: project.team_size,
      status: project.end_date ? project.status : "ongoing", // Auto-set to ongoing if no end date
      memberIds: members.map((member: any) => member.id),
      media: media,
    };

    // Combine project and member information
    const projectWithMembers = {
      ...mappedProject,
      members: members.map((member: any) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        specialties: member.specialties,
      })),
    };

    return NextResponse.json({
      project: projectWithMembers,
      message: "Project information loaded successfully.",
    });
  } catch (error) {
    console.error("Failed to load project information:", error);
    return NextResponse.json(
      { error: "An error occurred while loading project information." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();

    // Field name mapping (Client -> Supabase)
    const {
      title,
      description,
      status,
      startDate,
      endDate,
      teamSize,
      memberIds,
      media,
      ...otherFields
    } = body;

    // Period calculation
    let period = "";
    if (startDate) {
      const startDateObj = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        period = `${startDateObj.getFullYear()}.${String(
          startDateObj.getMonth() + 1
        ).padStart(2, "0")} - ${endDateObj.getFullYear()}.${String(
          endDateObj.getMonth() + 1
        ).padStart(2, "0")}`;
      } else {
        period = `${startDateObj.getFullYear()}.${String(
          startDateObj.getMonth() + 1
        ).padStart(2, "0")} - Present`;
      }
    }

    const projectData = {
      ...otherFields,
      title,
      description,
      status: endDate ? status : "ongoing", // Auto-set to ongoing if no end date
      start_date: startDate,
      end_date: endDate,
      period,
      team_size: teamSize,
    };

    // Update project information
    const updatedProject = await projectsApi.update(projectId, projectData);

    // Update project members
    if (memberIds) {
      await projectMembersApi.updateProjectMembers(projectId, memberIds);
    }

    // Update project media
    if (media) {
      await projectMediaApi.updateProjectMedia(projectId, media);
    }

    // Return updated complete project information
    const project = await projectsApi.getById(projectId);
    const members = await projectMembersApi.getProjectMembers(projectId);
    const updatedMedia = await projectMediaApi.getByProjectId(projectId);

    const mappedProject = {
      ...project,
      startDate: project.start_date,
      endDate: project.end_date,
      teamSize: project.team_size,
      memberIds: members.map((member: any) => member.id),
      media: updatedMedia,
      members: members.map((member: any) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        specialties: member.specialties,
      })),
    };

    return NextResponse.json({
      project: mappedProject,
      message: "Project updated successfully.",
    });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the project." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Delete project-related data (including related members and media)
    await projectMembersApi.deleteProjectMembers(projectId);
    await projectMediaApi.deleteByProjectId(projectId);
    await projectsApi.delete(projectId);

    return NextResponse.json({
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the project." },
      { status: 500 }
    );
  }
}

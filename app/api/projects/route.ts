import { NextRequest, NextResponse } from "next/server";
import {
  projectsApi,
  projectMembersApi,
  projectMediaApi,
} from "@/lib/supabase-api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search");

    let projects;

    // Get projects for specific member
    if (memberId) {
      projects = await projectsApi.getByMemberId(memberId);
    } else {
      // Get all projects
      projects = await projectsApi.getAll();
    }

    // Field name mapping (Supabase -> Client) and load media for each project
    let mappedProjects = await Promise.all(
      projects.map(async (project: any) => {
        // Get media for this project
        const projectMedia = await projectMediaApi.getByProjectId(project.id);

        return {
          ...project,
          startDate: project.start_date,
          endDate: project.end_date,
          teamSize: project.team_size,
          displayOrder: project.display_order,
          status: project.status, // Use actual status from database
          memberIds: [], // Member info handled separately
          media: projectMedia || [], // Include actual media data
        };
      })
    );

    // Filtering
    if (type) {
      mappedProjects = mappedProjects.filter(
        (project: any) => project.type === type
      );
    }

    if (status) {
      mappedProjects = mappedProjects.filter(
        (project: any) => project.status === status
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      mappedProjects = mappedProjects.filter(
        (project: any) =>
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = mappedProjects.slice(startIndex, endIndex);

    return NextResponse.json({
      projects: paginatedProjects,
      pagination: {
        page,
        limit,
        total: mappedProjects.length,
        totalPages: Math.ceil(mappedProjects.length / limit),
      },
      message: "Project list loaded successfully.",
    });
  } catch (error) {
    console.error("Failed to load project list:", error);
    return NextResponse.json(
      {
        projects: [],
        error: "An error occurred while loading the project list.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Required field validation
    const requiredFields = [
      "title",
      "description",
      "startDate",
      "status",
      "type",
      "technologies",
      "teamSize",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} field is required.` },
          { status: 400 }
        );
      }
    }

    // Clean up endDate - convert empty string to null
    const cleanEndDate =
      body.endDate && body.endDate.trim() !== "" ? body.endDate : null;

    // Period calculation
    let period = "";
    if (body.startDate) {
      const startDate = new Date(body.startDate);
      if (cleanEndDate) {
        const endDate = new Date(cleanEndDate);
        period = `${startDate.getUTCFullYear()}.${String(
          startDate.getUTCMonth() + 1
        ).padStart(2, "0")} - ${endDate.getUTCFullYear()}.${String(
          endDate.getUTCMonth() + 1
        ).padStart(2, "0")}`;
      } else {
        period = `${startDate.getUTCFullYear()}.${String(
          startDate.getUTCMonth() + 1
        ).padStart(2, "0")} - Present`;
      }
    }

    // Create new project object (Client -> Supabase field mapping)
    const newProject = {
      title: body.title,
      description: body.description,
      start_date: body.startDate,
      end_date: cleanEndDate,
      period,
      status: body.status, // Use the status as provided by the client
      type: body.type,
      technologies: body.technologies || [],
      team_size: body.teamSize,
    };

    // Add project to Supabase
    const createdProject = await projectsApi.create(newProject);

    // Add project members
    if (body.memberIds && body.memberIds.length > 0) {
      for (const memberId of body.memberIds) {
        await projectMembersApi.addMember(createdProject.id, memberId);
      }
    }

    // Add project media
    if (body.media && body.media.length > 0) {
      await projectMediaApi.updateProjectMedia(createdProject.id, body.media);
    }

    // Get the complete project with media
    const projectMedia = await projectMediaApi.getByProjectId(
      createdProject.id
    );

    // Response data field mapping (Supabase -> Client)
    const mappedProject = {
      ...createdProject,
      startDate: createdProject.start_date,
      endDate: createdProject.end_date,
      teamSize: createdProject.team_size,
      memberIds: body.memberIds || [],
      media: projectMedia || [],
    };

    return NextResponse.json({
      message: "Project added successfully.",
      project: mappedProject,
    });
  } catch (error) {
    console.error("Failed to add project:", error);
    return NextResponse.json(
      { error: "An error occurred while adding the project." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("id");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 }
      );
    }

    // Delete project from Supabase
    await projectsApi.delete(projectId);

    return NextResponse.json(
      {
        message: "Project deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the project." },
      { status: 500 }
    );
  }
}

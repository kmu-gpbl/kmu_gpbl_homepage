import { NextRequest, NextResponse } from "next/server";
import { projectsApi } from "@/lib/supabase-api";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectIds } = body;

    if (!projectIds || !Array.isArray(projectIds)) {
      return NextResponse.json(
        { error: "projectIds array is required" },
        { status: 400 }
      );
    }

    // Update display_order for each project
    const updatePromises = projectIds.map((projectId: string, index: number) =>
      projectsApi.updateDisplayOrder(projectId, index)
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: "Project order updated successfully",
    });
  } catch (error) {
    console.error("Failed to update project order:", error);
    return NextResponse.json(
      { error: "Failed to update project order" },
      { status: 500 }
    );
  }
}

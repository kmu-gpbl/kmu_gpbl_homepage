import { NextRequest, NextResponse } from "next/server";
import { projectMediaApi } from "@/lib/supabase-api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const { id, mediaId } = await params;
    const body = await request.json();

    // Required field validation
    if (!body.type || !body.title || !body.url) {
      return NextResponse.json(
        { error: "Required fields are missing." },
        { status: 400 }
      );
    }

    // Media update data
    const updateData = {
      type: body.type,
      title: body.title,
      url: body.url,
      description: body.description || "",
    };

    // Update media in Supabase
    const updatedMedia = await projectMediaApi.update(mediaId, updateData);

    return NextResponse.json(
      {
        message: "Media updated successfully.",
        media: updatedMedia,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update media:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the media." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const { id, mediaId } = await params;

    // Delete media from Supabase
    await projectMediaApi.delete(mediaId);

    return NextResponse.json(
      {
        message: "Media deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete media:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the media." },
      { status: 500 }
    );
  }
}

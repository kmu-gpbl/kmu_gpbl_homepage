import { NextRequest, NextResponse } from "next/server";
import { projectMediaApi } from "@/lib/supabase-api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Required field validation
    if (!body.type || !body.title || !body.url) {
      return NextResponse.json(
        { error: "Required fields are missing." },
        { status: 400 }
      );
    }

    // Create new media object
    const newMedia = {
      project_id: id,
      type: body.type,
      title: body.title,
      url: body.url,
      description: body.description || "",
      file_name: null,
      original_name: null,
    };

    // Add media to Supabase
    const createdMedia = await projectMediaApi.create(newMedia);

    return NextResponse.json(
      {
        message: "Media added successfully.",
        media: createdMedia,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add media:", error);
    return NextResponse.json(
      { error: "An error occurred while adding the media." },
      { status: 500 }
    );
  }
}

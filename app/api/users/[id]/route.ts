import { NextRequest, NextResponse } from "next/server";
import { usersApi } from "@/lib/supabase-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const user = await usersApi.getById(userId);

    return NextResponse.json({
      user,
      message: "User information loaded successfully.",
    });
  } catch (error) {
    console.error("User information loading failed:", error);
    return NextResponse.json(
      { error: "An error occurred while loading user information." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();

    // Required field validation
    const requiredFields = ["name", "role", "specialties", "bio"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} field is required.` },
          { status: 400 }
        );
      }
    }

    // User data to update
    const updateData = {
      name: body.name,
      role: body.role,
      specialties: body.specialties || [],
      bio: body.bio,
      avatar: body.avatar,
      github: body.github || null,
      linkedin: body.linkedin || null,
      portfolio: body.portfolio || null,
      email: body.email || null,
      skills: body.skills || [],
      experience: body.experience || "",
      location: body.location || "",
    };

    // Update user in Supabase
    const updatedUser = await usersApi.update(userId, updateData);

    return NextResponse.json({
      message: "User information updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("User information update failed:", error);
    return NextResponse.json(
      { error: "An error occurred while updating user information." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();

    // Partial update user in Supabase
    const updatedUser = await usersApi.update(userId, body);

    return NextResponse.json({
      message: "User information updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("User information update failed:", error);
    return NextResponse.json(
      { error: "An error occurred while updating user information." },
      { status: 500 }
    );
  }
}

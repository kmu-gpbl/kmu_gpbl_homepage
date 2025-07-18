import { NextRequest, NextResponse } from "next/server";
import { usersApi } from "@/lib/supabase-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Get user from Supabase
    const user = await usersApi.getById(userId);

    // Ensure certifications field exists
    const safeUser = {
      ...user,
      certifications: user.certifications || [],
      resumeUrl: user.resume_url,
      resumeFileName: user.resume_file_name,
    };

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("Failed to get user:", error);
    return NextResponse.json({ error: "User not found." }, { status: 404 });
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
      certifications: body.certifications || [],
      resume_url: body.resumeUrl || null,
      resume_file_name: body.resumeFileName || null,
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

    // Convert client field names to database field names
    const updateData: any = { ...body };

    // Map resume fields
    if ("resumeUrl" in body) {
      updateData.resume_url = body.resumeUrl;
      delete updateData.resumeUrl;
    }
    if ("resumeFileName" in body) {
      updateData.resume_file_name = body.resumeFileName;
      delete updateData.resumeFileName;
    }

    // Partial update user in Supabase
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

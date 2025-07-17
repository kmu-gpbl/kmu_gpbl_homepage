import { NextRequest, NextResponse } from "next/server";
import { usersApi } from "@/lib/supabase-api";

export async function GET() {
  try {
    const users = await usersApi.getAll();

    return NextResponse.json({
      users,
      message: "User list loaded successfully.",
    });
  } catch (error) {
    console.error("Failed to load user list:", error);
    return NextResponse.json(
      { users: [], error: "An error occurred while loading the user list." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Create new user object
    const newUser = {
      name: body.name,
      role: body.role,
      specialties: body.specialties || [],
      bio: body.bio,
      avatar: body.avatar || "/placeholder.svg",
      github: body.github || null,
      linkedin: body.linkedin || null,
      portfolio: body.portfolio || null,
      email: body.email || null,
      skills: body.skills || [],
      experience: body.experience || "",
      location: body.location || "",
    };

    // Add user to Supabase
    const createdUser = await usersApi.create(newUser);

    return NextResponse.json({
      message: "Member added successfully.",
      user: createdUser,
    });
  } catch (error) {
    console.error("Failed to add member:", error);
    return NextResponse.json(
      { error: "An error occurred while adding the member." },
      { status: 500 }
    );
  }
}

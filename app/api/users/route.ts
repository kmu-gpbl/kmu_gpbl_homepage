import { NextRequest, NextResponse } from "next/server";
import { usersApi } from "@/lib/supabase-api";

export async function GET() {
  try {
    const users = await usersApi.getAll();

    return NextResponse.json({
      users,
      message: "사용자 목록을 성공적으로 불러왔습니다.",
    });
  } catch (error) {
    console.error("사용자 목록 로딩 실패:", error);
    return NextResponse.json(
      { users: [], error: "사용자 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    const requiredFields = ["name", "role", "specialties", "bio"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} 필드는 필수입니다.` },
          { status: 400 }
        );
      }
    }

    // 새 사용자 객체 생성
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

    // Supabase에 사용자 추가
    const createdUser = await usersApi.create(newUser);

    return NextResponse.json({
      message: "멤버가 성공적으로 추가되었습니다.",
      user: createdUser,
    });
  } catch (error) {
    console.error("멤버 추가 실패:", error);
    return NextResponse.json(
      { error: "멤버 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

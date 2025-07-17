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
      message: "사용자 정보를 성공적으로 불러왔습니다.",
    });
  } catch (error) {
    console.error("사용자 정보 로딩 실패:", error);
    return NextResponse.json(
      { error: "사용자 정보를 불러오는 중 오류가 발생했습니다." },
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

    // 업데이트할 사용자 데이터
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

    // Supabase에서 사용자 업데이트
    const updatedUser = await usersApi.update(userId, updateData);

    return NextResponse.json({
      message: "사용자 정보가 성공적으로 수정되었습니다.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("사용자 정보 수정 실패:", error);
    return NextResponse.json(
      { error: "사용자 정보 수정 중 오류가 발생했습니다." },
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

    // Supabase에서 사용자 부분 업데이트
    const updatedUser = await usersApi.update(userId, body);

    return NextResponse.json({
      message: "사용자 정보가 성공적으로 수정되었습니다.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("사용자 정보 수정 실패:", error);
    return NextResponse.json(
      { error: "사용자 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

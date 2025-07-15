import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "users.json");

export async function GET() {
  try {
    const data = await fs.readFile(dataFilePath, "utf-8");
    const jsonData = JSON.parse(data);
    const users = Array.isArray(jsonData.users) ? jsonData.users : [];

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

    // 데이터 파일 읽기
    const data = await fs.readFile(dataFilePath, "utf-8");
    const jsonData = JSON.parse(data);
    const users = jsonData.users || [];

    // 새 사용자 ID 생성
    const newId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 새 사용자 객체 생성
    const newUser = {
      id: newId,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 사용자 추가
    users.push(newUser);

    // 파일에 저장 (원래 구조 유지)
    await fs.writeFile(dataFilePath, JSON.stringify({ users }, null, 2));

    return NextResponse.json({
      message: "멤버가 성공적으로 추가되었습니다.",
      user: newUser,
    });
  } catch (error) {
    console.error("멤버 추가 실패:", error);
    return NextResponse.json(
      { error: "멤버 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

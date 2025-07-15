import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "users.json");

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // 데이터 파일 읽기
    const data = await fs.readFile(dataFilePath, "utf-8");
    const jsonData = JSON.parse(data);
    const users = Array.isArray(jsonData.users) ? jsonData.users : [];

    // 사용자 찾기
    const user = users.find((u: any) => u.id === userId);

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

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
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
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
    const users = Array.isArray(jsonData.users) ? jsonData.users : [];

    // 사용자 찾기
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기존 사용자 정보 유지하면서 업데이트
    const existingUser = users[userIndex];
    const updatedUser = {
      ...existingUser,
      name: body.name,
      role: body.role,
      specialties: body.specialties || [],
      bio: body.bio,
      avatar: body.avatar || existingUser.avatar,
      github: body.github || null,
      linkedin: body.linkedin || null,
      portfolio: body.portfolio || null,
      email: body.email || null,
      skills: body.skills || [],
      experience: body.experience || "",
      location: body.location || "",
      updatedAt: new Date().toISOString(),
    };

    // 사용자 업데이트
    users[userIndex] = updatedUser;

    // 파일에 저장
    await fs.writeFile(dataFilePath, JSON.stringify({ users }, null, 2));

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
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();

    // 데이터 파일 읽기
    const data = await fs.readFile(dataFilePath, "utf-8");
    const jsonData = JSON.parse(data);
    const users = Array.isArray(jsonData.users) ? jsonData.users : [];

    // 사용자 찾기
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기존 사용자 정보 유지하면서 부분 업데이트
    const existingUser = users[userIndex];
    const updatedUser = {
      ...existingUser,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // 사용자 업데이트
    users[userIndex] = updatedUser;

    // 파일에 저장
    await fs.writeFile(dataFilePath, JSON.stringify({ users }, null, 2));

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

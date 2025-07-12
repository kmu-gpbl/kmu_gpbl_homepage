import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 사용자 데이터 파일 경로
    const usersFilePath = path.join(process.cwd(), "data", "users.json");

    // 기존 사용자 데이터 읽기
    const usersData = await fs.readFile(usersFilePath, "utf-8");
    const { users } = JSON.parse(usersData);

    // 사용자 찾기
    const userIndex = users.findIndex((user: any) => user.id === id);

    if (userIndex === -1) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 업데이트할 필드들
    const updateFields = [
      "bio",
      "experience",
      "skills",
      "specialties",
      "github",
      "linkedin",
      "portfolio",
      "email",
    ];
    const updatedUser = { ...users[userIndex] };

    // 허용된 필드만 업데이트
    updateFields.forEach((field) => {
      if (body[field] !== undefined) {
        updatedUser[field] = body[field];
      }
    });

    // 업데이트 시간 설정
    updatedUser.updatedAt = new Date().toISOString();

    // 사용자 정보 업데이트
    users[userIndex] = updatedUser;

    // 파일에 저장
    await fs.writeFile(
      usersFilePath,
      JSON.stringify({ users }, null, 2),
      "utf-8"
    );

    return NextResponse.json(
      {
        message: "사용자 정보가 성공적으로 업데이트되었습니다.",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("사용자 정보 업데이트 실패:", error);
    return NextResponse.json(
      { error: "사용자 정보 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

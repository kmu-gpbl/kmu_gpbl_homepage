import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 필수 필드 검증
    if (!body.type || !body.title || !body.url) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 프로젝트 데이터 파일 경로
    const projectsFilePath = path.join(process.cwd(), "data", "projects.json");

    // 기존 프로젝트 데이터 읽기
    const projectsData = await fs.readFile(projectsFilePath, "utf-8");
    const { projects } = JSON.parse(projectsData);

    // 프로젝트 찾기
    const projectIndex = projects.findIndex(
      (project: any) => project.id === id
    );

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 새 미디어 ID 생성
    const newMediaId = `media_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 새 미디어 객체 생성
    const newMedia = {
      id: newMediaId,
      type: body.type,
      title: body.title,
      url: body.url,
      description: body.description || "",
    };

    // 프로젝트에 미디어 추가
    if (!projects[projectIndex].media) {
      projects[projectIndex].media = [];
    }
    projects[projectIndex].media.push(newMedia);

    // 파일에 저장
    await fs.writeFile(
      projectsFilePath,
      JSON.stringify({ projects }, null, 2),
      "utf-8"
    );

    return NextResponse.json(
      {
        message: "미디어가 성공적으로 추가되었습니다.",
        media: newMedia,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("미디어 추가 실패:", error);
    return NextResponse.json(
      { error: "미디어 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

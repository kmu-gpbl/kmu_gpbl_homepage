import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const { id, mediaId } = await params;
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

    // 미디어 찾기
    const mediaIndex = projects[projectIndex].media?.findIndex(
      (media: any) => media.id === mediaId
    );

    if (mediaIndex === -1) {
      return NextResponse.json(
        { error: "미디어를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 미디어 업데이트
    projects[projectIndex].media[mediaIndex] = {
      ...projects[projectIndex].media[mediaIndex],
      type: body.type,
      title: body.title,
      url: body.url,
      description: body.description || "",
    };

    // 파일에 저장
    await fs.writeFile(
      projectsFilePath,
      JSON.stringify({ projects }, null, 2),
      "utf-8"
    );

    return NextResponse.json(
      {
        message: "미디어가 성공적으로 수정되었습니다.",
        media: projects[projectIndex].media[mediaIndex],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("미디어 수정 실패:", error);
    return NextResponse.json(
      { error: "미디어 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const { id, mediaId } = await params;

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

    // 미디어 찾기
    const mediaIndex = projects[projectIndex].media?.findIndex(
      (media: any) => media.id === mediaId
    );

    if (mediaIndex === -1) {
      return NextResponse.json(
        { error: "미디어를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 미디어 삭제
    const deletedMedia = projects[projectIndex].media.splice(mediaIndex, 1)[0];

    // 파일에 저장
    await fs.writeFile(
      projectsFilePath,
      JSON.stringify({ projects }, null, 2),
      "utf-8"
    );

    return NextResponse.json(
      {
        message: "미디어가 성공적으로 삭제되었습니다.",
        deletedMedia,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("미디어 삭제 실패:", error);
    return NextResponse.json(
      { error: "미디어 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

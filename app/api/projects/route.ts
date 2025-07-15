import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    if (
      !body.title ||
      !body.description ||
      !body.startDate ||
      !body.type ||
      !body.status
    ) {
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

    // 새 프로젝트 ID 생성
    const newId = `prj_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 새 프로젝트 객체 생성
    const newProject = {
      id: newId,
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate || null,
      period: body.period || `${body.startDate} - ${body.endDate || "현재"}`,
      status: body.status,
      type: body.type,
      technologies: body.technologies || [],
      memberIds: body.memberIds || [],
      teamSize: body.teamSize || 1,
      media: body.media || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 프로젝트 목록에 추가
    projects.push(newProject);

    // 파일에 저장
    await fs.writeFile(
      projectsFilePath,
      JSON.stringify({ projects }, null, 2),
      "utf-8"
    );

    return NextResponse.json(
      {
        message: "프로젝트가 성공적으로 추가되었습니다.",
        project: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("프로젝트 추가 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const memberId = searchParams.get("memberId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    // 프로젝트 데이터 파일 경로
    const projectsFilePath = path.join(process.cwd(), "data", "projects.json");

    // 프로젝트 데이터 읽기
    const projectsData = await fs.readFile(projectsFilePath, "utf-8");
    const { projects } = JSON.parse(projectsData);

    // 필터링
    let filteredProjects = projects;

    if (type) {
      filteredProjects = filteredProjects.filter(
        (project: any) => project.type === type
      );
    }

    if (status) {
      filteredProjects = filteredProjects.filter(
        (project: any) => project.status === status
      );
    }

    if (memberId) {
      filteredProjects = filteredProjects.filter((project: any) =>
        project.memberIds.includes(memberId)
      );
    }

    if (search) {
      filteredProjects = filteredProjects.filter(
        (project: any) =>
          project.title.toLowerCase().includes(search.toLowerCase()) ||
          project.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 정렬 (최신순)
    filteredProjects.sort(
      (a: any, b: any) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedProjects,
      pagination: {
        page,
        limit,
        total: filteredProjects.length,
        totalPages: Math.ceil(filteredProjects.length / limit),
      },
      status: 200,
      message: "프로젝트 목록을 성공적으로 가져왔습니다.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("프로젝트 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("id");

    if (!projectId) {
      return NextResponse.json(
        { error: "프로젝트 ID가 필요합니다." },
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
      (project: any) => project.id === projectId
    );

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 프로젝트 삭제
    const deletedProject = projects.splice(projectIndex, 1)[0];

    // 파일에 저장
    await fs.writeFile(
      projectsFilePath,
      JSON.stringify({ projects }, null, 2),
      "utf-8"
    );

    return NextResponse.json(
      {
        message: "프로젝트가 성공적으로 삭제되었습니다.",
        deletedProject,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("프로젝트 삭제 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "projects.json");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search");

    const data = await fs.readFile(dataFilePath, "utf-8");
    const jsonData = JSON.parse(data);
    let projects = Array.isArray(jsonData.projects) ? jsonData.projects : [];

    // 필터링
    if (memberId) {
      projects = projects.filter(
        (project: any) =>
          project.memberIds && project.memberIds.includes(memberId)
      );
    }

    if (type) {
      projects = projects.filter((project: any) => project.type === type);
    }

    if (status) {
      projects = projects.filter((project: any) => project.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      projects = projects.filter(
        (project: any) =>
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower)
      );
    }

    // 정렬 (최신순)
    projects.sort(
      (a: any, b: any) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = projects.slice(startIndex, endIndex);

    return NextResponse.json({
      projects: paginatedProjects,
      pagination: {
        page,
        limit,
        total: projects.length,
        totalPages: Math.ceil(projects.length / limit),
      },
      message: "프로젝트 목록을 성공적으로 불러왔습니다.",
    });
  } catch (error) {
    console.error("프로젝트 목록 로딩 실패:", error);
    return NextResponse.json(
      {
        projects: [],
        error: "프로젝트 목록을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    const requiredFields = [
      "title",
      "description",
      "startDate",
      "status",
      "type",
      "technologies",
      "teamSize",
    ];
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
    const projects = jsonData.projects || [];

    // 새 프로젝트 ID 생성
    const newId = `project_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 기간 계산
    let period = "";
    if (body.startDate) {
      const startDate = new Date(body.startDate);
      if (body.endDate) {
        const endDate = new Date(body.endDate);
        period = `${startDate.getFullYear()}.${String(
          startDate.getMonth() + 1
        ).padStart(2, "0")} - ${endDate.getFullYear()}.${String(
          endDate.getMonth() + 1
        ).padStart(2, "0")}`;
      } else {
        period = `${startDate.getFullYear()}.${String(
          startDate.getMonth() + 1
        ).padStart(2, "0")} - 현재`;
      }
    }

    // 새 프로젝트 객체 생성
    const newProject = {
      id: newId,
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate || null,
      period,
      status: body.status,
      type: body.type,
      technologies: body.technologies || [],
      memberIds: body.memberIds || [],
      teamSize: body.teamSize,
      media: body.media || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 프로젝트 추가
    projects.push(newProject);

    // 파일에 저장 (원래 구조 유지)
    await fs.writeFile(dataFilePath, JSON.stringify({ projects }, null, 2));

    return NextResponse.json({
      message: "프로젝트가 성공적으로 추가되었습니다.",
      project: newProject,
    });
  } catch (error) {
    console.error("프로젝트 추가 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 추가 중 오류가 발생했습니다." },
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

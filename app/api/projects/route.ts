import { NextRequest, NextResponse } from "next/server";
import { projectsApi, projectMembersApi } from "@/lib/supabase-api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search");

    let projects;

    // 특정 멤버의 프로젝트 조회
    if (memberId) {
      projects = await projectsApi.getByMemberId(memberId);
    } else {
      // 모든 프로젝트 조회
      projects = await projectsApi.getAll();
    }

    // 필드명 매핑 (Supabase -> 클라이언트)
    let mappedProjects = projects.map((project: any) => ({
      ...project,
      startDate: project.start_date,
      endDate: project.end_date,
      teamSize: project.team_size,
      memberIds: [], // 멤버 정보는 별도로 처리
      media: [], // 미디어는 별도로 처리
    }));

    // 필터링
    if (type) {
      mappedProjects = mappedProjects.filter(
        (project: any) => project.type === type
      );
    }

    if (status) {
      mappedProjects = mappedProjects.filter(
        (project: any) => project.status === status
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      mappedProjects = mappedProjects.filter(
        (project: any) =>
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower)
      );
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = mappedProjects.slice(startIndex, endIndex);

    return NextResponse.json({
      projects: paginatedProjects,
      pagination: {
        page,
        limit,
        total: mappedProjects.length,
        totalPages: Math.ceil(mappedProjects.length / limit),
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

    // 새 프로젝트 객체 생성 (클라이언트 -> Supabase 필드명 매핑)
    const newProject = {
      title: body.title,
      description: body.description,
      start_date: body.startDate,
      end_date: body.endDate || null,
      period,
      status: body.status,
      type: body.type,
      technologies: body.technologies || [],
      team_size: body.teamSize,
    };

    // Supabase에 프로젝트 추가
    const createdProject = await projectsApi.create(newProject);

    // 프로젝트 멤버 추가
    if (body.memberIds && body.memberIds.length > 0) {
      for (const memberId of body.memberIds) {
        await projectMembersApi.addMember(createdProject.id, memberId);
      }
    }

    // 응답 데이터 필드명 매핑 (Supabase -> 클라이언트)
    const mappedProject = {
      ...createdProject,
      startDate: createdProject.start_date,
      endDate: createdProject.end_date,
      teamSize: createdProject.team_size,
      memberIds: body.memberIds || [],
      media: [],
    };

    return NextResponse.json({
      message: "프로젝트가 성공적으로 추가되었습니다.",
      project: mappedProject,
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

    // Supabase에서 프로젝트 삭제
    await projectsApi.delete(projectId);

    return NextResponse.json(
      {
        message: "프로젝트가 성공적으로 삭제되었습니다.",
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

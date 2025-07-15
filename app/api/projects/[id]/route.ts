import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "projects.json");

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
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
    const projects = JSON.parse(data);

    // 프로젝트 찾기
    const projectIndex = projects.findIndex((p: any) => p.id === projectId);
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기존 프로젝트 정보 유지하면서 업데이트
    const existingProject = projects[projectIndex];
    const updatedProject = {
      ...existingProject,
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate || null,
      status: body.status,
      type: body.type,
      technologies: body.technologies || [],
      teamSize: body.teamSize,
      media: body.media || [],
      updatedAt: new Date().toISOString(),
    };

    // 기간 계산
    if (updatedProject.startDate) {
      const startDate = new Date(updatedProject.startDate);
      if (updatedProject.endDate) {
        const endDate = new Date(updatedProject.endDate);
        updatedProject.period = `${startDate.getFullYear()}.${String(
          startDate.getMonth() + 1
        ).padStart(2, "0")} - ${endDate.getFullYear()}.${String(
          endDate.getMonth() + 1
        ).padStart(2, "0")}`;
      } else {
        updatedProject.period = `${startDate.getFullYear()}.${String(
          startDate.getMonth() + 1
        ).padStart(2, "0")} - 현재`;
      }
    }

    // 프로젝트 업데이트
    projects[projectIndex] = updatedProject;

    // 파일에 저장
    await fs.writeFile(dataFilePath, JSON.stringify(projects, null, 2));

    return NextResponse.json({
      message: "프로젝트가 성공적으로 수정되었습니다.",
      project: updatedProject,
    });
  } catch (error) {
    console.error("프로젝트 수정 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

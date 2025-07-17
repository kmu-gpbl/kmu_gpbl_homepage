import { NextRequest, NextResponse } from "next/server";
import {
  projectsApi,
  projectMembersApi,
  projectMediaApi,
} from "@/lib/supabase-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // 프로젝트 정보 조회
    const project = await projectsApi.getById(projectId);

    // 프로젝트 멤버 정보 조회
    const members = await projectMembersApi.getProjectMembers(projectId);

    // 프로젝트 미디어 정보 조회
    const media = await projectMediaApi.getByProjectId(projectId);

    // 필드명 매핑 (Supabase -> 클라이언트)
    const mappedProject = {
      ...project,
      startDate: project.start_date,
      endDate: project.end_date,
      teamSize: project.team_size,
      memberIds: members.map((member: any) => member.id),
      media: media,
    };

    // 프로젝트와 멤버 정보 결합
    const projectWithMembers = {
      ...mappedProject,
      members: members.map((member: any) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        specialties: member.specialties,
      })),
    };

    return NextResponse.json({
      project: projectWithMembers,
      message: "프로젝트 정보를 성공적으로 불러왔습니다.",
    });
  } catch (error) {
    console.error("프로젝트 정보 로딩 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

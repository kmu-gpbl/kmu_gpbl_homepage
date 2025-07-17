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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();

    // 필드명 매핑 (클라이언트 -> Supabase)
    const {
      title,
      description,
      status,
      startDate,
      endDate,
      teamSize,
      memberIds,
      media,
      ...otherFields
    } = body;

    const projectData = {
      ...otherFields,
      title,
      description,
      status,
      start_date: startDate,
      end_date: endDate,
      team_size: teamSize,
    };

    // 프로젝트 정보 업데이트
    const updatedProject = await projectsApi.update(projectId, projectData);

    // 프로젝트 멤버 업데이트
    if (memberIds) {
      await projectMembersApi.updateProjectMembers(projectId, memberIds);
    }

    // 프로젝트 미디어 업데이트
    if (media) {
      await projectMediaApi.updateProjectMedia(projectId, media);
    }

    // 업데이트된 전체 프로젝트 정보 반환
    const project = await projectsApi.getById(projectId);
    const members = await projectMembersApi.getProjectMembers(projectId);
    const updatedMedia = await projectMediaApi.getByProjectId(projectId);

    const mappedProject = {
      ...project,
      startDate: project.start_date,
      endDate: project.end_date,
      teamSize: project.team_size,
      memberIds: members.map((member: any) => member.id),
      media: updatedMedia,
      members: members.map((member: any) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        specialties: member.specialties,
      })),
    };

    return NextResponse.json({
      project: mappedProject,
      message: "프로젝트가 성공적으로 수정되었습니다.",
    });
  } catch (error) {
    console.error("프로젝트 수정 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // 프로젝트 관련 데이터 삭제 (관련된 멤버, 미디어도 함께)
    await projectMembersApi.deleteProjectMembers(projectId);
    await projectMediaApi.deleteByProjectId(projectId);
    await projectsApi.delete(projectId);

    return NextResponse.json({
      message: "프로젝트가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("프로젝트 삭제 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

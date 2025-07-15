import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const projectsFilePath = path.join(process.cwd(), "data", "projects.json");
const usersFilePath = path.join(process.cwd(), "data", "users.json");

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // 프로젝트 데이터 읽기
    const projectsData = await fs.readFile(projectsFilePath, "utf-8");
    const projectsJson = JSON.parse(projectsData);
    const projects = Array.isArray(projectsJson.projects)
      ? projectsJson.projects
      : [];

    // 프로젝트 찾기
    const project = projects.find((p: any) => p.id === projectId);

    if (!project) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 사용자 데이터 읽기
    const usersData = await fs.readFile(usersFilePath, "utf-8");
    const usersJson = JSON.parse(usersData);
    const users = Array.isArray(usersJson.users) ? usersJson.users : [];

    // 프로젝트 멤버 정보 추가
    const projectWithMembers = {
      ...project,
      members: project.memberIds
        ? users
            .filter((user: any) => project.memberIds.includes(user.id))
            .map((user: any) => ({
              id: user.id,
              name: user.name,
              role: user.role,
              avatar: user.avatar,
              specialties: user.specialties,
            }))
        : [],
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

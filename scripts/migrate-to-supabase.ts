import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// 환경 변수 로드
dotenv.config({ path: ".env.local" });

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("환경 변수가 설정되지 않았습니다.");
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요."
  );
  console.error("현재 환경 변수:");
  console.error("URL:", supabaseUrl ? "설정됨" : "설정되지 않음");
  console.error("KEY:", supabaseAnonKey ? "설정됨" : "설정되지 않음");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// JSON 파일 읽기
const usersData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data", "users.json"), "utf-8")
);
const projectsData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data", "projects.json"), "utf-8")
);

async function migrateUsers() {
  console.log("사용자 데이터 마이그레이션 시작...");

  for (const user of usersData.users) {
    try {
      const { error } = await supabase.from("users").insert({
        id: user.id,
        name: user.name,
        role: user.role,
        specialties: user.specialties || [],
        bio: user.bio,
        avatar: user.avatar,
        github: user.github,
        linkedin: user.linkedin,
        portfolio: user.portfolio,
        email: user.email,
        skills: user.skills || [],
        experience: user.experience,
        location: user.location,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      });

      if (error) {
        console.error(`사용자 ${user.name} 마이그레이션 실패:`, error);
      } else {
        console.log(`사용자 ${user.name} 마이그레이션 완료`);
      }
    } catch (error) {
      console.error(`사용자 ${user.name} 마이그레이션 중 오류:`, error);
    }
  }

  console.log("사용자 데이터 마이그레이션 완료");
}

async function migrateProjects() {
  console.log("프로젝트 데이터 마이그레이션 시작...");

  for (const project of projectsData.projects) {
    try {
      // 프로젝트 데이터 삽입
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          id: project.id,
          title: project.title,
          description: project.description,
          start_date: project.startDate,
          end_date: project.endDate,
          period: project.period,
          status: project.status,
          type: project.type,
          technologies: project.technologies || [],
          team_size: project.teamSize || 1,
          created_at: project.createdAt,
          updated_at: project.updatedAt,
        })
        .select();

      if (projectError) {
        console.error(
          `프로젝트 ${project.title} 마이그레이션 실패:`,
          projectError
        );
        continue;
      }

      console.log(`프로젝트 ${project.title} 마이그레이션 완료`);

      // 프로젝트 멤버 관계 삽입
      if (project.memberIds && project.memberIds.length > 0) {
        for (const memberId of project.memberIds) {
          const { error: memberError } = await supabase
            .from("project_members")
            .insert({
              project_id: project.id,
              user_id: memberId,
            });

          if (memberError) {
            console.error(`프로젝트 멤버 관계 마이그레이션 실패:`, memberError);
          }
        }
      }

      // 프로젝트 미디어 삽입
      if (project.media && project.media.length > 0) {
        for (const media of project.media) {
          const { error: mediaError } = await supabase
            .from("project_media")
            .insert({
              id: media.id,
              project_id: project.id,
              type: media.type,
              title: media.title,
              url: media.url,
              description: media.description,
              file_name: media.fileName,
              original_name: media.originalName,
              created_at: project.createdAt,
            });

          if (mediaError) {
            console.error(`프로젝트 미디어 마이그레이션 실패:`, mediaError);
          }
        }
      }
    } catch (error) {
      console.error(`프로젝트 ${project.title} 마이그레이션 중 오류:`, error);
    }
  }

  console.log("프로젝트 데이터 마이그레이션 완료");
}

async function main() {
  console.log("Supabase 마이그레이션 시작...");
  console.log("Supabase URL:", supabaseUrl);
  console.log("Supabase Key:", supabaseAnonKey ? "설정됨" : "설정되지 않음");

  try {
    await migrateUsers();
    await migrateProjects();

    console.log("모든 마이그레이션이 완료되었습니다!");
  } catch (error) {
    console.error("마이그레이션 중 오류 발생:", error);
    process.exit(1);
  }
}

main();

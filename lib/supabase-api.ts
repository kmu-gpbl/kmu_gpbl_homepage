import { supabase } from "./supabase";
import type { Database } from "./supabase";

type User = Database["public"]["Tables"]["users"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectMember = Database["public"]["Tables"]["project_members"]["Row"];
type ProjectMedia = Database["public"]["Tables"]["project_media"]["Row"];

// Users API
export const usersApi = {
  // 모든 사용자 조회
  async getAll() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  // 특정 사용자 조회
  async getById(id: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // 사용자 생성
  async create(userData: Omit<User, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("users")
      .insert({
        ...userData,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 사용자 수정
  async update(
    id: string,
    userData: Partial<Omit<User, "id" | "created_at" | "updated_at">>
  ) {
    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 사용자 삭제
  async delete(id: string) {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) throw error;
  },
};

// Projects API
export const projectsApi = {
  // 모든 프로젝트 조회
  async getAll() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  // 특정 프로젝트 조회
  async getById(id: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // 특정 멤버의 프로젝트 조회
  async getByMemberId(memberId: string) {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        project_members!inner(user_id)
      `
      )
      .eq("project_members.user_id", memberId)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  // 프로젝트 생성
  async create(projectData: Omit<Project, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        ...projectData,
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 프로젝트 수정
  async update(
    id: string,
    projectData: Partial<Omit<Project, "id" | "created_at" | "updated_at">>
  ) {
    const { data, error } = await supabase
      .from("projects")
      .update(projectData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 프로젝트 삭제
  async delete(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;
  },
};

// Project Members API
export const projectMembersApi = {
  // 프로젝트 멤버 추가
  async addMember(projectId: string, userId: string) {
    const { error } = await supabase.from("project_members").insert({
      project_id: projectId,
      user_id: userId,
    });

    if (error) throw error;
  },

  // 프로젝트 멤버 제거
  async removeMember(projectId: string, userId: string) {
    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  // 프로젝트의 모든 멤버 조회
  async getProjectMembers(projectId: string) {
    const { data, error } = await supabase
      .from("project_members")
      .select(
        `
        user_id,
        users!inner(*)
      `
      )
      .eq("project_id", projectId);

    if (error) throw error;
    return data.map((item) => item.users);
  },

  // 프로젝트 멤버 전체 업데이트 (기존 멤버 삭제 후 새로 추가)
  async updateProjectMembers(projectId: string, userIds: string[]) {
    // 기존 멤버 삭제
    await this.deleteProjectMembers(projectId);

    // 새 멤버 추가
    if (userIds.length > 0) {
      const { error } = await supabase.from("project_members").insert(
        userIds.map((userId) => ({
          project_id: projectId,
          user_id: userId,
        }))
      );

      if (error) throw error;
    }
  },

  // 프로젝트의 모든 멤버 삭제
  async deleteProjectMembers(projectId: string) {
    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", projectId);

    if (error) throw error;
  },
};

// Project Media API
export const projectMediaApi = {
  // 프로젝트의 모든 미디어 조회
  async getByProjectId(projectId: string) {
    const { data, error } = await supabase
      .from("project_media")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // 미디어 추가
  async create(mediaData: Omit<ProjectMedia, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("project_media")
      .insert({
        ...mediaData,
        id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 미디어 수정
  async update(
    id: string,
    mediaData: Partial<Omit<ProjectMedia, "id" | "created_at">>
  ) {
    const { data, error } = await supabase
      .from("project_media")
      .update(mediaData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 미디어 삭제
  async delete(id: string) {
    const { error } = await supabase
      .from("project_media")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // 프로젝트 미디어 전체 업데이트 (기존 미디어 삭제 후 새로 추가)
  async updateProjectMedia(projectId: string, mediaItems: any[]) {
    // 기존 미디어 삭제
    await this.deleteByProjectId(projectId);

    // 새 미디어 추가
    if (mediaItems.length > 0) {
      const { error } = await supabase.from("project_media").insert(
        mediaItems.map((media) => ({
          id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          project_id: projectId,
          type: media.type,
          title: media.title,
          url: media.url,
          description: media.description,
        }))
      );

      if (error) throw error;
    }
  },

  // 프로젝트의 모든 미디어 삭제
  async deleteByProjectId(projectId: string) {
    const { error } = await supabase
      .from("project_media")
      .delete()
      .eq("project_id", projectId);

    if (error) throw error;
  },
};

// 통합 API (기존 API와 호환)
export const api = {
  users: usersApi,
  projects: projectsApi,
  projectMembers: projectMembersApi,
  projectMedia: projectMediaApi,
};

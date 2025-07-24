import { supabase } from "./supabase";
import type { Database } from "./supabase";

type User = Database["public"]["Tables"]["users"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectMedia = Database["public"]["Tables"]["project_media"]["Row"];

// Users API
export const usersApi = {
  // Get all users
  async getAll() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Ensure certifications field exists and is an array for all users, and map resume fields
    return data.map((user) => ({
      ...user,
      certifications: user.certifications || [],
      badges: user.badges || [],
      resumeUrl: user.resume_url,
      resumeFileName: user.resume_file_name,
    }));
  },

  // Get user by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Ensure certifications field exists and is an array, and map resume fields
    return {
      ...data,
      certifications: data.certifications || [],
      badges: data.badges || [],
      resumeUrl: data.resume_url,
      resumeFileName: data.resume_file_name,
    };
  },

  // Create user
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

  // Update user
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

  // Delete user
  async delete(id: string) {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) throw error;
  },
};

// Projects API
export const projectsApi = {
  // Get all projects
  async getAll() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get project by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get projects by member ID
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

  // Create project
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

  // Update project
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

  // Delete project
  async delete(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;
  },
};

// Project Members API
export const projectMembersApi = {
  // Add project member
  async addMember(projectId: string, userId: string) {
    const { error } = await supabase.from("project_members").insert({
      project_id: projectId,
      user_id: userId,
    });

    if (error) throw error;
  },

  // Remove project member
  async removeMember(projectId: string, userId: string) {
    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  // Get all project members
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

  // Update all project members (delete existing and add new)
  async updateProjectMembers(projectId: string, userIds: string[]) {
    // Delete existing members
    await this.deleteProjectMembers(projectId);

    // Add new members
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

  // Delete all project members
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
  // Get all media for a project
  async getByProjectId(projectId: string) {
    const { data, error } = await supabase
      .from("project_media")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add media
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

  // Update media
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

  // Delete media
  async delete(id: string) {
    const { error } = await supabase
      .from("project_media")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Update all project media (delete existing and add new)
  async updateProjectMedia(projectId: string, mediaItems: any[]) {
    // Delete existing media
    await this.deleteByProjectId(projectId);

    // Add new media
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

  // Delete all media for a project
  async deleteByProjectId(projectId: string) {
    const { error } = await supabase
      .from("project_media")
      .delete()
      .eq("project_id", projectId);

    if (error) throw error;
  },
};

// Unified API (compatible with existing API)
export const api = {
  users: usersApi,
  projects: projectsApi,
  projectMembers: projectMembersApi,
  projectMedia: projectMediaApi,
};

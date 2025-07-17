import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database type definitions
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          role: string;
          specialties: string[];
          bio: string;
          avatar: string | null;
          github: string | null;
          linkedin: string | null;
          portfolio: string | null;
          email: string | null;
          skills: string[];
          experience: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          specialties?: string[];
          bio: string;
          avatar?: string | null;
          github?: string | null;
          linkedin?: string | null;
          portfolio?: string | null;
          email?: string | null;
          skills?: string[];
          experience?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          specialties?: string[];
          bio?: string;
          avatar?: string | null;
          github?: string | null;
          linkedin?: string | null;
          portfolio?: string | null;
          email?: string | null;
          skills?: string[];
          experience?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string | null;
          period: string | null;
          status: string;
          type: string;
          technologies: string[];
          team_size: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          start_date: string;
          end_date?: string | null;
          period?: string | null;
          status: string;
          type: string;
          technologies?: string[];
          team_size: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string | null;
          period?: string | null;
          status?: string;
          type?: string;
          technologies?: string[];
          team_size?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_members: {
        Row: {
          project_id: string;
          user_id: string;
        };
        Insert: {
          project_id: string;
          user_id: string;
        };
        Update: {
          project_id?: string;
          user_id?: string;
        };
      };
      project_media: {
        Row: {
          id: string;
          project_id: string;
          type: string;
          title: string;
          url: string | null;
          description: string | null;
          file_name: string | null;
          original_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: string;
          title: string;
          url?: string | null;
          description?: string | null;
          file_name?: string | null;
          original_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: string;
          title?: string;
          url?: string | null;
          description?: string | null;
          file_name?: string | null;
          original_name?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

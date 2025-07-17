"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ProjectTimeline } from "@/components/project-timeline";
import { PageHeader } from "@/components/page-header";
import { AddProjectForm } from "@/components/add-project-form";
import { EditProfileHeader } from "@/components/edit-profile-header";
import { EditContactInfo } from "@/components/edit-contact-info";
import { EditSkills } from "@/components/edit-skills";
import { MapPin, Mail, Github, Linkedin, ExternalLink } from "lucide-react";

interface MemberPageProps {
  params: Promise<{ id: string }>;
}

const specialtyColors = {
  frontend: "bg-pink-500",
  backend: "bg-blue-500",
  mobile: "bg-green-500",
  ai: "bg-orange-500",
  devops: "bg-indigo-500",
};

export default function MemberPage({ params }: MemberPageProps) {
  const [member, setMember] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params;
        setMemberId(id);

        // 멤버 정보와 프로젝트 정보를 병렬로 로드
        const [userResponse, projectsResponse] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch(`/api/projects?memberId=${id}`),
        ]);

        if (!userResponse.ok) {
          notFound();
        }

        const userData = await userResponse.json();
        const projectsData = await projectsResponse.json();

        setMember(userData.user);
        setProjects(projectsData.projects || []);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  const handleProjectAdded = async () => {
    // 프로젝트가 추가되면 프로젝트 목록을 새로고침
    try {
      const response = await fetch(`/api/projects?memberId=${memberId}`);
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("프로젝트 목록 새로고침 실패:", error);
    }
  };

  const handleMemberUpdated = async () => {
    // 멤버 정보가 업데이트되면 멤버 정보를 새로고침
    try {
      const response = await fetch(`/api/users/${memberId}`);
      if (response.ok) {
        const data = await response.json();
        setMember(data.user);
      }
    } catch (error) {
      console.error("멤버 정보 새로고침 실패:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title={member.name} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Member Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Header */}
              <EditProfileHeader
                memberId={memberId}
                initialData={{
                  name: member.name,
                  role: member.role,
                  avatar: member.avatar,
                  bio: member.bio,
                }}
                onProfileUpdated={handleMemberUpdated}
              />

              {/* Contact Info */}
              <EditContactInfo
                memberId={memberId}
                initialData={{
                  email: member.email,
                  github: member.github,
                  linkedin: member.linkedin,
                  portfolio: member.portfolio,
                }}
                onContactUpdated={handleMemberUpdated}
              />

              {/* Skills */}
              <EditSkills
                memberId={memberId}
                initialData={{
                  skills: member.skills || [],
                  specialties: member.specialties || [],
                }}
                onSkillsUpdated={handleMemberUpdated}
              />
            </div>

            {/* Right Column - Projects */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add Project Form */}
              <AddProjectForm
                memberId={memberId}
                onProjectAdded={handleProjectAdded}
              />

              {/* Project Timeline */}
              <ProjectTimeline
                projects={projects}
                onProjectDeleted={handleProjectAdded}
                onProjectUpdated={handleProjectAdded}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

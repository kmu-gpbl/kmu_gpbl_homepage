"use client";

import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { getProjectWithMembersById } from "@/lib/api/projects";
import { PageHeader } from "@/components/page-header";
import { ProjectMediaManager } from "@/components/project-media-manager";
import { Tag, ExternalLink, Calendar, Activity, User } from "lucide-react";
import type { ProjectWithMembers } from "@/types/api";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

const typeColors = {
  web: "bg-blue-500",
  mobile: "bg-green-500",
  ai: "bg-orange-500",
  infrastructure: "bg-purple-500",
  other: "bg-gray-500",
};

const typeIcons = {
  web: "🌐",
  mobile: "📱",
  ai: "🤖",
  infrastructure: "🏗️",
  other: "⚙️",
};

const statusColors = {
  completed: "bg-green-500",
  ongoing: "bg-yellow-500",
  planned: "bg-gray-400",
};

const statusLabels = {
  completed: "완료",
  ongoing: "진행중",
  planned: "계획",
};

export default function ProjectPage({ params }: ProjectPageProps) {
  const [project, setProject] = useState<ProjectWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        const { id } = await params;
        setProjectId(id);

        const projectResponse = await getProjectWithMembersById(id);

        if (projectResponse.status === 404 || !projectResponse.data) {
          notFound();
        }

        setProject(projectResponse.data);
      } catch (error) {
        console.error("프로젝트 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [params]);

  const handleMediaUpdated = async () => {
    // 미디어가 업데이트되면 프로젝트 정보를 새로고침
    try {
      const projectResponse = await getProjectWithMembersById(projectId);
      if (projectResponse.data) {
        setProject(projectResponse.data);
      }
    } catch (error) {
      console.error("프로젝트 정보 새로고침 실패:", error);
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

  if (!project) {
    return notFound();
  }

  const colorClass = typeColors[project.type];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader showBackButton={true} showHomeButton={true} />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Project Header */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className={`${colorClass} h-4 w-full`} />

            <div className="p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="text-6xl">{typeIcons[project.type]}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                        {project.title}
                      </h1>
                      <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
                        {project.period}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-bold text-white ${
                        statusColors[project.status]
                      }`}
                    >
                      {statusLabels[project.status]}
                    </div>
                  </div>

                  {/* Project Type */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg">
                    <Tag className="w-4 h-4" />
                    {project.type.charAt(0).toUpperCase() +
                      project.type.slice(1)}{" "}
                    프로젝트
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                프로젝트 설명
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                {project.description}
              </p>
            </div>
          </div>

          {/* Project Media Manager */}
          <ProjectMediaManager
            projectId={projectId}
            media={project.media || []}
            onMediaUpdated={handleMediaUpdated}
          />

          {/* Technologies Used */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                사용된 기술
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {project.technologies.map((tech, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                프로젝트 정보
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      기간
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {project.period}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      상태
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {statusLabels[project.status]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          {project.members && project.members.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  팀 멤버
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

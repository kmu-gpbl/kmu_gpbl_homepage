"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/types/api";
import { Users, Trash2, AlertTriangle } from "lucide-react";

interface ProjectTimelineProps {
  projects: Project[];
  onProjectDeleted?: () => void;
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

export function ProjectTimelineComponent({
  projects,
  onProjectDeleted,
}: ProjectTimelineProps) {
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setDeletingProjectId(projectToDelete.id);

    try {
      const response = await fetch(`/api/projects?id=${projectToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 삭제 성공 시 콜백 호출
        if (onProjectDeleted) {
          onProjectDeleted();
        }
      } else {
        const error = await response.json();
        console.error("프로젝트 삭제 실패:", error);
        alert("프로젝트 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("프로젝트 삭제 중 오류:", error);
      alert("프로젝트 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingProjectId(null);
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  return (
    <div className="relative">
      {/* Timeline Start */}
      <div className="relative flex items-center mb-8" />

      {/* Timeline Line */}
      <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600">
        <div
          className="w-full bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
          style={{
            height: "100%",
          }}
        />
      </div>

      {/* Timeline Items */}
      <div className="space-y-8">
        {sortedProjects.map((project, index) => (
          <div key={project.id} className="relative flex items-start">
            {/* Timeline Dot */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={`w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 ${
                  typeColors[project.type]
                } transition-all duration-200 hover:scale-110`}
              />
              {/* Simple indicator for Ongoing Projects */}
              {project.status === "ongoing" && (
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-yellow-400 opacity-50" />
              )}
            </div>

            {/* Project Card */}
            <Link
              href={`/project/${project.id}`}
              className={`ml-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-gray-900 dark:hover:border-white transition-all duration-200 hover:scale-[1.02] group cursor-pointer block w-full`}
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">
                    {typeIcons[project.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {project.period}
                    </p>
                    {project.teamSize && (
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {project.teamSize}명
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Badge */}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold text-white flex-shrink-0 ${
                      statusColors[project.status]
                    }`}
                  >
                    {statusLabels[project.status]}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteClick(project);
                    }}
                    disabled={deletingProjectId === project.id}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="프로젝트 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Project Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Simple hover effect */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-200 rounded-b-xl" />
            </Link>

            {/* Connection Line to Next Item */}
            {index < sortedProjects.length - 1 && (
              <div className="absolute left-8 top-8 w-0.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500" />
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                프로젝트 삭제
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>"{projectToDelete.title}"</strong> 프로젝트를
              삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingProjectId === projectToDelete.id}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {deletingProjectId === projectToDelete.id
                  ? "삭제 중..."
                  : "삭제"}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={deletingProjectId === projectToDelete.id}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ProjectTimelineComponent as ProjectTimeline };

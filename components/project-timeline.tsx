"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import type { Project, ProjectMedia } from "@/types/api";
import {
  Users,
  Trash2,
  AlertTriangle,
  Edit,
  Plus,
  X,
  Calendar,
  Tag,
  Activity,
  Play,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Upload,
  File,
} from "lucide-react";

interface ProjectTimelineProps {
  projects: Project[];
  onProjectDeleted?: () => void;
  onProjectUpdated?: () => void;
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
  completed: "Completed",
  ongoing: "Ongoing",
  planned: "Planned",
};

const mediaTypes = [
  { value: "video", label: "Project Video", icon: Play },
  { value: "presentation", label: "Presentation", icon: FileText },
  { value: "url", label: "Related Link", icon: LinkIcon },
  { value: "image", label: "Image", icon: File },
];

export function ProjectTimeline({
  projects,
  onProjectDeleted,
  onProjectUpdated,
}: ProjectTimelineProps) {
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // 프로젝트 수정 상태
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: "completed" | "ongoing" | "planned";
    type: "web" | "mobile" | "ai" | "infrastructure" | "other";
    technologies: string[];
    teamSize: number;
    media: ProjectMedia[];
  }>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "ongoing",
    type: "web",
    technologies: [],
    teamSize: 1,
    media: [],
  });
  const [newTech, setNewTech] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 미디어 추가 상태
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [mediaFormData, setMediaFormData] = useState({
    type: "video" as "video" | "presentation" | "url" | "image",
    title: "",
    url: "",
    description: "",
    fileName: "",
    originalName: "",
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleEditClick = (project: Project) => {
    setEditingProjectId(project.id);
    setEditFormData({
      title: project.title,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate || "",
      status: project.status,
      type: project.type,
      technologies: [...project.technologies],
      teamSize: project.teamSize || 1,
      media: [...(project.media || [])],
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/projects/${editingProjectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("프로젝트가 성공적으로 수정되었습니다!");
        setEditingProjectId(null);
        if (onProjectUpdated) {
          onProjectUpdated();
        }
      } else {
        setMessage({
          type: "error",
          text: result.error || "프로젝트 수정에 실패했습니다.",
        });
      }
    } catch (error) {
      console.error("프로젝트 수정 실패:", error);
      setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTech = () => {
    if (newTech.trim() && !editFormData.technologies.includes(newTech.trim())) {
      setEditFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()],
      }));
      setNewTech("");
    }
  };

  const removeTech = (tech: string) => {
    setEditFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  const addMedia = () => {
    if (
      mediaFormData.title &&
      (mediaFormData.url || mediaFormData.type === "image")
    ) {
      const newMedia: ProjectMedia = {
        id: `temp-${Date.now()}`, // 임시 ID
        type: mediaFormData.type,
        title: mediaFormData.title,
        url: mediaFormData.url,
        description: mediaFormData.description,
        fileName:
          mediaFormData.type === "image" ? mediaFormData.fileName : undefined,
        originalName:
          mediaFormData.type === "image"
            ? mediaFormData.originalName
            : undefined,
      };

      setEditFormData((prev) => ({
        ...prev,
        media: [...prev.media, newMedia],
      }));
      setMediaFormData({
        type: "video",
        title: "",
        url: "",
        description: "",
        fileName: "",
        originalName: "",
      });
      setIsAddingMedia(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMediaFormData((prev) => ({
          ...prev,
          url: result.url,
          fileName: result.fileName,
          originalName: result.originalName,
        }));
      } else {
        alert(result.error || "파일 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const removeMedia = (index: number) => {
    setEditFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
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
            <div className="ml-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-gray-900 dark:hover:border-white transition-all duration-200 hover:scale-[1.02] group w-full">
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

                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditClick(project)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    title="프로젝트 수정"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(project)}
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

              {/* Project Link */}
              <div className="mt-4">
                <Link
                  href={`/project/${project.id}`}
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                >
                  프로젝트 상세 보기
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Simple hover effect */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-200 rounded-b-xl" />
            </div>

            {/* Connection Line to Next Item */}
            {index < sortedProjects.length - 1 && (
              <div className="absolute left-8 top-8 w-0.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500" />
            )}
          </div>
        ))}
      </div>

      {/* Project Edit Modal */}
      {editingProjectId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                프로젝트 수정
              </h3>
              <button
                onClick={() => setEditingProjectId(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {message && (
              <div
                className={`p-4 mb-4 rounded-lg ${
                  message.type === "error"
                    ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500"
                    : "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500"
                }`}
              >
                <span
                  className={`font-medium ${
                    message.type === "error"
                      ? "text-red-800 dark:text-red-200"
                      : "text-green-800 dark:text-green-200"
                  }`}
                >
                  {message.text}
                </span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    프로젝트 제목 *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="프로젝트 제목을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    프로젝트 타입 *
                  </label>
                  <select
                    required
                    value={editFormData.type}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        type: e.target.value as
                          | "web"
                          | "mobile"
                          | "ai"
                          | "infrastructure"
                          | "other",
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="web">웹 개발</option>
                    <option value="mobile">모바일 앱</option>
                    <option value="ai">AI/ML</option>
                    <option value="infrastructure">인프라/DevOps</option>
                    <option value="other">기타</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  프로젝트 설명 *
                </label>
                <textarea
                  required
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    시작일 *
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.startDate}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={editFormData.endDate}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status and Team Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    프로젝트 상태 *
                  </label>
                  <select
                    required
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        status: e.target.value as
                          | "completed"
                          | "ongoing"
                          | "planned",
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="planned">계획</option>
                    <option value="ongoing">진행중</option>
                    <option value="completed">완료</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    팀 크기 *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editFormData.teamSize}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        teamSize: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="팀원 수"
                  />
                </div>
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  사용 기술
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTech())
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="기술 스택 추가"
                  />
                  <button
                    type="button"
                    onClick={addTech}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editFormData.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Media */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  미디어 추가
                </label>
                <div className="flex gap-2 mb-3">
                  <select
                    value={mediaFormData.type}
                    onChange={(e) =>
                      setMediaFormData((prev) => ({
                        ...prev,
                        type: e.target.value as
                          | "video"
                          | "presentation"
                          | "url"
                          | "image",
                      }))
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {mediaTypes.map((mediaType) => (
                      <option key={mediaType.value} value={mediaType.value}>
                        {mediaType.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingMedia(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    추가
                  </button>
                </div>
                {isAddingMedia && (
                  <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={mediaFormData.title}
                        onChange={(e) =>
                          setMediaFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="미디어 제목"
                      />
                      {mediaFormData.type === "image" ? (
                        <div className="flex gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,video/*"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingFile}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                          >
                            {uploadingFile ? (
                              <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                업로드 중...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                파일 선택
                              </span>
                            )}
                          </button>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={mediaFormData.url}
                          onChange={(e) =>
                            setMediaFormData((prev) => ({
                              ...prev,
                              url: e.target.value,
                            }))
                          }
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="미디어 URL"
                        />
                      )}
                    </div>
                    <textarea
                      value={mediaFormData.description}
                      onChange={(e) =>
                        setMediaFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="미디어 설명 (선택 사항)"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addMedia}
                        disabled={
                          !mediaFormData.title ||
                          (!mediaFormData.url && mediaFormData.type !== "image")
                        }
                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                      >
                        미디어 추가
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingMedia(false);
                          setMediaFormData({
                            type: "video",
                            title: "",
                            url: "",
                            description: "",
                            fileName: "",
                            originalName: "",
                          });
                        }}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  {editFormData.media.map((media, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      <span>{media.title}</span>
                      {media.type === "image" ? (
                        <span className="text-xs text-gray-500">(파일)</span>
                      ) : (
                        <a
                          href={media.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-500"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? "수정 중..." : "프로젝트 수정"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProjectId(null)}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

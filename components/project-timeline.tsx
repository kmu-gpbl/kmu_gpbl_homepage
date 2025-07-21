"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useEditMode } from "@/contexts/edit-mode-context";

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
  desktop: "bg-indigo-500",
  other: "bg-gray-500",
};

const typeIcons = {
  web: "🌐",
  mobile: "📱",
  ai: "🤖",
  infrastructure: "🏗️",
  desktop: "🖥️",
  other: "⚙️",
};

const statusColors = {
  completed: "bg-green-500",
  ongoing: "bg-yellow-500",
  planned: "bg-gray-400",
  live: "bg-red-500 animate-pulse",
};

const statusColorsForDots = {
  completed: "bg-green-500",
  ongoing: "bg-yellow-500",
  planned: "bg-gray-400",
  live: "bg-red-500",
};

const statusLabels = {
  completed: "Completed",
  ongoing: "Ongoing",
  planned: "Planned",
  live: "⚪ Live",
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
  const { isEditMode } = useEditMode();
  const router = useRouter();
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Project editing state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: "completed" | "ongoing" | "planned" | "live";
    type: "web" | "mobile" | "ai" | "infrastructure" | "desktop" | "other";
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

  // Media addition state
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
        console.error("Failed to delete project:", error);
        alert("Failed to delete project.");
      }
    } catch (error) {
      console.error("Error occurred while deleting project:", error);
      alert("An error occurred while deleting project.");
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
      // Clean up endDate before sending
      const submitData = {
        ...editFormData,
        endDate:
          editFormData.endDate && editFormData.endDate.trim() !== ""
            ? editFormData.endDate
            : null,
      };

      const response = await fetch(`/api/projects/${editingProjectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Project updated successfully!");
        setEditingProjectId(null);
        if (onProjectUpdated) {
          onProjectUpdated();
        }
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update project.",
        });
      }
    } catch (error) {
      console.error("Failed to update project:", error);
      setMessage({ type: "error", text: "A network error occurred." });
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
        id: `temp-${Date.now()}`, // Temporary ID
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
        alert(result.error || "Failed to upload file.");
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
      alert("An error occurred while uploading file.");
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
                  statusColorsForDots[project.status]
                } transition-all duration-200 hover:scale-110`}
              />
            </div>

            {/* Project Card */}
            <div
              className="ml-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-gray-900 dark:hover:border-white transition-all duration-200 hover:scale-[1.02] group w-full cursor-pointer"
              onClick={() => router.push(`/project/${project.id}`)}
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
                          {project.teamSize} members
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

                  {/* Edit/Delete Buttons - Only show in edit mode */}
                  {isEditMode && (
                    <>
                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(project);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Edit Project"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(project);
                        }}
                        disabled={deletingProjectId === project.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Project Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3 whitespace-pre-line">
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
                Edit Project
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
                    Project Title *
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
                    placeholder="Enter project title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Type *
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
                          | "desktop"
                          | "other",
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile App</option>
                    <option value="ai">AI/ML</option>
                    <option value="infrastructure">
                      Infrastructure/DevOps
                    </option>
                    <option value="desktop">Desktop Application</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Description *
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
                  placeholder="Enter detailed description of the project"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date *
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
                    End Date (Optional)
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
                    placeholder="Leave empty for ongoing projects"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty for ongoing projects
                  </p>
                </div>
              </div>

              {/* Status and Team Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Status *
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
                          | "planned"
                          | "live",
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="planned">Planned</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="live">⚪ Live</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Size *
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
                    placeholder="Number of team members"
                  />
                </div>
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Technologies Used
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
                    placeholder="Add technology stack"
                  />
                  <button
                    type="button"
                    onClick={addTech}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Add
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
                  Add Media
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
                    Add
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
                        placeholder="Media title"
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
                                Uploading...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Choose File
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
                          placeholder="Media URL"
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
                      placeholder="Media description (optional)"
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
                        Add Media
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
                        Cancel
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
                        <span className="text-xs text-gray-500">(File)</span>
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
                  {isSubmitting ? "Updating..." : "Update Project"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProjectId(null)}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                >
                  Cancel
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
                Delete Project
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the project{" "}
              <strong>"{projectToDelete.title}"</strong>?
              <br />
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingProjectId === projectToDelete.id}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {deletingProjectId === projectToDelete.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={deletingProjectId === projectToDelete.id}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

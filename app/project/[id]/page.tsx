"use client";

import { notFound } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import { ProjectMediaManager } from "@/components/project-media-manager";
import { EditModeProvider, useEditMode } from "@/contexts/edit-mode-context";
import {
  Tag,
  ExternalLink,
  Calendar,
  Activity,
  User,
  Edit,
  X,
  Plus,
  File,
  FileText,
  Play,
  LinkIcon,
} from "lucide-react";
import type { ProjectWithMembers, ProjectMedia } from "@/types/api";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
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

const statusLabels = {
  completed: "Completed",
  ongoing: "Ongoing",
  planned: "Planned",
  live: "⚪ Live",
};

function ProjectPageContent({ params }: ProjectPageProps) {
  const { isEditMode } = useEditMode();
  const [project, setProject] = useState<ProjectWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>("");

  // Project editing state
  const [editingProject, setEditingProject] = useState(false);
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

  const mediaTypes = [
    { value: "video", label: "Project Video", icon: Play },
    { value: "presentation", label: "Presentation", icon: FileText },
    { value: "url", label: "Related Link", icon: LinkIcon },
    { value: "image", label: "Image", icon: File },
  ];

  useEffect(() => {
    const loadProject = async () => {
      try {
        const { id } = await params;
        setProjectId(id);

        const projectResponse = await fetch(`/api/projects/${id}`);

        if (!projectResponse.ok) {
          notFound();
        }

        const projectData = await projectResponse.json();
        setProject(projectData.project);
      } catch (error) {
        console.error("Project loading failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [params]);

  const handleMediaUpdated = async () => {
    // Refresh project info when media is updated
    try {
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProject(projectData.project);
      }
    } catch (error) {
      console.error("Failed to refresh project info:", error);
    }
  };

  const handleEditClick = () => {
    if (!project) return;
    setEditingProject(true);
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

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Project updated successfully!");
        setEditingProject(false);
        // Refresh project data
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          setProject(projectData.project);
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

  const removeMedia = (index: number) => {
    setEditFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-bold text-white ${
                          statusColors[project.status]
                        }`}
                      >
                        {statusLabels[project.status]}
                      </div>

                      {/* Edit Button - Only show in edit mode */}
                      {isEditMode && (
                        <button
                          onClick={handleEditClick}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                          title="Edit Project"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Project Type */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg">
                    <Tag className="w-4 h-4" />
                    {project.type.charAt(0).toUpperCase() +
                      project.type.slice(1)}{" "}
                    Project
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Project Description
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
                Technologies Used
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
                Project Information
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
                      Duration
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
                      Status
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
                  Team Members
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

        {/* Project Edit Modal */}
        {editingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Project
                </h3>
                <button
                  onClick={() => setEditingProject(false)}
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
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project Media
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingMedia(true)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {isAddingMedia && (
                    <div className="mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Add Media
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Media Type
                          </label>
                          <select
                            value={mediaFormData.type}
                            onChange={(e) =>
                              setMediaFormData((prev) => ({
                                ...prev,
                                type: e.target.value as any,
                              }))
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {mediaTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Media Title
                          </label>
                          <input
                            type="text"
                            value={mediaFormData.title}
                            onChange={(e) =>
                              setMediaFormData((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Media title"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        {mediaFormData.type === "image" ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Upload Image
                            </label>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingFile}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                            >
                              {uploadingFile ? (
                                <span className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Uploading...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <Plus className="w-4 h-4" />
                                  Choose File
                                </span>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Media URL
                            </label>
                            <input
                              type="text"
                              value={mediaFormData.url}
                              onChange={(e) =>
                                setMediaFormData((prev) => ({
                                  ...prev,
                                  url: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Media URL"
                            />
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description (Optional)
                        </label>
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
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={addMedia}
                          disabled={
                            !mediaFormData.title ||
                            (!mediaFormData.url &&
                              mediaFormData.type !== "image")
                          }
                          className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                        >
                          Add Media
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingMedia(false)}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
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
                    onClick={() => setEditingProject(false)}
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
      </main>
    </div>
  );
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <EditModeProvider>
      <ProjectPageContent params={params} />
    </EditModeProvider>
  );
}

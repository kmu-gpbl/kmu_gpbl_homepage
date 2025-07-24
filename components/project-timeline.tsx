"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import type { Project } from "@/types/api";
import {
  Users,
  Trash2,
  AlertTriangle,
  Edit,
  X,
  Play,
  FileText,
  Link as LinkIcon,
  File,
  Radio,
} from "lucide-react";
import { Loading } from "./ui/loading";
import { useEditMode } from "@/contexts/edit-mode-context";
import { MediaItem } from "./ui/media-editor";
import ProjectMediaSection from "./ui/project-media-section";

interface ProjectTimelineProps {
  projects: Project[];
  onProjectDeleted?: () => void;
  onProjectUpdated?: () => void;
}

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
  live: "bg-red-500",
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
  live: "Live",
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
  const [loadingProjectData, setLoadingProjectData] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: "completed" | "ongoing" | "planned" | "live";
    type: "web" | "mobile" | "ai" | "infrastructure" | "desktop" | "other";
    technologies: string[];
    teamSize: number;
    media: MediaItem[];
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

  // Media is now handled by MediaEditor component

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

  const handleEditClick = async (project: Project) => {
    // Reset form data first to prevent showing previous project data
    setEditFormData({
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

    setLoadingProjectData(true);

    try {
      // Load detailed project data including media
      const response = await fetch(`/api/projects/${project.id}`);
      if (response.ok) {
        const detailedProject = await response.json();
        setEditFormData({
          title: detailedProject.project.title,
          description: detailedProject.project.description,
          startDate: detailedProject.project.startDate,
          endDate: detailedProject.project.endDate || "",
          status: detailedProject.project.status,
          type: detailedProject.project.type,
          technologies: [...detailedProject.project.technologies],
          teamSize: detailedProject.project.teamSize || 1,
          media: (detailedProject.project.media || []).map(
            (projectMedia: any) => ({
              id: projectMedia.id,
              type: projectMedia.type,
              title: projectMedia.title,
              url: projectMedia.url,
              description: projectMedia.description,
              fileName: projectMedia.fileName,
              originalName: projectMedia.originalName,
            })
          ),
        });
        // Open modal only after data is loaded
        setEditingProjectId(project.id);
      } else {
        // Fallback to project data without media
        setEditFormData({
          title: project.title,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate || "",
          status: project.status,
          type: project.type,
          technologies: [...project.technologies],
          teamSize: project.teamSize || 1,
          media: [],
        });
        setEditingProjectId(project.id);
      }
    } catch (error) {
      console.error("Failed to load project details:", error);
      // Fallback to project data without media
      setEditFormData({
        title: project.title,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate || "",
        status: project.status,
        type: project.type,
        technologies: [...project.technologies],
        teamSize: project.teamSize || 1,
        media: [],
      });
      setEditingProjectId(project.id);
    } finally {
      setLoadingProjectData(false);
    }
  };

  const handleEditCancel = () => {
    setEditingProjectId(null);
    setMessage(null);
    // Reset form data when closing
    setEditFormData({
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

  const handleMediaChange = useCallback((media: MediaItem[]) => {
    setEditFormData((prev) => ({
      ...prev,
      media,
    }));
  }, []);

  return (
    <div className="relative">
      {/* Timeline Start */}
      <div className="relative flex items-center mb-8" />

      {/* Timeline Line */}
      <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600 rounded-full">
        <div
          className="w-full bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-1000 ease-out rounded-full"
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
              className="ml-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-gray-900 dark:hover:border-white transition-all duration-200 hover:scale-[1.02] group w-full max-w-full overflow-hidden cursor-pointer"
              onClick={() => router.push(`/project/${project.id}`)}
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                  <span className="text-2xl flex-shrink-0">
                    {typeIcons[project.type]}
                  </span>
                  <div className="min-w-0 flex-1 max-w-full">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate overflow-hidden">
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

                <div className="flex items-center gap-2 flex-shrink-0 min-w-fit">
                  {/* Status Badge */}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold text-white flex-shrink-0 flex items-center gap-1 ${
                      statusColors[project.status]
                    }`}
                  >
                    {project.status === "live" && <Radio className="w-3 h-3" />}
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
                        disabled={loadingProjectData}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit Project"
                      >
                        {loadingProjectData ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        ) : (
                          <Edit className="w-4 h-4" />
                        )}
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
                onClick={handleEditCancel}
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
                    <option value="live">Live</option>
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
                <ProjectMediaSection
                  media={editFormData.media}
                  onChange={handleMediaChange}
                  allowUpload={true}
                  maxItems={10}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? (
                    <Loading variant="button" size="sm" text="Updating..." />
                  ) : (
                    "Update Project"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleEditCancel}
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
                {deletingProjectId === projectToDelete.id ? (
                  <Loading variant="button" size="sm" text="Deleting..." />
                ) : (
                  "Delete"
                )}
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

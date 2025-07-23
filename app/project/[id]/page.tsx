"use client";

import { notFound, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { MediaGallery } from "@/components/ui/media-gallery";
import MediaEditor, { MediaItem } from "@/components/ui/media-editor";
import { Loading } from "@/components/ui/loading";
import { TechStackBadge } from "@/components/ui/tech-stack-badge";
import { TeamMemberCard } from "@/components/ui/team-member-card";
import { EditModeProvider, useEditMode } from "@/contexts/edit-mode-context";
import {
  Tag,
  ExternalLink,
  Calendar,
  Activity,
  User,
  Edit,
  X,
  File,
  FileText,
  Play,
  LinkIcon,
  Radio,
} from "lucide-react";
import type { ProjectWithMembers } from "@/types/api";
import { smartBackForProject } from "@/lib/navigation-utils";

import * as React from "react";

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
  live: "bg-red-500",
};

const statusLabels = {
  completed: "Completed",
  ongoing: "Ongoing",
  planned: "Planned",
  live: "Live",
};

// Memoized media section to prevent re-rendering when other form fields change
const ProjectMediaSection = React.memo(
  ({
    media,
    onChange,
  }: {
    media: MediaItem[];
    onChange: (media: MediaItem[]) => void;
  }) => (
    <MediaEditor
      media={media}
      onChange={onChange}
      allowUpload={true}
      maxItems={10}
    />
  )
);

function ProjectPageContent({ params }: ProjectPageProps) {
  const { isEditMode } = useEditMode();
  const router = useRouter();
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

  const addTech = useCallback(() => {
    if (newTech.trim() && !editFormData.technologies.includes(newTech.trim())) {
      setEditFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()],
      }));
      setNewTech("");
    }
  }, [newTech, editFormData.technologies]);

  const removeTech = useCallback((tech: string) => {
    setEditFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  }, []);

  const handleMediaChange = useCallback((media: MediaItem[]) => {
    setEditFormData((prev) => ({
      ...prev,
      media,
    }));
  }, []);

  if (loading) {
    return (
      <Loading variant="page" size="lg" text="Loading project details..." />
    );
  }

  if (!project) {
    return notFound();
  }

  const colorClass = typeColors[project.type];

  const handleBack = () => {
    smartBackForProject(router, project);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        showBackButton={true}
        showHomeButton={true}
        onBack={handleBack}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>

            {/* Hero Background Image (if available) */}
            {project.media &&
              project.media.length > 0 &&
              project.media.find((m) => m.type === "image") && (
                <div className="absolute inset-0">
                  <img
                    src={project.media.find((m) => m.type === "image")?.url}
                    alt=""
                    className="w-full h-full object-cover opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-indigo-900/80"></div>
                </div>
              )}

            <div className="relative z-10 p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                {/* Project Icon & Type */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-2xl flex items-center justify-center text-5xl md:text-6xl border border-white/40">
                      {typeIcons[project.type]}
                    </div>
                    <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-white/30 rounded-full text-xs font-medium text-white border border-white/50">
                      {project.type.toUpperCase()}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`px-6 py-3 rounded-full text-sm font-bold text-white flex items-center gap-2 ${
                      statusColors[project.status]
                    } ring-2 ring-white/50`}
                  >
                    {project.status === "live" && <Radio className="w-4 h-4" />}
                    {statusLabels[project.status]}
                  </div>
                </div>

                {/* Project Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight">
                        {project.title}
                      </h1>
                      <p className="text-xl md:text-2xl text-white/80 font-medium mb-4">
                        {project.period}
                      </p>

                      {/* Quick Stats */}
                      <div className="flex flex-wrap items-center gap-4 text-white/70">
                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full border border-white/40">
                              <Tag className="w-4 h-4" />
                              <span className="font-medium text-sm">
                                {project.technologies.length} Tech
                                {project.technologies.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        {project.members && project.members.length > 0 && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full border border-white/40">
                            <User className="w-4 h-4" />
                            <span className="font-medium text-sm">
                              {project.members.length} Member
                              {project.members.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                        {project.media && project.media.length > 0 && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full border border-white/40">
                            <ExternalLink className="w-4 h-4" />
                            <span className="font-medium text-sm">
                              {project.media.length} Media
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full border border-white/40">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium text-sm flex items-center gap-1">
                            {project.status === "live" && (
                              <Radio className="w-3 h-3" />
                            )}
                            {statusLabels[project.status]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Edit Button - Only show in edit mode */}
                    {isEditMode && (
                      <button
                        onClick={handleEditClick}
                        className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 hover:scale-105 border border-white/40"
                        title="Edit Project"
                      >
                        <Edit className="w-6 h-6 text-white" />
                      </button>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {project.media?.find((m) => m.type === "url") && (
                      <a
                        href={project.media.find((m) => m.type === "url")?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                      >
                        <ExternalLink className="w-5 h-5" />
                        View Live
                      </a>
                    )}
                    <button
                      onClick={() => {
                        // Smooth scroll to media gallery
                        const mediaSection = document.querySelector(
                          '[data-section="media-gallery"]'
                        );
                        mediaSection?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 border border-white/50"
                    >
                      <FileText className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      Explore Media
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - 2 Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-2 space-y-8">
              {/* Project Description */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Project Overview
                  </h2>
                </div>
                <div className="p-8">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Project Media Gallery */}
              <div
                data-section="media-gallery"
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <ExternalLink className="w-6 h-6 text-purple-600" />
                    Media Gallery
                    <span className="ml-auto text-sm font-normal text-gray-500 dark:text-gray-400 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      {project.media?.length || 0} items
                    </span>
                  </h2>
                </div>
                <div className="p-8">
                  <MediaGallery media={project.media || []} />
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Technologies Used */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-emerald-600" />
                    Tech Stack
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <TechStackBadge key={index} tech={tech} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-600" />
                    Project Info
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900 rounded-xl">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                      <Calendar className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Duration
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {project.period}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-xl">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Status
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                        {project.status === "live" && (
                          <Radio className="w-4 h-4" />
                        )}
                        {statusLabels[project.status]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              {project.members && project.members.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" />
                      Team Members
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {project.members.map((member, index) => (
                      <TeamMemberCard
                        key={member.id}
                        member={member}
                        index={index}
                        onClick={() => {
                          // Navigate to member profile
                          router.push(`/member/${member.id}`);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
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
                {/* Project Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter project title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your project..."
                  />
                </div>

                {/* Status and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="planned">Planned</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="live">Live</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="web">Web</option>
                      <option value="mobile">Mobile</option>
                      <option value="ai">AI</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="desktop">Desktop</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Team Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.teamSize}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        teamSize: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Technologies */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Technologies
                  </label>
                  <div className="flex gap-2">
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

                {/* Project Media */}
                <ProjectMediaSection
                  media={editFormData.media}
                  onChange={handleMediaChange}
                />

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

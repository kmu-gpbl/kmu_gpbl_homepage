"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Loading } from "./ui/loading";
import MediaEditor, { MediaItem } from "./ui/media-editor";

interface AddProjectFormProps {
  memberId: string;
  onProjectAdded: () => void;
}

interface ProjectFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "completed" | "ongoing" | "planned" | "live";
  type: "web" | "mobile" | "ai" | "infrastructure" | "desktop" | "other";
  technologies: string[];
  teamSize: number;
  media: MediaItem[];
}

// Use MediaItem from the MediaEditor component

const projectTypes = [
  { value: "web", label: "Web Development", icon: "🌐" },
  { value: "mobile", label: "Mobile App", icon: "📱" },
  { value: "ai", label: "AI/ML", icon: "🤖" },
  { value: "infrastructure", label: "Infrastructure", icon: "🏗️" },
  { value: "desktop", label: "Desktop Application", icon: "🖥️" },
  { value: "other", label: "Other", icon: "⚙️" },
];

const projectStatuses = [
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "ongoing", label: "Ongoing", color: "bg-yellow-500" },
  { value: "planned", label: "Planned", color: "bg-gray-400" },
  { value: "live", label: "⚪ Live", color: "bg-red-500 animate-pulse" },
];

// Media types now handled by MediaEditor

export function AddProjectForm({
  memberId,
  onProjectAdded,
}: AddProjectFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
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

  // Removed media addition state - now handled by MediaEditor

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Clean up endDate before sending
      const submitData = {
        ...formData,
        endDate:
          formData.endDate && formData.endDate.trim() !== ""
            ? formData.endDate
            : null,
        memberIds: [memberId],
        period: `${formData.startDate} - ${formData.endDate || "Present"}`,
      };

      console.log("Submitting project with media:", {
        mediaCount: submitData.media?.length || 0,
        media: submitData.media,
      });

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Project added successfully!",
        });

        // Reset form
        setFormData({
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
        setNewTech("");
        setTimeout(() => {
          setIsOpen(false);
          setMessage(null);
          onProjectAdded();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to add project.",
        });
      }
    } catch (error) {
      console.error("Failed to add project:", error);
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTechnology = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()],
      }));
      setNewTech("");
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  const handleMediaChange = (media: MediaItem[]) => {
    setFormData((prev) => ({
      ...prev,
      media,
    }));
  };

  const resetForm = () => {
    setFormData({
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
    setNewTech("");
    setMessage(null);
    setIsOpen(false);
    // Media state reset handled by MediaEditor
  };

  if (!isOpen) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors group"
        >
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add New Project</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Add New Project
          </h3>
          <button
            onClick={resetForm}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Display message */}
      {message && (
        <div
          className={`p-4 ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500"
              : "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-green-500"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="9 11 12 14 22 4" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-red-500"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="16" />
                <line x1="12" x2="12.01" y1="12" y2="12" />
              </svg>
            )}
            <span
              className={`font-medium ${
                message.type === "success"
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }`}
            >
              {message.text}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Project Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter project title"
          />
        </div>

        {/* Project Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter project description"
          />
        </div>

        {/* Project Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
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
              value={formData.endDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave empty for ongoing projects"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty for ongoing projects
            </p>
          </div>
        </div>

        {/* Team Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Size *
          </label>
          <input
            type="number"
            required
            value={formData.teamSize}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                teamSize: parseInt(e.target.value) || 1,
              }))
            }
            min="1"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter team size"
          />
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Type *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {projectTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: type.value as any }))
                }
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.type === type.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {type.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Project Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Status *
          </label>
          <div className="flex gap-2">
            {projectStatuses.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    status: status.value as any,
                  }))
                }
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  formData.status === status.value
                    ? `${status.color} border-transparent text-white`
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Technologies Used */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Technologies Used
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTechnology())
              }
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter technology name and press Enter"
            />
            <button
              type="button"
              onClick={addTechnology}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Project Media */}
        <MediaEditor
          media={formData.media}
          onChange={handleMediaChange}
          allowUpload={true}
          maxItems={10}
        />

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <Loading variant="button" size="sm" text="Adding..." />
            ) : (
              "Add Project"
            )}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

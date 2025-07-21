"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trash2,
  Play,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  File,
  AlertTriangle,
} from "lucide-react";
import type { ProjectMedia } from "@/types/api";
import { useEditMode } from "@/contexts/edit-mode-context";

interface ProjectMediaManagerProps {
  projectId: string;
  media: ProjectMedia[];
  onMediaUpdated: () => void;
}

const mediaTypeIcons = {
  image: File,
  video: Play,
  presentation: FileText,
  url: LinkIcon,
};

const mediaTypeLabels = {
  image: "Image",
  video: "Project Video",
  presentation: "Presentation",
  url: "Related Link",
};

export function ProjectMediaManager({
  projectId,
  media,
  onMediaUpdated,
}: ProjectMediaManagerProps) {
  const { isEditMode } = useEditMode();
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

  const handleDelete = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    setDeletingMediaId(mediaId);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/media/${mediaId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Media deleted successfully!");
        onMediaUpdated();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete media.");
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
      alert("An error occurred while deleting media.");
    } finally {
      setDeletingMediaId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Project Media
          </h2>
        </div>
      </div>

      {/* Media list */}
      <div className="p-6">
        {media.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No media registered.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {media.map((mediaItem) => {
              const IconComponent = mediaTypeIcons[mediaItem.type];
              return (
                <div
                  key={mediaItem.id}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {mediaItem.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {mediaTypeLabels[mediaItem.type]}
                          </p>
                        </div>
                      </div>

                      {/* Edit/Delete buttons - Only show in edit mode */}
                      {isEditMode && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(mediaItem.id)}
                            disabled={deletingMediaId === mediaItem.id}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Delete Media"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {mediaItem.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 whitespace-pre-line">
                        {mediaItem.description}
                      </p>
                    )}

                    <Link
                      href={mediaItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

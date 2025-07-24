"use client";

import { useState, useRef, useCallback } from "react";
import * as React from "react";
import {
  Plus,
  X,
  Upload,
  File,
  Play,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Edit3,
  Check,
  AlertCircle,
  Image as ImageIcon,
  GripVertical,
} from "lucide-react";
import { Loading } from "./loading";

export interface MediaItem {
  id?: string;
  type: "image" | "video" | "presentation" | "url";
  title: string;
  url: string;
  description?: string;
  fileName?: string;
  originalName?: string;
  ogData?: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    url?: string;
    type?: string;
  };
}

interface MediaEditorProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  className?: string;
  allowUpload?: boolean;
  maxItems?: number;
}

const mediaTypes = [
  { value: "image", label: "Image", icon: ImageIcon, accept: "image/*" },
  { value: "video", label: "Video", icon: Play, accept: "video/*" },
  {
    value: "presentation",
    label: "Presentation",
    icon: FileText,
    accept: ".pdf,.ppt,.pptx",
  },
  { value: "url", label: "Link", icon: LinkIcon, accept: "" },
];

// LinkPreview component moved outside to prevent re-creation
const LinkPreview = React.memo(({ item }: { item: MediaItem }) => {
  const [ogData, setOgData] = useState(item.ogData || null);
  const [loading, setLoading] = useState(!item.ogData);
  const [error, setError] = useState(false);

  const fetchOpenGraphData = useCallback(async () => {
    if (ogData || item.ogData) return; // Don't fetch if we already have data

    try {
      setLoading(true);
      setError(false);

      const response = await fetch("/api/opengraph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: item.url }),
      });

      if (response.ok) {
        const result = await response.json();
        setOgData(result.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to fetch OpenGraph data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [item.url, ogData, item.ogData]);

  React.useEffect(() => {
    if (item.type === "url" && item.url && !item.ogData && !ogData) {
      fetchOpenGraphData();
    }
  }, [item.type, item.url, item.ogData, ogData, fetchOpenGraphData]);

  if (loading) {
    return (
      <div className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ogData) {
    return (
      <div className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <LinkIcon className="w-8 h-8 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight">
              {item.title || new URL(item.url).hostname || "Link"}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {new URL(item.url).hostname}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
      <div className="flex items-start gap-3">
        {ogData.image ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
            <img
              src={ogData.image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <LinkIcon className="w-8 h-8 text-gray-500" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1 leading-tight line-clamp-2">
            {ogData.title || item.title || new URL(item.url).hostname || "Link"}
          </h4>
          {ogData.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed line-clamp-2">
              {ogData.description}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {ogData.siteName || new URL(item.url).hostname}
            </span>
            {ogData.siteName && (
              <span className="text-xs text-gray-400">•</span>
            )}
            <span className="text-xs text-gray-400 truncate">
              {new URL(item.url).hostname}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

// MediaThumbnail component moved outside to prevent re-creation
const MediaThumbnail = React.memo(({ item }: { item: MediaItem }) => {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (item.type === "url") {
    return <LinkPreview item={item} />;
  }

  if (item.type === "image" && item.url && !imageError) {
    return (
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={item.url}
          alt={item.title}
          className="w-full h-full object-cover"
          onLoad={() => setLoading(false)}
          onError={() => {
            setImageError(true);
            setLoading(false);
          }}
        />
      </div>
    );
  }

  if (item.type === "video" && item.url && !videoError) {
    return (
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        <video
          src={item.url}
          className="w-full h-full object-cover"
          muted
          playsInline
          onLoadedData={() => setLoading(false)}
          onError={() => {
            setVideoError(true);
            setLoading(false);
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <Play className="w-6 h-6 text-white" />
        </div>
      </div>
    );
  }

  // Fallback to icon for other types or errors
  const getMediaIcon = (type: string) => {
    const mediaType = mediaTypes.find((t) => t.value === type);
    return mediaType ? mediaType.icon : File;
  };

  const IconComponent = getMediaIcon(item.type);
  return (
    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
      <IconComponent className="w-8 h-8 text-gray-500" />
    </div>
  );
});

// Separate MediaItem component to prevent unnecessary re-renders
const MediaItem = React.memo(
  ({
    item,
    index,
    onEdit,
    onRemove,
    isEditing,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    isDragging,
    dropIndicator,
  }: {
    item: MediaItem;
    index: number;
    onEdit: (index: number) => void;
    onRemove: (index: number) => void;
    isEditing: boolean;
    onDragStart: () => void;
    onDragEnd: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    isDragging: boolean;
    dropIndicator: { index: number; position: "before" | "after" } | null;
  }) => {
    const handleEdit = useCallback(() => onEdit(index), [onEdit, index]);
    const handleRemove = useCallback(() => onRemove(index), [onRemove, index]);
    const handleItemDragStart = useCallback(onDragStart, [onDragStart]);
    const handleItemDragOver = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        onDragOver(e);
      },
      [onDragOver]
    );
    const handleItemDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        onDrop(e);
      },
      [onDrop]
    );

    const showDropIndicatorBefore =
      dropIndicator?.index === index && dropIndicator.position === "before";
    const showDropIndicatorAfter =
      dropIndicator?.index === index && dropIndicator.position === "after";

    if (item.type === "url") {
      return (
        <div className="relative">
          {/* Drop indicator before */}
          {showDropIndicatorBefore && (
            <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-20">
              <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          )}

          <div
            className={`group relative transition-all duration-200 ${
              isDragging ? "opacity-50 scale-95" : ""
            }`}
            draggable
            onDragStart={handleItemDragStart}
            onDragEnd={onDragEnd}
            onDragOver={handleItemDragOver}
            onDrop={handleItemDrop}
          >
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-1">
              <div
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing rounded transition-colors"
                title="Drag to reorder"
              >
                <GripVertical className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={handleEdit}
                className="p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:scale-[1.02] transition-transform"
            >
              <MediaThumbnail item={item} />
            </a>

            {item.description && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}
          </div>

          {/* Drop indicator after */}
          {showDropIndicatorAfter && (
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-20">
              <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        {/* Drop indicator before */}
        {showDropIndicatorBefore && (
          <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-20">
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}

        <div
          className={`group relative transition-all duration-200 ${
            isDragging ? "opacity-50 scale-95" : ""
          }`}
          draggable
          onDragStart={handleItemDragStart}
          onDragEnd={onDragEnd}
          onDragOver={handleItemDragOver}
          onDrop={handleItemDrop}
        >
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-1">
            <div
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing rounded transition-colors"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <button
              type="button"
              onClick={handleEdit}
              className="p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:scale-[1.02] transition-transform"
            >
              <div className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                <div className="flex items-start gap-3">
                  <MediaThumbnail item={item} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1 leading-tight line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="mb-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                        {mediaTypes.find((t) => t.value === item.type)?.label}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ) : (
            <div className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-start gap-3">
                <MediaThumbnail item={item} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1 leading-tight line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="mb-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                      {mediaTypes.find((t) => t.value === item.type)?.label}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drop indicator after */}
        {showDropIndicatorAfter && (
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-20">
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    );
  }
);

export default function MediaEditor({
  media,
  onChange,
  className = "",
  allowUpload = true,
  maxItems = 10,
}: MediaEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isLinkOnly, setIsLinkOnly] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newItem, setNewItem] = useState<MediaItem>({
    type: "image",
    title: "",
    url: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Drag and drop state for reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    index: number;
    position: "before" | "after";
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateItem = (item: MediaItem): Record<string, string> => {
    const itemErrors: Record<string, string> = {};

    if (!item.title.trim()) {
      itemErrors.title = "Title is required";
    }

    if (item.type === "url" && !item.url.trim()) {
      itemErrors.url = "URL is required";
    }

    if (item.type === "url" && item.url && !isValidUrl(item.url)) {
      itemErrors.url = "Please enter a valid URL";
    }

    return itemErrors;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!allowUpload) return;

    setUploading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const fileType = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : "presentation";

        // Auto-add media after file upload (without form)
        const newMedia: MediaItem = {
          id: `temp-${Date.now()}`,
          type: fileType,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          url: result.url,
          fileName: result.fileName,
          originalName: result.originalName,
        };

        const updatedMedia = [...media, newMedia];
        onChange(updatedMedia);
      } else {
        setErrors({ upload: result.error || "Failed to upload file" });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setErrors({ upload: "An error occurred while uploading" });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleMultipleFileUpload = async (files: File[]) => {
    if (!allowUpload) return;

    setUploading(true);
    setErrors({});

    const newMediaItems: MediaItem[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          const fileType = file.type.startsWith("image/")
            ? "image"
            : file.type.startsWith("video/")
            ? "video"
            : "presentation";

          const newMedia: MediaItem = {
            id: `temp-${Date.now()}-${Math.random()}`,
            type: fileType,
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            url: result.url,
            fileName: result.fileName,
            originalName: result.originalName,
          };

          newMediaItems.push(newMedia);
        } else {
          console.error(`Failed to upload ${file.name}:`, result.error);
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    if (newMediaItems.length > 0) {
      const updatedMedia = [...media, ...newMediaItems];
      onChange(updatedMedia);
    }

    if (newMediaItems.length < files.length) {
      setErrors({
        upload: `${
          files.length - newMediaItems.length
        } file(s) failed to upload`,
      });
    }

    setUploading(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      if (!allowUpload) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleMultipleFileUpload(files);
      }
    },
    [allowUpload, media, onChange]
  );

  const resetForm = useCallback(() => {
    setNewItem({
      type: "image",
      title: "",
      url: "",
      description: "",
    });
    setIsAdding(false);
    setIsLinkOnly(false);
    setErrors({});
  }, []);

  const addItem = useCallback(() => {
    const errors = validateItem(newItem);
    setErrors(errors);

    if (Object.keys(errors).length === 0) {
      onChange([...media, { ...newItem, id: Date.now().toString() }]);
      resetForm();
    }
  }, [newItem, media, onChange, resetForm]);

  const updateItem = useCallback(
    (index: number, updatedItem: MediaItem) => {
      const errors = validateItem(updatedItem);
      setErrors(errors);

      if (Object.keys(errors).length === 0) {
        const updatedMedia = [...media];
        updatedMedia[index] = updatedItem;
        onChange(updatedMedia);
        setEditingIndex(null);
      }
    },
    [media, onChange]
  );

  const removeItem = useCallback(
    (index: number) => {
      const updatedMedia = media.filter((_, i) => i !== index);
      onChange(updatedMedia);
    },
    [media, onChange]
  );

  // Drag and drop handlers for reordering media items
  const handleMediaDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleMediaDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDropIndicator(null);
  }, []);

  const handleMediaDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== index) {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;

        // Determine if cursor is in upper half (before) or lower half (after)
        const position = y < height / 2 ? "before" : "after";

        setDropIndicator({ index, position });
      }
    },
    [draggedIndex]
  );

  const handleMediaDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex !== null && dropIndicator) {
        const updatedMedia = [...media];
        const draggedItem = updatedMedia[draggedIndex];

        // Remove the dragged item
        updatedMedia.splice(draggedIndex, 1);

        // Calculate the new insert position
        let insertIndex = dropIndicator.index;

        // If dragging from before the drop target, we don't need to adjust
        // If dragging from after the drop target, we need to adjust for the removal
        if (draggedIndex < dropIndicator.index) {
          insertIndex = dropIndicator.index - 1;
        }

        // If position is 'after', increment the insert index
        if (dropIndicator.position === "after") {
          insertIndex += 1;
        }

        // Insert at the calculated position
        updatedMedia.splice(insertIndex, 0, draggedItem);

        onChange(updatedMedia);
      }
      setDraggedIndex(null);
      setDropIndicator(null);
    },
    [draggedIndex, dropIndicator, media, onChange]
  );

  const getMediaIcon = (type: string) => {
    const mediaType = mediaTypes.find((t) => t.value === type);
    return mediaType ? mediaType.icon : File;
  };

  return (
    <div className={`relative space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Project Media ({media.length}/{maxItems})
        </label>
        {media.length < maxItems && (
          <div className="flex gap-2">
            {allowUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={true}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      if (files.length === 1) {
                        handleFileUpload(files[0]);
                      } else {
                        handleMultipleFileUpload(files);
                      }
                    }
                  }}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.ppt,.pptx"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                >
                  {uploading ? (
                    <Loading variant="button" size="sm" text="" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload File
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setNewItem({
                  type: "url",
                  title: "",
                  url: "",
                  description: "",
                });
                setIsAdding(true);
              }}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
            >
              <LinkIcon className="w-4 h-4" />
              Add Link
            </button>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.upload && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-200">
              {errors.upload}
            </span>
          </div>
        </div>
      )}

      {/* Drag & Drop Zone (when no items and upload allowed) */}
      {allowUpload && media.length === 0 && !isAdding && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${
              dragOver
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Drag & drop files here, or click to select
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Multiple files supported - all will be uploaded automatically
          </p>
        </div>
      )}

      {/* Drag & Drop Overlay (when items exist) */}
      {allowUpload && media.length > 0 && dragOver && (
        <div className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl border-2 border-blue-500 border-dashed">
            <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Drop to upload
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Multiple files will be uploaded and added automatically
            </p>
          </div>
        </div>
      )}

      {/* Global drag handlers when media exists */}
      {allowUpload && media.length > 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="absolute inset-0 pointer-events-none"
        />
      )}

      {/* Media Items */}
      {media.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {media.map((item, index) => {
            const IconComponent = getMediaIcon(item.type);
            const isEditing = editingIndex === index;

            if (isEditing) {
              return (
                <div
                  key={index}
                  className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                >
                  <EditForm
                    item={item}
                    onSave={(updatedItem) => updateItem(index, updatedItem)}
                    onCancel={() => setEditingIndex(null)}
                    errors={errors}
                  />
                </div>
              );
            }

            return (
              <MediaItem
                key={item.id || `media-${index}`}
                item={item}
                index={index}
                onEdit={setEditingIndex}
                onRemove={removeItem}
                isEditing={false}
                onDragStart={() => handleMediaDragStart(index)}
                onDragEnd={handleMediaDragEnd}
                onDragOver={(e) => handleMediaDragOver(e, index)}
                onDrop={(e) => handleMediaDrop(e, index)}
                isDragging={draggedIndex === index}
                dropIndicator={dropIndicator}
              />
            );
          })}
        </div>
      )}

      {/* Add New Item Form */}
      {isAdding && (
        <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            {newItem.type === "url" ? "Add Link" : "Add Media"}
          </h4>
          <AddForm
            item={newItem}
            onChange={setNewItem}
            onSave={addItem}
            onCancel={resetForm}
            errors={errors}
            allowUpload={allowUpload}
            isLinkOnly={newItem.type === "url"}
          />
        </div>
      )}
    </div>
  );
}

// Form Components
function EditForm({
  item,
  onSave,
  onCancel,
  errors,
}: {
  item: MediaItem;
  onSave: (item: MediaItem) => void;
  onCancel: () => void;
  errors: Record<string, string>;
}) {
  const [editItem, setEditItem] = useState(item);

  if (editItem.type === "url") {
    // Simplified edit form for links
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link URL *
          </label>
          <input
            type="url"
            value={editItem.url}
            onChange={(e) => {
              const newUrl = e.target.value;
              let newTitle = editItem.title;

              if (newUrl) {
                try {
                  // Try to extract hostname from valid URL
                  const url = new URL(newUrl);
                  newTitle = url.hostname;
                } catch {
                  // If URL is invalid, use the raw input as title
                  newTitle = newUrl;
                }
              }

              setEditItem((prev) => ({
                ...prev,
                url: newUrl,
                title: newTitle,
                // Clear any cached ogData when URL changes
                ogData: undefined,
              }));
            }}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
              errors.url
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="https://example.com"
          />
          {errors.url && (
            <p className="text-red-500 text-xs mt-1">{errors.url}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Title and description will be automatically updated from the page
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Additional Notes
          </label>
          <textarea
            value={editItem.description || ""}
            onChange={(e) =>
              setEditItem((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Add your own notes about this link (optional)"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSave(editItem)}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={editItem.title}
          onChange={(e) =>
            setEditItem((prev) => ({ ...prev, title: e.target.value }))
          }
          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
            errors.title
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          }`}
          placeholder="Enter title"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title}</p>
        )}
      </div>

      {/* URL editing is only available for link type items */}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={editItem.description || ""}
          onChange={(e) =>
            setEditItem((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Optional description"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave(editItem)}
          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
        >
          <Check className="w-4 h-4" />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function AddForm({
  item,
  onChange,
  onSave,
  onCancel,
  errors,
  allowUpload,
  isLinkOnly = false,
}: {
  item: MediaItem;
  onChange: (item: MediaItem) => void;
  onSave: () => void;
  onCancel: () => void;
  errors: Record<string, string>;
  allowUpload: boolean;
  isLinkOnly?: boolean;
}) {
  if (isLinkOnly) {
    // Simplified form for links - only URL and optional note
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link URL *
          </label>
          <input
            type="url"
            value={item.url}
            onChange={(e) => {
              const newUrl = e.target.value;
              let newTitle = "Link";

              if (newUrl) {
                try {
                  // Try to extract hostname from valid URL
                  const url = new URL(newUrl);
                  newTitle = url.hostname;
                } catch {
                  // If URL is invalid, use the raw input as title
                  newTitle = newUrl;
                }
              }

              onChange({
                ...item,
                url: newUrl,
                title: newTitle,
              });
            }}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
              errors.url
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="https://example.com"
          />
          {errors.url && (
            <p className="text-red-500 text-xs mt-1">{errors.url}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Title and description will be automatically detected from the page
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Additional Notes
          </label>
          <textarea
            value={item.description || ""}
            onChange={(e) => onChange({ ...item, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Add your own notes about this link (optional)"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            value={item.type}
            onChange={(e) => onChange({ ...item, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {mediaTypes
              .filter((type) => allowUpload || type.value === "url")
              .map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={item.title}
            onChange={(e) => onChange({ ...item, title: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
              errors.title
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="Enter title"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>
      </div>

      {item.type === "url" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL *
          </label>
          <input
            type="url"
            value={item.url}
            onChange={(e) => {
              const newUrl = e.target.value;
              let updatedItem = { ...item, url: newUrl };

              // Only auto-update title if it's empty or was previously auto-generated
              if (
                !item.title ||
                item.title === "Link" ||
                item.title === item.url
              ) {
                if (newUrl) {
                  try {
                    // Try to extract hostname from valid URL
                    const url = new URL(newUrl);
                    updatedItem.title = url.hostname;
                  } catch {
                    // If URL is invalid, use the raw input as title
                    updatedItem.title = newUrl;
                  }
                } else {
                  updatedItem.title = "Link";
                }
              }

              onChange(updatedItem);
            }}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
              errors.url
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="Enter URL"
          />
          {errors.url && (
            <p className="text-red-500 text-xs mt-1">{errors.url}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={item.description || ""}
          onChange={(e) => onChange({ ...item, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Optional description"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Media
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

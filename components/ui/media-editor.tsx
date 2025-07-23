"use client";

import { useState, useRef, useCallback } from "react";
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

export function MediaEditor({
  media,
  onChange,
  className = "",
  allowUpload = true,
  maxItems = 10,
}: MediaEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateItem = (item: MediaItem): Record<string, string> => {
    const itemErrors: Record<string, string> = {};

    if (!item.title.trim()) {
      itemErrors.title = "Title is required";
    }

    if (item.type !== "image" && !item.url.trim()) {
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

        // 파일 업로드 후 자동으로 미디어 추가 (폼 없이)
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

  const addItem = () => {
    const itemErrors = validateItem(newItem);
    if (Object.keys(itemErrors).length > 0) {
      setErrors(itemErrors);
      return;
    }

    const updatedMedia = [...media, { ...newItem, id: `temp-${Date.now()}` }];
    onChange(updatedMedia);

    setNewItem({
      type: "image",
      title: "",
      url: "",
      description: "",
    });
    setIsAdding(false);
    setErrors({});
  };

  const updateItem = (index: number, updatedItem: MediaItem) => {
    const itemErrors = validateItem(updatedItem);
    if (Object.keys(itemErrors).length > 0) {
      setErrors(itemErrors);
      return;
    }

    const updatedMedia = [...media];
    updatedMedia[index] = updatedItem;
    onChange(updatedMedia);
    setEditingIndex(null);
    setErrors({});
  };

  const removeItem = (index: number) => {
    const updatedMedia = media.filter((_, i) => i !== index);
    onChange(updatedMedia);
  };

  const getMediaIcon = (type: string) => {
    const mediaType = mediaTypes.find((t) => t.value === type);
    return mediaType ? mediaType.icon : File;
  };

  const resetForm = () => {
    setNewItem({
      type: "image",
      title: "",
      url: "",
      description: "",
    });
    setIsAdding(false);
    setEditingIndex(null);
    setErrors({});
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
              <div
                key={index}
                className="group p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors min-h-[140px] flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-gray-500" />
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingIndex(index)}
                      className="p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 mb-4">
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                    {mediaTypes.find((t) => t.value === item.type)?.label}
                  </span>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm font-medium px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {item.type === "url" ? "Open" : "View"}
                    </a>
                  )}
                </div>
              </div>
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            value={editItem.type}
            onChange={(e) =>
              setEditItem((prev) => ({ ...prev, type: e.target.value as any }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {mediaTypes.map((type) => (
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
      </div>

      {editItem.type !== "image" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL *
          </label>
          <input
            type="url"
            value={editItem.url}
            onChange={(e) =>
              setEditItem((prev) => ({ ...prev, url: e.target.value }))
            }
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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!isLinkOnly && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={item.type}
              onChange={(e) =>
                onChange({ ...item, type: e.target.value as any })
              }
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
        )}

        <div className={isLinkOnly ? "col-span-full" : ""}>
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
            placeholder={isLinkOnly ? "Enter link title" : "Enter title"}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>
      </div>

      {(item.type !== "image" || isLinkOnly) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL *
          </label>
          <input
            type="url"
            value={item.url}
            onChange={(e) => onChange({ ...item, url: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
              errors.url
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder={isLinkOnly ? "Enter link URL" : "Enter URL"}
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
          {isLinkOnly ? "Add Link" : "Add Media"}
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

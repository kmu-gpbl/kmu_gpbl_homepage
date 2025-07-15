"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Play,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { ProjectMedia } from "@/types/api";

interface ProjectMediaManagerProps {
  projectId: string;
  media: ProjectMedia[];
  onMediaUpdated: () => void;
}

const mediaTypeIcons = {
  video: Play,
  presentation: FileText,
  url: LinkIcon,
};

const mediaTypeLabels = {
  video: "프로젝트 영상",
  presentation: "프레젠테이션",
  url: "관련 링크",
};

const mediaTypes = [
  { value: "video", label: "프로젝트 영상", icon: Play },
  { value: "presentation", label: "프레젠테이션", icon: FileText },
  { value: "url", label: "관련 링크", icon: LinkIcon },
];

export function ProjectMediaManager({
  projectId,
  media,
  onMediaUpdated,
}: ProjectMediaManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    type: "video" as "video" | "presentation" | "url",
    title: "",
    url: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      type: "video",
      title: "",
      url: "",
      description: "",
    });
    setIsAdding(false);
    setEditingMediaId(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const url = isAdding
        ? `/api/projects/${projectId}/media`
        : `/api/projects/${projectId}/media/${editingMediaId}`;
      const method = isAdding ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          isAdding
            ? "미디어가 성공적으로 추가되었습니다!"
            : "미디어가 성공적으로 수정되었습니다!"
        );
        resetForm();
        onMediaUpdated();
      } else {
        setMessage({
          type: "error",
          text: result.error || "미디어 저장에 실패했습니다.",
        });
      }
    } catch (error) {
      console.error("미디어 저장 실패:", error);
      setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm("이 미디어를 삭제하시겠습니까?")) return;

    setDeletingMediaId(mediaId);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/media/${mediaId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("미디어가 성공적으로 삭제되었습니다!");
        onMediaUpdated();
      } else {
        const error = await response.json();
        alert(error.error || "미디어 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("미디어 삭제 실패:", error);
      alert("미디어 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleEdit = (media: ProjectMedia) => {
    setEditingMediaId(media.id);
    setFormData({
      type: media.type,
      title: media.title,
      url: media.url,
      description: media.description || "",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            프로젝트 미디어
          </h2>
          {!isAdding && !editingMediaId && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              미디어 추가
            </button>
          )}
        </div>
      </div>

      {/* 미디어 추가/수정 폼 */}
      {(isAdding || editingMediaId) && (
        <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isAdding ? "새 미디어 추가" : "미디어 수정"}
            </h3>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 에러 메시지 */}
          {message && message.type === "error" && (
            <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-800 dark:text-red-200">
                  {message.text}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 미디어 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                미디어 타입 *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {mediaTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          type: type.value as any,
                        }))
                      }
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.type === type.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <div className="text-center">
                        <IconComponent className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {type.label}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                제목 *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="미디어 제목을 입력하세요"
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL *
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="미디어에 대한 설명을 입력하세요"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                {isAdding ? "추가" : "수정"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 미디어 목록 */}
      <div className="p-6">
        {media.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>등록된 미디어가 없습니다.</p>
            <p className="text-sm mt-1">
              미디어 추가 버튼을 클릭하여 추가해보세요.
            </p>
          </div>
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

                      {/* 편집/삭제 버튼 */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(mediaItem)}
                          disabled={editingMediaId === mediaItem.id}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                          title="미디어 수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(mediaItem.id)}
                          disabled={deletingMediaId === mediaItem.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          title="미디어 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {mediaItem.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
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
                      보기
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

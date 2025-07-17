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

interface ProjectMediaManagerProps {
  projectId: string;
  media: ProjectMedia[];
  onMediaUpdated: () => void;
}

const mediaTypeIcons = {
  image: File,
  video: Play,
  presentation: FileText,
  document: File,
};

const mediaTypeLabels = {
  image: "이미지",
  video: "프로젝트 영상",
  presentation: "프레젠테이션",
  document: "문서",
};

export function ProjectMediaManager({
  projectId,
  media,
  onMediaUpdated,
}: ProjectMediaManagerProps) {
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

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

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            프로젝트 미디어
          </h2>
        </div>
      </div>

      {/* 미디어 목록 */}
      <div className="p-6">
        {media.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>등록된 미디어가 없습니다.</p>
            <p className="text-sm mt-1">
              프로젝트 생성 시 미디어를 추가할 수 있습니다.
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

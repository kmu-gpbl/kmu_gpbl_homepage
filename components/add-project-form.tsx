"use client";

import { useState, useRef } from "react";
import {
  Plus,
  X,
  Calendar,
  Tag,
  Activity,
  Play,
  FileText,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";

interface AddProjectFormProps {
  memberId: string;
  onProjectAdded: () => void;
}

interface ProjectFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "completed" | "ongoing" | "planned";
  type: "web" | "mobile" | "ai" | "infrastructure" | "other";
  technologies: string[];
  teamSize: number;
  media: ProjectMedia[];
}

interface ProjectMedia {
  type: "image" | "video" | "presentation" | "url";
  title: string;
  url: string;
  description?: string;
  fileName?: string;
  originalName?: string;
}

const projectTypes = [
  { value: "web", label: "웹 개발", icon: "🌐" },
  { value: "mobile", label: "모바일 앱", icon: "📱" },
  { value: "ai", label: "AI/ML", icon: "🤖" },
  { value: "infrastructure", label: "인프라", icon: "🏗️" },
  { value: "other", label: "기타", icon: "⚙️" },
];

const projectStatuses = [
  { value: "completed", label: "완료", color: "bg-green-500" },
  { value: "ongoing", label: "진행중", color: "bg-yellow-500" },
  { value: "planned", label: "계획", color: "bg-gray-400" },
];

const mediaTypes = [
  { value: "image", label: "이미지", icon: "🖼️" },
  { value: "video", label: "프로젝트 영상", icon: "🎥" },
  { value: "presentation", label: "프레젠테이션", icon: "📄" },
  { value: "url", label: "관련 링크", icon: "🔗" },
];

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

  // 미디어 추가 상태
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [mediaFormData, setMediaFormData] = useState({
    type: "image" as "image" | "video" | "presentation" | "url",
    title: "",
    url: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          memberIds: [memberId],
          period: `${formData.startDate} - ${formData.endDate || "현재"}`,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("프로젝트가 성공적으로 추가되었습니다!");

        // 폼 초기화
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

        // 2초 후 폼 닫기 및 콜백 호출
        setTimeout(() => {
          setIsOpen(false);
          onProjectAdded();
          setMessage(null);
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: result.error || "프로젝트 추가에 실패했습니다.",
        });
      }
    } catch (error) {
      console.error("프로젝트 추가 실패:", error);
      setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
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

  const addMedia = () => {
    if (mediaFormData.title && mediaFormData.url) {
      setFormData((prev) => ({
        ...prev,
        media: [...prev.media, { ...mediaFormData }],
      }));
      setMediaFormData({
        type: "image",
        title: "",
        url: "",
        description: "",
      });
      setIsAddingMedia(false);
    }
  };

  const removeMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
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
    setIsAddingMedia(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors group"
      >
        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
          <Plus className="w-5 h-5" />
          <span className="font-medium">새 프로젝트 추가</span>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            새 프로젝트 추가
          </h3>
          <button
            onClick={resetForm}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* 메시지 표시 */}
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
        {/* 프로젝트 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            프로젝트 제목 *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="프로젝트 제목을 입력하세요"
          />
        </div>

        {/* 프로젝트 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            프로젝트 설명 *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="프로젝트에 대한 설명을 입력하세요"
          />
        </div>

        {/* 프로젝트 기간 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              시작일 *
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
              종료일
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 팀 규모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            팀 규모 *
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
            placeholder="팀원 수를 입력하세요"
          />
        </div>

        {/* 프로젝트 유형 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            프로젝트 유형 *
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

        {/* 프로젝트 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            프로젝트 상태 *
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

        {/* 사용 기술 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            사용 기술
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
              placeholder="기술명을 입력하고 Enter"
            />
            <button
              type="button"
              onClick={addTechnology}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              추가
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

        {/* 미디어 추가 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            미디어 추가
          </label>
          <div className="flex gap-2 mb-3">
            <select
              value={mediaFormData.type}
              onChange={(e) =>
                setMediaFormData((prev) => ({
                  ...prev,
                  type: e.target.value as
                    | "image"
                    | "video"
                    | "presentation"
                    | "url",
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
              추가
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
                  placeholder="미디어 제목"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={mediaFormData.url}
                    onChange={(e) =>
                      setMediaFormData((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }))
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="미디어 URL (이미지/동영상/프레젠테이션)"
                  />
                </div>
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
                placeholder="미디어 설명 (선택 사항)"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addMedia}
                  disabled={!mediaFormData.title || !mediaFormData.url}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  미디어 추가
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingMedia(false);
                    setMediaFormData({
                      type: "image",
                      title: "",
                      url: "",
                      description: "",
                    });
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {formData.media.map((media, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                <span>{media.title}</span>
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-500"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
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

        {/* 제출 버튼 */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? "추가 중..." : "프로젝트 추가"}
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
  );
}

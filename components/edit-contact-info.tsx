"use client";

import { useState } from "react";
import {
  Edit,
  Save,
  X,
  AlertCircle,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
} from "lucide-react";

interface EditContactInfoProps {
  memberId: string;
  initialData: {
    email: string | null;
    github: string | null;
    linkedin: string | null;
    portfolio: string | null;
  };
  onContactUpdated: () => void;
}

export function EditContactInfo({
  memberId,
  initialData,
  onContactUpdated,
}: EditContactInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: initialData.email || "",
    github: initialData.github || "",
    linkedin: initialData.linkedin || "",
    portfolio: initialData.portfolio || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/users/${memberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          email: formData.email || null,
          github: formData.github || null,
          linkedin: formData.linkedin || null,
          portfolio: formData.portfolio || null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("연락처 정보가 성공적으로 업데이트되었습니다!");
        setIsEditing(false);
        onContactUpdated();
        setMessage(null);
      } else {
        setMessage({
          type: "error",
          text: result.error || "연락처 정보 업데이트에 실패했습니다.",
        });
      }
    } catch (error) {
      console.error("연락처 정보 업데이트 실패:", error);
      setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: initialData.email || "",
      github: initialData.github || "",
      linkedin: initialData.linkedin || "",
      portfolio: initialData.portfolio || "",
    });
    setIsEditing(false);
    setMessage(null);
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              연락처 정보
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="연락처 수정"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {formData.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a
                  href={`mailto:${formData.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {formData.email}
                </a>
              </div>
            )}
            {formData.github && (
              <div className="flex items-center gap-3">
                <Github className="w-5 h-5 text-gray-400" />
                <a
                  href={formData.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {formData.linkedin && (
              <div className="flex items-center gap-3">
                <Linkedin className="w-5 h-5 text-gray-400" />
                <a
                  href={formData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {formData.portfolio && (
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-gray-400" />
                <a
                  href={formData.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  포트폴리오
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {!formData.email &&
              !formData.github &&
              !formData.linkedin &&
              !formData.portfolio && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  등록된 연락처 정보가 없습니다.
                </p>
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            연락처 수정
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* 에러 메시지 표시 */}
      {message && message.type === "error" && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-800 dark:text-red-200">
              {message.text}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            이메일
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="example@email.com"
          />
        </div>

        {/* GitHub */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub
          </label>
          <input
            type="url"
            value={formData.github}
            onChange={(e) =>
              setFormData({ ...formData, github: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://github.com/username"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            LinkedIn
          </label>
          <input
            type="url"
            value={formData.linkedin}
            onChange={(e) =>
              setFormData({ ...formData, linkedin: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        {/* 포트폴리오 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            포트폴리오
          </label>
          <input
            type="url"
            value={formData.portfolio}
            onChange={(e) =>
              setFormData({ ...formData, portfolio: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://portfolio.com"
          />
        </div>

        {/* 제출 버튼 */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

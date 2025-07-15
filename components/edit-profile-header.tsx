"use client";

import { useState } from "react";
import { Edit, Save, X, AlertCircle, User } from "lucide-react";

interface EditProfileHeaderProps {
  memberId: string;
  initialData: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
  };
  onProfileUpdated: () => void;
}

const roleOptions = [
  "프론트엔드 개발자",
  "백엔드 개발자",
  "풀스택 개발자",
  "모바일 개발자",
  "AI/ML 엔지니어",
  "DevOps 엔지니어",
  "UI/UX 디자이너",
  "데이터 엔지니어",
  "보안 엔지니어",
  "게임 개발자",
  "블록체인 개발자",
  "프로젝트 매니저",
  "기타",
];

export function EditProfileHeader({
  memberId,
  initialData,
  onProfileUpdated,
}: EditProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name,
    role: initialData.role,
    avatar: initialData.avatar,
    bio: initialData.bio,
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
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("프로필이 성공적으로 업데이트되었습니다!");
        setIsEditing(false);
        onProfileUpdated();
        setMessage(null);
      } else {
        setMessage({
          type: "error",
          text: result.error || "프로필 업데이트에 실패했습니다.",
        });
      }
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: initialData.name,
      role: initialData.role,
      avatar: initialData.avatar,
      bio: initialData.bio,
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
              프로필 정보
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="프로필 수정"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={formData.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {formData.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {formData.role}
              </p>
            </div>
          </div>

          {/* 소개 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              소개
            </h4>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {formData.bio}
            </p>
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
            프로필 수정
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
        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            이름 *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="이름을 입력하세요"
          />
        </div>

        {/* 역할 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            역할 *
          </label>
          <select
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">역할을 선택하세요</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* 아바타 URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            프로필 이미지 URL
          </label>
          <input
            type="url"
            value={formData.avatar}
            onChange={(e) =>
              setFormData({ ...formData, avatar: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            프로필 이미지 URL을 입력하세요. 비워두면 기본 아이콘이 표시됩니다.
          </p>
        </div>

        {/* 소개 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            소개 *
          </label>
          <textarea
            required
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="자신에 대한 소개를 입력하세요"
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

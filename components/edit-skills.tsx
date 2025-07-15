"use client";

import { useState } from "react";
import { Edit, Save, X, AlertCircle, Plus, Tag } from "lucide-react";

interface EditSkillsProps {
  memberId: string;
  initialData: {
    skills: string[];
    specialties: string[];
  };
  onSkillsUpdated: () => void;
}

const specialtyOptions = [
  "frontend",
  "backend",
  "mobile",
  "ai",
  "devops",
  "design",
  "data",
  "security",
  "game",
  "blockchain",
];

const specialtyLabels = {
  frontend: "프론트엔드",
  backend: "백엔드",
  mobile: "모바일",
  ai: "AI/ML",
  devops: "DevOps",
  design: "디자인",
  data: "데이터",
  security: "보안",
  game: "게임",
  blockchain: "블록체인",
};

export function EditSkills({
  memberId,
  initialData,
  onSkillsUpdated,
}: EditSkillsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    skills: [...initialData.skills],
    specialties: [...initialData.specialties],
  });
  const [newSkill, setNewSkill] = useState("");
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
        alert("기술 스택이 성공적으로 업데이트되었습니다!");
        setIsEditing(false);
        onSkillsUpdated();
        setMessage(null);
      } else {
        setMessage({
          type: "error",
          text: result.error || "기술 스택 업데이트에 실패했습니다.",
        });
      }
    } catch (error) {
      console.error("기술 스택 업데이트 실패:", error);
      setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      skills: [...initialData.skills],
      specialties: [...initialData.specialties],
    });
    setNewSkill("");
    setIsEditing(false);
    setMessage(null);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              기술 스택
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="기술 스택 수정"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          {/* 전문 분야 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              전문 분야
            </h3>
            <div className="flex flex-wrap gap-2">
              {formData.specialties.length > 0 ? (
                formData.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-3 py-1 text-sm font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md"
                  >
                    {specialtyLabels[
                      specialty as keyof typeof specialtyLabels
                    ] || specialty}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  등록된 전문 분야가 없습니다.
                </p>
              )}
            </div>
          </div>

          {/* 기술 스택 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              기술 스택
            </h3>
            <div className="flex flex-wrap gap-2">
              {formData.skills.length > 0 ? (
                formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  등록된 기술 스택이 없습니다.
                </p>
              )}
            </div>
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
            기술 스택 수정
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
        {/* 전문 분야 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            전문 분야
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {specialtyOptions.map((specialty) => (
              <label
                key={specialty}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.specialties.includes(specialty)}
                  onChange={() => toggleSpecialty(specialty)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {specialtyLabels[specialty as keyof typeof specialtyLabels]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 기술 스택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            기술 스택
          </label>

          {/* 기술 추가 */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSkill())
              }
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="기술을 입력하세요"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* 기술 목록 */}
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
              >
                <Tag className="w-3 h-3" />
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
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

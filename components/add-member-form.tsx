"use client";

import { useState, useRef } from "react";
import {
  Plus,
  X,
  User,
  Mail,
  MapPin,
  Github,
  Linkedin,
  ExternalLink,
  Upload,
} from "lucide-react";

interface AddMemberFormProps {
  onMemberAdded: () => void;
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

export function AddMemberForm({ onMemberAdded }: AddMemberFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    specialties: [] as string[],
    bio: "",
    avatar: "",
    github: "",
    linkedin: "",
    portfolio: "",
    email: "",
    skills: [] as string[],
    experience: "",
    location: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // 저장 시 URL에 https:// 자동 추가
      const processedData = {
        ...formData,
        github: formData.github
          ? processGithubUrl(formData.github)
          : formData.github,
        linkedin: formData.linkedin
          ? processLinkedinUrl(formData.linkedin)
          : formData.linkedin,
        portfolio: formData.portfolio
          ? processPortfolioUrl(formData.portfolio)
          : formData.portfolio,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("멤버가 성공적으로 추가되었습니다!");
        setIsOpen(false);
        setFormData({
          name: "",
          role: "",
          specialties: [],
          bio: "",
          avatar: "",
          github: "",
          linkedin: "",
          portfolio: "",
          email: "",
          skills: [],
          experience: "",
          location: "",
        });
        onMemberAdded();
      } else {
        setMessage({
          type: "error",
          text: result.error || "멤버 추가에 실패했습니다.",
        });
      }
    } catch (error) {
      console.error("멤버 추가 실패:", error);
      setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
    } finally {
      setIsSubmitting(false);
    }
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

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          avatar: result.url,
        }));
      } else {
        alert(result.error || "프로필 이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("프로필 이미지 업로드 실패:", error);
      alert("프로필 이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 파일 체크
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드할 수 있습니다.");
        return;
      }
      handleAvatarUpload(file);
    }
  };

  // URL 처리 함수들
  const processGithubUrl = (input: string) => {
    if (!input) return input;

    // 이미 완전한 URL인 경우
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return input;
    }

    // github.com으로 시작하는 경우
    if (input.startsWith("github.com/")) {
      return "https://" + input;
    }

    // 사용자명만 입력한 경우
    if (!input.includes("/") && !input.includes(".")) {
      return "https://github.com/" + input;
    }

    // 기타 경우 (상대 경로 등)
    return "https://" + input;
  };

  const processLinkedinUrl = (input: string) => {
    if (!input) return input;

    // 이미 완전한 URL인 경우
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return input;
    }

    // linkedin.com으로 시작하는 경우
    if (input.startsWith("linkedin.com/")) {
      return "https://" + input;
    }

    // 사용자명만 입력한 경우
    if (!input.includes("/") && !input.includes(".")) {
      return "https://linkedin.com/in/" + input;
    }

    // 기타 경우
    return "https://" + input;
  };

  const processPortfolioUrl = (input: string) => {
    if (!input) return input;

    // 이미 완전한 URL인 경우
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return input;
    }

    // 도메인만 입력한 경우 (점이 포함되어 있음)
    if (input.includes(".")) {
      return "https://" + input;
    }

    // 기타 경우 (그대로 반환)
    return input;
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  if (!isOpen) {
    return (
      <div className="group bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200 overflow-hidden h-full">
        {/* Header with dashed border */}
        <div className="h-2 w-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500" />

        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-[60px] h-[60px] bg-gray-100 dark:bg-gray-800 rounded-full border-3 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-white dark:border-gray-900" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                새 멤버 추가
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                팀에 새로운 멤버를 추가하세요
              </p>
            </div>

            <div className="text-2xl">➕</div>
          </div>

          {/* Placeholder specialties */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md">
              새로운 멤버
            </span>
          </div>

          {/* Add Member Button - flex-grow to push to bottom */}
          <div className="mt-auto">
            <button
              onClick={() => setIsOpen(true)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors duration-200 rounded-lg text-center text-sm font-medium"
            >
              멤버 추가하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden w-full max-w-4xl max-h-[90vh]">
          {/* Header with specialty color */}
          <div className="bg-blue-500 h-2 w-full" />

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-2rem)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                새 멤버 추가
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {message && (
              <div
                className={`p-4 mb-6 rounded-lg ${
                  message.type === "error"
                    ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500"
                    : "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500"
                }`}
              >
                <span
                  className={`font-medium ${
                    message.type === "error"
                      ? "text-red-800 dark:text-red-200"
                      : "text-green-800 dark:text-green-200"
                  }`}
                >
                  {message.text}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="멤버 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    역할 *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
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
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  전문 분야 *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {specialtyOptions.map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleSpecialty(specialty)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.specialties.includes(specialty)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {specialty}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  자기소개 *
                </label>
                <textarea
                  required
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="자기소개를 입력하세요"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="이메일 주소"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    위치
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="위치 (예: 서울, 부산)"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GitHub
                  </label>
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        github: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="github.com/username 또는 username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        linkedin: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="linkedin.com/in/username 또는 username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    포트폴리오
                  </label>
                  <input
                    type="text"
                    value={formData.portfolio}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        portfolio: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="portfolio.com 또는 사이트 주소"
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  경력
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="주요 경력이나 프로젝트 경험을 입력하세요"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  기술 스택
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="기술 스택 추가"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  프로필 이미지
                </label>
                <div className="flex items-center gap-4">
                  {/* 미리보기 */}
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="프로필 미리보기"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  {/* 파일 업로드 버튼 */}
                  <div className="flex-1">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          업로드 중...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4" />
                          {formData.avatar ? "이미지 변경" : "이미지 선택"}
                        </span>
                      )}
                    </button>
                    {formData.avatar && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, avatar: "" }))
                        }
                        className="mt-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                      >
                        이미지 제거
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  JPG, PNG, GIF 등의 이미지 파일을 업로드하세요. (선택사항)
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? "추가 중..." : "멤버 추가"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

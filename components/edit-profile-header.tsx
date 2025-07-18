"use client";

import { useState, useRef } from "react";
import {
  Edit,
  Save,
  X,
  AlertCircle,
  User,
  Upload,
  FileText,
  Download,
  Trash2,
  Check,
  Code,
  Palette,
} from "lucide-react";
import { UserBadges } from "./user-badges";
import type { BadgeType } from "@/types/api";

// 편집 가능한 뱃지 타입 정의
type EditableBadgeType = "developer" | "designer";

interface EditProfileHeaderProps {
  memberId: string;
  initialData: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
    badges?: BadgeType[];
    resumeUrl?: string | null;
    resumeFileName?: string | null;
  };
  onProfileUpdated: () => void;
}

const roleOptions = [
  "Frontend Developer",
  "Backend Developer",
  "Full-stack Developer",
  "Mobile Developer",
  "AI/ML Engineer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Data Engineer",
  "Security Engineer",
  "Game Developer",
  "Blockchain Developer",
  "Project Manager",
  "Other",
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
    badges: (initialData.badges || []).filter(
      (badge): badge is EditableBadgeType =>
        badge === "developer" || badge === "designer"
    ),
    resumeUrl: initialData.resumeUrl || "",
    resumeFileName: initialData.resumeFileName || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Only send changed fields
      const changedFields: any = {};

      if (formData.name !== initialData.name) {
        changedFields.name = formData.name;
      }
      if (formData.role !== initialData.role) {
        changedFields.role = formData.role;
      }
      if (formData.avatar !== initialData.avatar) {
        changedFields.avatar = formData.avatar;
      }
      if (formData.bio !== initialData.bio) {
        changedFields.bio = formData.bio;
      }
      // 편집 가능한 뱃지들만 비교
      const currentEditableBadges = (initialData.badges || []).filter(
        (badge): badge is EditableBadgeType =>
          badge === "developer" || badge === "designer"
      );

      if (
        JSON.stringify(formData.badges.sort()) !==
        JSON.stringify(currentEditableBadges.sort())
      ) {
        // verified 뱃지는 보존하고 다른 뱃지들만 업데이트
        const hasVerified = (initialData.badges || []).includes("verified");
        const finalBadges: BadgeType[] = hasVerified
          ? ["verified", ...formData.badges]
          : formData.badges;
        changedFields.badges = finalBadges;
      }
      if (formData.resumeUrl !== (initialData.resumeUrl || "")) {
        changedFields.resumeUrl = formData.resumeUrl || null;
      }
      if (formData.resumeFileName !== (initialData.resumeFileName || "")) {
        changedFields.resumeFileName = formData.resumeFileName || null;
      }

      // If no fields were changed, just close the edit mode
      if (Object.keys(changedFields).length === 0) {
        setIsEditing(false);
        return;
      }

      const response = await fetch(`/api/users/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changedFields),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Profile updated successfully!");
        setIsEditing(false);
        onProfileUpdated();
        setMessage(null);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update profile.",
        });
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: initialData.name,
      role: initialData.role,
      avatar: initialData.avatar,
      bio: initialData.bio,
      badges: (initialData.badges || []).filter(
        (badge): badge is EditableBadgeType =>
          badge === "developer" || badge === "designer"
      ),
      resumeUrl: initialData.resumeUrl || "",
      resumeFileName: initialData.resumeFileName || "",
    });
    setMessage(null);
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
        alert(result.error || "Failed to upload profile image.");
      }
    } catch (error) {
      console.error("Profile image upload failed:", error);
      alert("An error occurred during profile image upload.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's an image file
      if (!file.type.startsWith("image/")) {
        alert("Only image files can be uploaded.");
        return;
      }
      handleAvatarUpload(file);
    }
  };

  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File type validation
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Only PDF and Word documents are allowed for resume.",
      });
      return;
    }

    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Resume file size cannot exceed 5MB.",
      });
      return;
    }

    setUploadingResume(true);
    setMessage(null);

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
          resumeUrl: result.url,
          resumeFileName: file.name,
        }));
        setMessage({
          type: "success",
          text: "Resume uploaded successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to upload resume.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error occurred while uploading resume.",
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleResumeDelete = () => {
    setFormData((prev) => ({
      ...prev,
      resumeUrl: "",
      resumeFileName: "",
    }));
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Profile Information
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Edit Profile"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-[64px] h-[64px] rounded-full overflow-hidden border-3 border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {initialData.avatar ? (
                <img
                  src={initialData.avatar}
                  alt={initialData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {initialData.name}
                </h3>
                <UserBadges badges={initialData.badges || []} size="md" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {initialData.role}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Bio
            </h4>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {initialData.bio}
            </p>
          </div>

          {/* Resume Download */}
          {initialData.resumeUrl && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Resume
              </h4>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <FileText className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {initialData.resumeFileName || "Resume"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Download resume file
                  </p>
                </div>
                <a
                  href={initialData.resumeUrl}
                  download={initialData.resumeFileName || "resume"}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                  title="Download resume"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Profile
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Error Message Display */}
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
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter name"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role *
          </label>
          <select
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a role</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio *
          </label>
          <textarea
            required
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter bio"
          />
        </div>

        {/* Badges */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Badges
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              {
                type: "developer" as const,
                label: "Developer",
                icon: Code,
                color: "text-green-500",
                bgColor: "bg-green-100 dark:bg-green-900/20",
              },
              {
                type: "designer" as const,
                label: "Designer",
                icon: Palette,
                color: "text-purple-500",
                bgColor: "bg-purple-100 dark:bg-purple-900/20",
              },
            ].map((badge) => {
              const isSelected = formData.badges.includes(badge.type);
              const Icon = badge.icon;

              return (
                <button
                  key={badge.type}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setFormData({
                        ...formData,
                        badges: formData.badges.filter((b) => b !== badge.type),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        badges: [...formData.badges, badge.type],
                      });
                    }
                  }}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200
                    ${
                      isSelected
                        ? `${badge.bgColor} border-current ${badge.color}`
                        : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{badge.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Select badges that represent your expertise and verification status
          </p>
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resume
          </label>
          <div className="space-y-3">
            {/* Current resume */}
            {formData.resumeUrl && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <FileText className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formData.resumeFileName || "Resume"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current resume file
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResumeDelete}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                  title="Remove resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload controls */}
            <div className="flex gap-2">
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                disabled={uploadingResume}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {uploadingResume ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {formData.resumeUrl ? "Change Resume" : "Upload Resume"}
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supported formats: PDF, DOC, DOCX (max 5MB)
            </p>
          </div>
        </div>

        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile Image
          </label>
          <div className="flex items-center gap-4">
            {/* Preview */}
            <div className="w-[64px] h-[64px] rounded-full overflow-hidden border-3 border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>

            {/* File upload button */}
            <div className="flex-1">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {uploadingAvatar ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    {formData.avatar ? "Change Image" : "Select Image"}
                  </span>
                )}
              </button>
              {formData.avatar && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: "" })}
                  className="mt-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload JPG, PNG, GIF, etc. images. (Optional)
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

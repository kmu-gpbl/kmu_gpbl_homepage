"use client";

import { useState, useRef } from "react";
import {
  Plus,
  X,
  Save,
  User,
  Upload,
  AlertCircle,
  Award,
  Building,
  Calendar,
  FileText,
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
    certifications: [] as any[],
    badges: [] as string[],
    resumeUrl: "",
    resumeFileName: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [newCert, setNewCert] = useState({
    name: "",
    organization: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
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
      // Add https:// automatically when saving
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
        setMessage({
          type: "success",
          text: "Member added successfully!",
        });
        // Reset form
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
          certifications: [],
          badges: [],
          resumeUrl: "",
          resumeFileName: "",
        });
        setNewSkill("");
        setTimeout(() => {
          setIsOpen(false);
          setMessage(null);
          onMemberAdded();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to add member.",
        });
      }
    } catch (error) {
      console.error("Failed to add member:", error);
      setMessage({ type: "error", text: "Network error occurred." });
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

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const addCertification = () => {
    if (newCert.name && newCert.organization && newCert.issueDate) {
      const certification = {
        id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newCert.name,
        organization: newCert.organization,
        issueDate: newCert.issueDate,
        expiryDate: newCert.expiryDate || null,
        credentialId: newCert.credentialId || null,
        credentialUrl: newCert.credentialUrl || null,
      };

      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, certification],
      }));

      setNewCert({
        name: "",
        organization: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
      });
    }
  };

  const removeCertification = (certId: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert.id !== certId),
    }));
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMessage(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();

      if (response.ok) {
        setFormData((prev) => ({ ...prev, avatar: result.url }));
        setMessage({
          type: "success",
          text: "Avatar uploaded successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to upload avatar.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error occurred while uploading avatar.",
      });
    } finally {
      setUploadingAvatar(false);
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
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
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

  // URL processing functions
  const processGithubUrl = (input: string) => {
    if (!input) return input;

    // If already a complete URL
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return input;
    }

    // If starts with github.com
    if (input.startsWith("github.com/")) {
      return "https://" + input;
    }

    // If only username is entered
    if (!input.includes("/") && !input.includes(".")) {
      return "https://github.com/" + input;
    }

    // Other cases (relative paths, etc.)
    return "https://" + input;
  };

  const processLinkedinUrl = (input: string) => {
    if (!input) return input;

    // If already a complete URL
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return input;
    }

    // If starts with linkedin.com
    if (input.startsWith("linkedin.com/")) {
      return "https://" + input;
    }

    // If only username is entered
    if (!input.includes("/") && !input.includes(".")) {
      return "https://linkedin.com/in/" + input;
    }

    // Other cases
    return "https://" + input;
  };

  const processPortfolioUrl = (input: string) => {
    if (!input) return input;

    // If already a complete URL
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return input;
    }

    // If only domain is entered (contains dot)
    if (input.includes(".")) {
      return "https://" + input;
    }

    // Other cases (return as is)
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

  const resetForm = () => {
    setFormData({
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
      certifications: [] as any[],
      badges: [] as string[],
      resumeUrl: "",
      resumeFileName: "",
    });
    setNewSkill("");
    setNewCert({
      name: "",
      organization: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    });
    setMessage(null);
    setUploadingAvatar(false);
    setUploadingResume(false);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
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
                Add New Member
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Add a new member to your team
              </p>
            </div>
          </div>

          {/* Placeholder specialties */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md">
              New Member
            </span>
          </div>

          {/* Add Member Button - flex-grow to push to bottom */}
          <div className="mt-auto">
            <button
              onClick={() => setIsOpen(true)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors duration-200 rounded-lg text-center text-sm font-medium"
            >
              Add Member
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
                Add New Member
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
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter member name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
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
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specialties *
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
                  Bio *
                </label>
                <textarea
                  required
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter bio"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
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
                    placeholder="Email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
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
                    placeholder="Location (e.g., Seoul, Busan)"
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
                    placeholder="github.com/username or username"
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
                    placeholder="linkedin.com/in/username or username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio
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
                    placeholder="portfolio.com or website address"
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience
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
                  placeholder="Enter main experience or project experience"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skills
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
                    placeholder="Add skill"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Add
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

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certifications
                </label>

                {/* Add New Certification */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Add New Certification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Certification Name *
                      </label>
                      <input
                        type="text"
                        value={newCert.name}
                        onChange={(e) =>
                          setNewCert({ ...newCert, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="e.g., AWS Certified Solutions Architect"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Issuing Organization *
                      </label>
                      <input
                        type="text"
                        value={newCert.organization}
                        onChange={(e) =>
                          setNewCert({
                            ...newCert,
                            organization: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="e.g., Amazon Web Services"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Issue Date *
                      </label>
                      <input
                        type="date"
                        value={newCert.issueDate}
                        onChange={(e) =>
                          setNewCert({ ...newCert, issueDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={newCert.expiryDate}
                        onChange={(e) =>
                          setNewCert({ ...newCert, expiryDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Credential ID
                      </label>
                      <input
                        type="text"
                        value={newCert.credentialId}
                        onChange={(e) =>
                          setNewCert({
                            ...newCert,
                            credentialId: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Credential ID or License Number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Credential URL
                      </label>
                      <input
                        type="url"
                        value={newCert.credentialUrl}
                        onChange={(e) =>
                          setNewCert({
                            ...newCert,
                            credentialUrl: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="URL to verify certification"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addCertification}
                    disabled={
                      !newCert.name ||
                      !newCert.organization ||
                      !newCert.issueDate
                    }
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Certification
                  </button>
                </div>

                {/* Current Certifications */}
                {formData.certifications.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Current Certifications
                    </h4>
                    <div className="space-y-2">
                      {formData.certifications.map((cert) => (
                        <div
                          key={cert.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <Award className="w-4 h-4 text-blue-500" />
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {cert.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                by {cert.organization}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCertification(cert.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar Upload */}
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
                      onChange={handleAvatarChange}
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
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, avatar: "" }))
                        }
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
                          Resume file uploaded
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResumeDelete}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                        title="Remove resume"
                      >
                        <X className="w-4 h-4" />
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
                          {formData.resumeUrl
                            ? "Change Resume"
                            : "Upload Resume"}
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supported formats: PDF, DOC, DOCX (max 5MB)
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? "Adding..." : "Add Member"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

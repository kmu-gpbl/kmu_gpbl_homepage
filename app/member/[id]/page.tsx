"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ProjectTimeline } from "@/components/project-timeline";
import { PageHeader } from "@/components/page-header";
import { AddProjectForm } from "@/components/add-project-form";
import { EditProfileHeader } from "@/components/edit-profile-header";
import { EditContactInfo } from "@/components/edit-contact-info";
import { EditSkills } from "@/components/edit-skills";
import { EditCertifications } from "@/components/edit-certifications";
import { UserBadges } from "@/components/user-badges";
import { EditModeProvider, useEditMode } from "@/contexts/edit-mode-context";
import {
  MapPin,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
  Award,
  Building,
  Calendar,
  FileText,
} from "lucide-react";

interface MemberPageProps {
  params: Promise<{ id: string }>;
}

const specialtyColors = {
  frontend: "bg-pink-500",
  backend: "bg-blue-500",
  mobile: "bg-green-500",
  ai: "bg-orange-500",
  devops: "bg-indigo-500",
};

const specialtyLabels = {
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  ai: "AI/ML",
  devops: "DevOps",
  design: "Design",
  data: "Data",
  security: "Security",
  game: "Game",
  blockchain: "Blockchain",
};

function MemberPageContent({ params }: MemberPageProps) {
  const { isEditMode } = useEditMode();
  const [member, setMember] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params;
        setMemberId(id);

        // Load member info and project info in parallel
        const [userResponse, projectsResponse] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch(`/api/projects?memberId=${id}`),
        ]);

        if (!userResponse.ok) {
          notFound();
        }

        const userData = await userResponse.json();
        const projectsData = await projectsResponse.json();

        setMember(userData.user);
        setProjects(projectsData.projects || []);
      } catch (error) {
        console.error("Data loading failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  const handleProjectAdded = async () => {
    // Refresh project list when a project is added
    try {
      const response = await fetch(`/api/projects?memberId=${memberId}`);
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Failed to refresh project list:", error);
    }
  };

  const handleMemberUpdated = async () => {
    // Refresh member info when member info is updated
    try {
      const response = await fetch(`/api/users/${memberId}`);
      if (response.ok) {
        const data = await response.json();
        setMember(data.user);
      }
    } catch (error) {
      console.error("Failed to refresh member info:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title={member.name} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Profile Header - Full Width at Top */}
          {isEditMode ? (
            <EditProfileHeader
              memberId={memberId}
              initialData={{
                name: member.name,
                role: member.role,
                avatar: member.avatar,
                bio: member.bio,
                badges: member.badges,
                resumeUrl: member.resumeUrl,
                resumeFileName: member.resumeFileName,
              }}
              onProfileUpdated={handleMemberUpdated}
            />
          ) : (
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="p-6">
                {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <img
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {member.name}
                      </h2>
                      <UserBadges badges={member.badges || []} size="md" />
                    </div>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-medium mb-4">
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Resume Download - Show in viewer mode */}
                {member.resumeUrl && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Resume
                    </h4>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.resumeFileName || "Resume"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Open resume file
                        </p>
                      </div>
                      <a
                        href={member.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                        title="Open resume"
                      >
                        Open
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Contact & Skills Only */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Info - Show edit version only in edit mode */}
              {isEditMode ? (
                <EditContactInfo
                  memberId={memberId}
                  initialData={{
                    email: member.email,
                    github: member.github,
                    linkedin: member.linkedin,
                    portfolio: member.portfolio,
                  }}
                  onContactUpdated={handleMemberUpdated}
                />
              ) : (
                <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Contact Information
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {member.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <a
                          href={`mailto:${member.email}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {member.email}
                        </a>
                      </div>
                    )}
                    {member.github && (
                      <div className="flex items-center gap-3">
                        <Github className="w-5 h-5 text-gray-400" />
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          GitHub
                        </a>
                      </div>
                    )}
                    {member.linkedin && (
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-5 h-5 text-gray-400" />
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          LinkedIn
                        </a>
                      </div>
                    )}
                    {member.portfolio && (
                      <div className="flex items-center gap-3">
                        <ExternalLink className="w-5 h-5 text-gray-400" />
                        <a
                          href={member.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Portfolio
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills - Show edit version only in edit mode */}
              {isEditMode ? (
                <EditSkills
                  memberId={memberId}
                  initialData={{
                    skills: member.skills || [],
                    specialties: member.specialties || [],
                  }}
                  onSkillsUpdated={handleMemberUpdated}
                />
              ) : (
                <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Skills & Expertise
                    </h2>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Specialties */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Specialties
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(member.specialties || []).length > 0 ? (
                          member.specialties?.map((specialty: string) => (
                            <span
                              key={specialty}
                              className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                            >
                              {specialtyLabels[
                                specialty as keyof typeof specialtyLabels
                              ] || specialty}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No specialties registered.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Technical Skills */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Technical Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(member.skills || []).length > 0 ? (
                          member.skills?.map((skill: string) => (
                            <span
                              key={skill}
                              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No technical skills registered.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Certifications - Show edit version only in edit mode */}
              {isEditMode ? (
                <EditCertifications
                  memberId={memberId}
                  initialData={{
                    certifications: member.certifications || [],
                  }}
                  onCertificationsUpdated={handleMemberUpdated}
                />
              ) : (
                <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Certifications
                    </h2>
                  </div>
                  <div className="p-6">
                    {(member.certifications || []).length > 0 ? (
                      <div className="space-y-4">
                        {(member.certifications || []).map((cert: any) => (
                          <div
                            key={cert.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Award className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {cert.name}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Building className="w-4 h-4" />
                                    <span>{cert.organization}</span>
                                  </div>
                                </div>
                              </div>
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-600 transition-colors"
                                  title="View Credential"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Issued{" "}
                                  {new Date(cert.issueDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                    }
                                  )}
                                </span>
                              </div>
                              {cert.expiryDate && (
                                <span>
                                  • Expires{" "}
                                  {new Date(cert.expiryDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                    }
                                  )}
                                </span>
                              )}
                              {cert.credentialId && (
                                <span>• ID: {cert.credentialId}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No certifications added yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Projects */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add Project Form - Only show in edit mode */}
              {isEditMode && (
                <AddProjectForm
                  memberId={memberId}
                  onProjectAdded={handleProjectAdded}
                />
              )}

              {/* Project Timeline */}
              <ProjectTimeline
                projects={projects}
                onProjectDeleted={handleProjectAdded}
                onProjectUpdated={handleProjectAdded}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MemberPage({ params }: MemberPageProps) {
  return (
    <EditModeProvider>
      <MemberPageContent params={params} />
    </EditModeProvider>
  );
}

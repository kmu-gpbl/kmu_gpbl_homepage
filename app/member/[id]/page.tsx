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
import { EditModeProvider, useEditMode } from "@/contexts/edit-mode-context";
import { MapPin, Mail, Github, Linkedin, ExternalLink } from "lucide-react";

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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Member Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Header - Show edit version only in edit mode */}
              {isEditMode ? (
                <EditProfileHeader
                  memberId={memberId}
                  initialData={{
                    name: member.name,
                    role: member.role,
                    avatar: member.avatar,
                    bio: member.bio,
                  }}
                  onProfileUpdated={handleMemberUpdated}
                />
              ) : (
                <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <img
                          src={member.avatar || "/placeholder.svg"}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {member.name}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    {member.bio && (
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              )}

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
                        {member.specialties?.map((specialty: string) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Technical Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {member.skills?.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
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

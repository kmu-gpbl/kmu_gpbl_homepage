"use client";

import { notFound, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ProjectTimeline } from "@/components/project-timeline";
import { PageHeader } from "@/components/page-header";
import { AddProjectForm } from "@/components/add-project-form";
import { EditProfileHeader } from "@/components/edit-profile-header";
import { EditContactInfo } from "@/components/edit-contact-info";
import { EditSkills } from "@/components/edit-skills";
import { EditCertifications } from "@/components/edit-certifications";
import { Loading } from "@/components/ui/loading";
import { EditModeProvider, useEditMode } from "@/contexts/edit-mode-context";

interface MemberPageProps {
  params: Promise<{ id: string }>;
}

function MemberPageContent({ params }: MemberPageProps) {
  const { isEditMode } = useEditMode();
  const router = useRouter();
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
      <Loading variant="page" size="lg" text="Loading member profile..." />
    );
  }

  if (!member) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title={member.name} onBack={() => router.push("/")} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Profile Header - Full Width at Top */}
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Contact & Skills Only */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Info */}
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

              {/* Skills */}
              <EditSkills
                memberId={memberId}
                initialData={{
                  skills: member.skills || [],
                  specialties: member.specialties || [],
                }}
                onSkillsUpdated={handleMemberUpdated}
              />

              {/* Certifications */}
              <EditCertifications
                memberId={memberId}
                initialData={{
                  certifications: member.certifications || [],
                }}
                onCertificationsUpdated={handleMemberUpdated}
              />
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

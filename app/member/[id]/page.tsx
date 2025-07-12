import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getUserById } from "@/lib/api/users";
import { getProjectsByMemberId } from "@/lib/api/projects";
import { ProjectTimeline } from "@/components/project-timeline";
import { PageHeader } from "@/components/page-header";
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

export default async function MemberPage({ params }: MemberPageProps) {
  const { id } = await params;
  const userResponse = await getUserById(id);
  const projectsResponse = await getProjectsByMemberId(id);

  if (userResponse.status === 404 || !userResponse.data) {
    notFound();
  }

  const member = userResponse.data;
  const projects = projectsResponse.data;

  const primarySpecialty = member
    .specialties[0] as keyof typeof specialtyColors;
  const colorClass = specialtyColors[primarySpecialty] || "bg-gray-500";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader showBackButton={true} showHomeButton={true} />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl mb-8 overflow-hidden">
            <div className={`${colorClass} h-4 w-full`} />

            <div className="p-8">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <Image
                    src={member.avatar || "/placeholder.svg"}
                    alt={member.name}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-gray-200 dark:border-gray-700"
                  />
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 font-medium mb-4">
                    {member.role}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {member.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-4 py-2 text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase tracking-wide rounded-md"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {member.location}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors duration-200 rounded-lg"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 hover:text-white transition-colors duration-200 rounded-lg"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {member.portfolio && (
                      <a
                        href={member.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-green-500 hover:text-white transition-colors duration-200 rounded-lg"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-purple-500 hover:text-white transition-colors duration-200 rounded-lg"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* About */}
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    소개
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {member.bio}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {member.experience}
                  </p>
                </div>
              </div>

              {/* Project Timeline */}
              {projects && projects.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      프로젝트 타임라인
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        ({projects.length}개 프로젝트)
                      </span>
                    </h2>
                  </div>
                  <div className="p-6">
                    <ProjectTimeline projects={projects} />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Skills */}
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    기술 스택
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    {member.skills.map((skill) => (
                      <div
                        key={skill}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    연락처
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{member.email}</span>
                      </a>
                    )}
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                      >
                        <Github className="w-4 h-4" />
                        <span className="text-sm">GitHub</span>
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                    {member.portfolio && (
                      <a
                        href={member.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm">포트폴리오</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

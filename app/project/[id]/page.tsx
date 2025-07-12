import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProjectWithMembersById } from "@/lib/api/projects";
import { PageHeader } from "@/components/page-header";
import {
  Calendar,
  User,
  Tag,
  Activity,
  ExternalLink,
  Github,
  Play,
  FileText,
  Link as LinkIcon,
} from "lucide-react";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

const typeColors = {
  web: "bg-blue-500",
  mobile: "bg-green-500",
  ai: "bg-orange-500",
  infrastructure: "bg-purple-500",
  other: "bg-gray-500",
};

const typeIcons = {
  web: "🌐",
  mobile: "📱",
  ai: "🤖",
  infrastructure: "🏗️",
  other: "⚙️",
};

const statusColors = {
  completed: "bg-green-500",
  ongoing: "bg-yellow-500",
  planned: "bg-gray-400",
};

const statusLabels = {
  completed: "완료",
  ongoing: "진행중",
  planned: "계획",
};

const mediaTypeIcons = {
  video: Play,
  presentation: FileText,
  url: LinkIcon,
};

const mediaTypeLabels = {
  video: "프로젝트 영상",
  presentation: "프레젠테이션",
  url: "관련 링크",
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const projectResponse = await getProjectWithMembersById(id);

  if (projectResponse.status === 404 || !projectResponse.data) {
    notFound();
  }

  const project = projectResponse.data;
  const colorClass = typeColors[project.type];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader showBackButton={true} showHomeButton={true} />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Project Header */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className={`${colorClass} h-4 w-full`} />

            <div className="p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="text-6xl">{typeIcons[project.type]}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                        {project.title}
                      </h1>
                      <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
                        {project.period}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-bold text-white ${
                        statusColors[project.status]
                      }`}
                    >
                      {statusLabels[project.status]}
                    </div>
                  </div>

                  {/* Project Type */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg">
                    <Tag className="w-4 h-4" />
                    {project.type.charAt(0).toUpperCase() +
                      project.type.slice(1)}{" "}
                    프로젝트
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                프로젝트 설명
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                {project.description}
              </p>
            </div>
          </div>

          {/* Project Media - Only show if media exists */}
          {project.media && project.media.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  프로젝트 미디어
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.media.map((media) => {
                    const IconComponent = mediaTypeIcons[media.type];
                    return (
                      <div
                        key={media.id}
                        className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                              <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {media.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {mediaTypeLabels[media.type]}
                              </p>
                            </div>
                          </div>

                          {media.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                              {media.description}
                            </p>
                          )}

                          <Link
                            href={media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            보기
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Technologies Used */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                사용된 기술
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {project.technologies.map((tech, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                프로젝트 정보
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  프로젝트 기간
                </span>
                <span className="font-semibold text-gray-900 dark:text-white ml-auto">
                  {project.period}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  프로젝트 상태
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white ml-auto ${
                    statusColors[project.status]
                  }`}
                >
                  {statusLabels[project.status]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  프로젝트 유형
                </span>
                <span className="font-semibold text-gray-900 dark:text-white ml-auto">
                  {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  팀 구성원
                </span>
                <span className="font-semibold text-gray-900 dark:text-white ml-auto">
                  {project.members.length}명
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

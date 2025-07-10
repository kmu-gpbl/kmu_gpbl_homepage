import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProjectWithMembersById } from "@/lib/api/projects";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Activity,
  ExternalLink,
  Github,
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
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />팀 페이지로 돌아가기
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Project Header */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl mb-8 overflow-hidden">
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

              {/* Team Members */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  프로젝트 팀
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.members.map((member) => (
                    <Link
                      key={member.id}
                      href={`/member/${member.id}`}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-gray-200 dark:border-gray-600"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {member.name}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          {member.role}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
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

              {/* Technologies Used */}
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    사용된 기술
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                      {project.type.charAt(0).toUpperCase() +
                        project.type.slice(1)}
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

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    빠른 실행
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  <Link
                    href="/"
                    className="flex items-center gap-3 w-full p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />팀 페이지로 돌아가기
                  </Link>
                </div>
              </div>

              {/* Project Stats */}
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    프로젝트 통계
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      사용 기술 수
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {project.technologies.length}개
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      팀 구성원
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {project.members.length}명
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      프로젝트 유형
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white capitalize">
                      {project.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    팀 구성원
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {project.members.map((member) => (
                      <Link
                        key={member.id}
                        href={`/member/${member.id}`}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Image
                          src={member.avatar}
                          alt={member.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {member.name}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            {member.role}
                          </p>
                        </div>
                      </Link>
                    ))}
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Project } from "@/types/api";

interface ProjectTimelineProps {
  projects: Project[];
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

export function ProjectTimelineComponent({ projects }: ProjectTimelineProps) {
  const [visibleItems, setVisibleItems] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleItems((prev) => {
        if (prev < projects.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 300);

    return () => clearInterval(timer);
  }, [projects.length]);

  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <div className="relative">
      {/* Timeline Start */}
      <div className="relative flex items-center mb-8">
        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-4 border-white dark:border-gray-900 animate-pulse" />
        <div className="ml-6 text-gray-500 dark:text-gray-400 font-medium">
          계속해서 새로운 프로젝트를 진행중입니다... 🚀
        </div>
      </div>

      {/* Timeline Line */}
      <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600">
        <div
          className="w-full bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
          style={{
            height: `${(visibleItems / projects.length) * 100}%`,
          }}
        />
      </div>

      {/* Timeline Items */}
      <div className="space-y-8">
        {sortedProjects.map((project, index) => (
          <div
            key={project.id}
            className={`relative flex items-start transition-all duration-500 ease-out ${
              index < visibleItems
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
          >
            {/* Timeline Dot */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={`w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 ${
                  typeColors[project.type]
                } transition-all duration-300 hover:scale-125`}
              />
              {/* Pulse Effect for Ongoing Projects */}
              {project.status === "ongoing" && (
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-yellow-400 animate-ping opacity-75" />
              )}
            </div>

            {/* Project Card */}
            <Link
              href={`/project/${project.id}`}
              className={`ml-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-gray-900 dark:hover:border-white transition-all duration-300 hover:scale-105 group cursor-pointer block ${
                index % 2 === 0 ? "hover:rotate-1" : "hover:-rotate-1"
              }`}
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeIcons[project.type]}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {project.period}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                    statusColors[project.status]
                  }`}
                >
                  {statusLabels[project.status]}
                </div>
              </div>

              {/* Project Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Hover Effect Line */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300 rounded-b-xl" />
            </Link>

            {/* Connection Line to Next Item */}
            {index < sortedProjects.length - 1 && (
              <div
                className={`absolute left-8 top-8 w-0.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-500 ${
                  index < visibleItems - 1 ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transitionDelay: `${(index + 1) * 100}ms`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export { ProjectTimelineComponent as ProjectTimeline };

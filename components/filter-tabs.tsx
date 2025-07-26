"use client";

import { useState } from "react";
import type { UserSummary } from "@/types/api";
import { MemberCard } from "./member-card";
import { AddMemberForm } from "./add-member-form";
import { Skeleton } from "./ui/skeleton";
import { useEditMode } from "@/contexts/edit-mode-context";
import {
  ArrowUpDown,
  GraduationCap,
  Briefcase,
  SortAsc,
  SortDesc,
  ChevronDown,
} from "lucide-react";

interface FilterTabsProps {
  members: UserSummary[];
  loading?: boolean;
  onMemberAdded?: () => void;
}

type SortOption =
  | "default"
  | "graduation"
  | "openToWork"
  | "nameAsc"
  | "nameDesc";

const sortOptions = [
  { key: "default" as const, label: "Default", icon: ArrowUpDown },
  {
    key: "graduation" as const,
    label: "Graduation Expected",
    icon: GraduationCap,
  },
  { key: "openToWork" as const, label: "Open to Work", icon: Briefcase },
  { key: "nameAsc" as const, label: "Name A-Z", icon: SortAsc },
  { key: "nameDesc" as const, label: "Name Z-A", icon: SortDesc },
];

type FilterCategory =
  | "all"
  | "frontend"
  | "backend"
  | "mobile"
  | "ai"
  | "devops"
  | "design";

const filterOptions = [
  {
    key: "all" as FilterCategory,
    label: "All",
    icon: "🌟",
    color: "bg-gray-900",
  },
  {
    key: "frontend" as FilterCategory,
    label: "Frontend",
    icon: "🎨",
    color: "bg-pink-500",
  },
  {
    key: "backend" as FilterCategory,
    label: "Backend",
    icon: "⚡",
    color: "bg-blue-500",
  },
  {
    key: "mobile" as FilterCategory,
    label: "Mobile",
    icon: "📱",
    color: "bg-green-500",
  },
  {
    key: "ai" as FilterCategory,
    label: "AI",
    icon: "🤖",
    color: "bg-orange-500",
  },
  {
    key: "devops" as FilterCategory,
    label: "DevOps",
    icon: "🚀",
    color: "bg-indigo-500",
  },
  {
    key: "design" as FilterCategory,
    label: "Design",
    icon: "✨",
    color: "bg-purple-500",
  },
];

export function FilterTabs({
  members,
  loading = false,
  onMemberAdded,
}: FilterTabsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const { isEditMode } = useEditMode();

  const filteredMembers = members.filter((member) => {
    if (activeFilter === "all") return true;
    return member.specialties.includes(activeFilter);
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const getCreatedAtTime = (member: UserSummary) =>
      new Date(
        (member as any).createdAt || (member as any).created_at || 0
      ).getTime();

    switch (sortBy) {
      case "default": {
        // Badge count priority, then createdAt
        const badgeCountA = (a.badges || []).length;
        const badgeCountB = (b.badges || []).length;

        if (badgeCountA !== badgeCountB) {
          return badgeCountB - badgeCountA;
        }

        return getCreatedAtTime(a) - getCreatedAtTime(b);
      }

      case "graduation": {
        // Users with seniorStudent badge first, then createdAt
        const hasGraduationA = (a.badges || []).includes("seniorStudent");
        const hasGraduationB = (b.badges || []).includes("seniorStudent");

        if (hasGraduationA !== hasGraduationB) {
          return hasGraduationB ? 1 : -1;
        }

        return getCreatedAtTime(a) - getCreatedAtTime(b);
      }

      case "openToWork": {
        // Users with openToWork badge first, then createdAt
        const hasOpenToWorkA = (a.badges || []).includes("openToWork");
        const hasOpenToWorkB = (b.badges || []).includes("openToWork");

        if (hasOpenToWorkA !== hasOpenToWorkB) {
          return hasOpenToWorkB ? 1 : -1;
        }

        return getCreatedAtTime(a) - getCreatedAtTime(b);
      }

      case "nameAsc": {
        // Name ascending, then createdAt
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) {
          return nameCompare;
        }

        return getCreatedAtTime(a) - getCreatedAtTime(b);
      }

      case "nameDesc": {
        // Name descending, then createdAt
        const nameCompare = b.name.localeCompare(a.name);
        if (nameCompare !== 0) {
          return nameCompare;
        }

        return getCreatedAtTime(a) - getCreatedAtTime(b);
      }

      default:
        return getCreatedAtTime(a) - getCreatedAtTime(b);
    }
  });

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setActiveFilter(option.key)}
            className={`px-6 py-3 text-sm font-bold transition-colors duration-200 rounded-lg ${
              activeFilter === option.key
                ? `${option.color} text-white`
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <span className="mr-2">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="flex justify-end mb-8">
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-sm font-bold"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort: {sortOptions.find((option) => option.key === sortBy)?.label}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                showSortDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showSortDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.key}
                    onClick={() => {
                      setSortBy(option.key);
                      setShowSortDropdown(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-bold transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      sortBy === option.key
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        : "text-gray-700 dark:text-gray-300"
                    } ${
                      option.key === sortOptions[0].key ? "rounded-t-lg" : ""
                    } ${
                      option.key === sortOptions[sortOptions.length - 1].key
                        ? "rounded-b-lg"
                        : ""
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showSortDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSortDropdown(false)}
        />
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {loading
          ? // Show skeleton cards while loading
            [...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden h-full min-h-[280px]"
              >
                {/* Header with specialty color skeleton */}
                <Skeleton className="h-2.5 w-full rounded-none" />

                <div className="p-6 flex flex-col h-full">
                  {/* Profile section */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <Skeleton className="w-[60px] h-[60px] rounded-full" />
                      <Skeleton className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Skeleton className="h-6 w-16 rounded-md" />
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-6 w-14 rounded-md" />
                  </div>

                  {/* View Profile Button - at bottom */}
                  <div className="mt-auto">
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            ))
          : // Show actual member cards when not loading
            sortedMembers.map((member) => (
              <div key={member.id} className="h-full">
                <MemberCard member={member} />
              </div>
            ))}

        {/* Add Member Form - Only show in edit mode and when not loading */}
        {isEditMode && !loading && (
          <div className="h-full">
            <AddMemberForm onMemberAdded={onMemberAdded || (() => {})} />
          </div>
        )}
      </div>

      {/* Empty State - Only show when not loading and no members found */}
      {!loading && filteredMembers.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-6 rounded-xl relative">
            <span className="text-3xl">🔍</span>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs">!</span>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">
            No developers found in this field
          </p>
        </div>
      )}
    </div>
  );
}

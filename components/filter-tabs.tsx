"use client";

import { useState } from "react";
import type { UserSummary } from "@/types/api";
import { MemberCard } from "./member-card";
import { AddMemberForm } from "./add-member-form";

interface FilterTabsProps {
  members: UserSummary[];
  onMemberAdded?: () => void;
}

type FilterCategory =
  | "all"
  | "frontend"
  | "backend"
  | "mobile"
  | "ai"
  | "devops";

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
];

export function FilterTabs({ members, onMemberAdded }: FilterTabsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const filteredMembers = members.filter((member) => {
    if (activeFilter === "all") return true;
    return member.specialties.includes(activeFilter);
  });

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
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

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="h-full">
            <MemberCard member={member} />
          </div>
        ))}

        {/* Add Member Form */}
        <div className="h-full">
          <AddMemberForm onMemberAdded={onMemberAdded || (() => {})} />
        </div>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
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

"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

interface TeamMemberCardProps {
  member: {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  index: number;
  onClick?: () => void;
  className?: string;
}

// Role-based color schemes
const getRoleColor = (role: string): string => {
  const roleLower = role.toLowerCase();

  if (
    roleLower.includes("lead") ||
    roleLower.includes("manager") ||
    roleLower.includes("director")
  ) {
    return "from-purple-400 to-indigo-500";
  }
  if (
    roleLower.includes("frontend") ||
    roleLower.includes("ui") ||
    roleLower.includes("ux")
  ) {
    return "from-blue-400 to-cyan-500";
  }
  if (
    roleLower.includes("backend") ||
    roleLower.includes("server") ||
    roleLower.includes("api")
  ) {
    return "from-green-400 to-emerald-500";
  }
  if (roleLower.includes("fullstack") || roleLower.includes("full-stack")) {
    return "from-orange-400 to-red-500";
  }
  if (roleLower.includes("designer") || roleLower.includes("design")) {
    return "from-pink-400 to-rose-500";
  }
  if (roleLower.includes("devops") || roleLower.includes("infra")) {
    return "from-yellow-400 to-amber-500";
  }
  if (roleLower.includes("qa") || roleLower.includes("test")) {
    return "from-teal-400 to-cyan-500";
  }

  return "from-gray-400 to-slate-500";
};

export function TeamMemberCard({
  member,
  index,
  onClick,
  className = "",
}: TeamMemberCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const gradientColor = getRoleColor(member.role);

  // Generate initials from name
  const initials = member.name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div
      className={`
        group relative bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700 rounded-xl 
        overflow-hidden
        cursor-pointer ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative p-4">
        {/* Header with avatar and basic info */}
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div
            className={`relative w-14 h-14 bg-gradient-to-br ${gradientColor} rounded-full flex items-center justify-center text-white font-bold text-lg`}
          >
            {initials}
          </div>

          {/* Name and role */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">
              {member.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate font-medium">
              {member.role}
            </p>
          </div>

          {/* Hover indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Additional info (shown on hover) */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isHovered ? "opacity-100 max-h-32" : "opacity-0 max-h-0"
          }`}
        >
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {member.email && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Mail className="w-3 h-3" />
                <span className="truncate">{member.email}</span>
              </div>
            )}

            {member.phone && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Phone className="w-3 h-3" />
                <span>{member.phone}</span>
              </div>
            )}

            {member.location && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{member.location}</span>
              </div>
            )}

            {/* Fallback message if no additional info */}
            {!member.email && !member.phone && !member.location && (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                Click to view profile
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Check, Code, Palette } from "lucide-react";
import type { BadgeType } from "@/types/api";

interface UserBadgesProps {
  badges: BadgeType[];
  size?: "sm" | "card" | "md" | "lg";
  className?: string;
}

const badgeConfig = {
  verified: {
    label: "Site operator. Reach out if assistance is needed.",
    icon: Check,
    color: "text-white",
    bgColor: "bg-blue-600 dark:bg-blue-700",
  },
  developer: {
    label: "Developer",
    icon: Code,
    color: "text-white",
    bgColor: "bg-green-600 dark:bg-green-700",
  },
  designer: {
    label: "Designer",
    icon: Palette,
    color: "text-white",
    bgColor: "bg-purple-600 dark:bg-purple-700",
  },
};

const sizeConfig = {
  sm: {
    iconSize: "w-3 h-3",
    padding: "p-1",
    tooltip: "text-xs",
  },
  card: {
    iconSize: "w-3.5 h-3.5",
    padding: "p-1.5",
    tooltip: "text-xs",
  },
  md: {
    iconSize: "w-4 h-4",
    padding: "p-1.5",
    tooltip: "text-sm",
  },
  lg: {
    iconSize: "w-5 h-5",
    padding: "p-2",
    tooltip: "text-base",
  },
};

export function UserBadges({
  badges,
  size = "md",
  className = "",
}: UserBadgesProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  const sizeStyles = sizeConfig[size];

  // 뱃지 순서 정의 (verified, developer, designer)
  const badgeOrder: BadgeType[] = ["verified", "developer", "designer"];

  // 전달받은 뱃지들을 정의된 순서대로 정렬
  const sortedBadges = badgeOrder.filter((badgeType) =>
    badges.includes(badgeType)
  );

  const handleBadgeClick = (e: React.MouseEvent) => {
    // 뱃지 클릭 시 Link 클릭 방지
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {sortedBadges.map((badgeType) => {
        const config = badgeConfig[badgeType];
        if (!config) return null;

        const Icon = config.icon;

        return (
          <div
            key={badgeType}
            className="relative z-20 group/badge"
            onClick={handleBadgeClick}
          >
            <div
              className={`
                ${config.bgColor} 
                ${sizeStyles.padding} 
                rounded-full 
                transition-all duration-200 
                hover:scale-110 
                cursor-help
              `}
            >
              <Icon className={`${sizeStyles.iconSize} ${config.color}`} />
            </div>

            {/* Tooltip */}
            <div
              className={`
                absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1
                px-2 py-1 
                bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900
                ${sizeStyles.tooltip}
                rounded
                opacity-0 group-hover/badge:opacity-100
                transition-opacity duration-200
                pointer-events-none
                whitespace-nowrap
                z-30
              `}
            >
              {config.label}
              {/* Tooltip arrow */}
              <div
                className="
                  absolute top-full left-1/2 transform -translate-x-1/2
                  border-2 border-transparent
                  border-t-gray-900 dark:border-t-gray-100
                "
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

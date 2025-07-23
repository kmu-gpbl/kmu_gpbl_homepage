"use client";

interface TechStackBadgeProps {
  tech: string;
  className?: string;
}

// Unified color for all tech badges
const defaultColor =
  "from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700";

export function TechStackBadge({ tech, className = "" }: TechStackBadgeProps) {
  return (
    <div
      className={`
        px-4 py-2 bg-gradient-to-r ${defaultColor}
        font-medium rounded-full text-sm border truncate max-w-xs
        ${className}
      `}
      title={tech}
    >
      {tech}
    </div>
  );
}

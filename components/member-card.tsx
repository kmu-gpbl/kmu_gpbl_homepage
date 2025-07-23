import Link from "next/link";
import Image from "next/image";
import type { UserSummary } from "@/types/api";
import { Github, Linkedin, ExternalLink, Shield } from "lucide-react";
import { UserBadges } from "./user-badges";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface MemberCardProps {
  member: UserSummary;
}

const specialtyColors = {
  frontend: "bg-pink-500",
  backend: "bg-blue-500",
  mobile: "bg-green-500",
  ai: "bg-orange-500",
  devops: "bg-indigo-500",
  design: "bg-purple-500",
};

const specialtyLabels = {
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  ai: "AI/ML",
  devops: "DevOps",
  design: "Design",
  data: "Data",
  security: "Security",
  game: "Game",
  blockchain: "Blockchain",
};

export function MemberCard({ member }: MemberCardProps) {
  const primarySpecialty = member
    .specialties[0] as keyof typeof specialtyColors;
  const colorClass = specialtyColors[primarySpecialty] || "bg-gray-500";

  // Generate initials from name
  const initials = member.name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <Link href={`/member/${member.id}`}>
      <div className="group bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-colors duration-200 overflow-visible h-full min-h-[280px]">
        {/* Header with specialty color */}
        <div className="overflow-hidden rounded-t-[10px]">
          <div className={`${colorClass} h-2.5 w-full`} />
        </div>

        <div className="p-6 flex flex-col h-full">
          {/* Profile section */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Avatar className="w-[60px] h-[60px] border-3 border-gray-200 dark:border-gray-700">
                <AvatarImage
                  src={member.avatar}
                  alt={member.name}
                  className="object-cover"
                />
                <AvatarFallback
                  className={`${colorClass} text-white font-bold text-lg`}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 ${colorClass} rounded-full border-2 border-white dark:border-gray-900`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 leading-tight">
                  {member.name}
                </h3>
                <UserBadges
                  badges={(member.badges || []).filter(
                    (badge) => badge !== "verified"
                  )}
                  size="card"
                />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-1 leading-tight">
                {member.role}
              </p>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2 mb-4">
            {member.specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 tracking-wide rounded-md"
              >
                {(
                  specialtyLabels[specialty as keyof typeof specialtyLabels] ||
                  specialty
                ).toUpperCase()}
              </span>
            ))}
          </div>

          {/* View Profile Button - flex-grow to push to bottom */}
          <div className="mt-auto">
            {/* Site Administrator Icon */}
            {(member.badges || []).includes("verified") && (
              <div className="flex justify-start mb-2">
                <div className="relative z-20 group/admin">
                  <div className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 cursor-help">
                    <Shield className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs rounded opacity-0 group-hover/admin:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Site Administrator
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-2 border-2 border-transparent border-t-gray-900 dark:border-t-gray-100" />
                  </div>
                </div>
              </div>
            )}

            <div className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors duration-200 rounded-lg text-center text-sm font-medium">
              View Profile
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

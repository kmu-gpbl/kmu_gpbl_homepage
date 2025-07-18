import Link from "next/link";
import Image from "next/image";
import type { UserSummary } from "@/types/api";
import { Github, Linkedin, ExternalLink } from "lucide-react";
import { UserBadges } from "./user-badges";

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

export function MemberCard({ member }: MemberCardProps) {
  const primarySpecialty = member
    .specialties[0] as keyof typeof specialtyColors;
  const colorClass = specialtyColors[primarySpecialty] || "bg-gray-500";

  return (
    <Link href={`/member/${member.id}`}>
      <div className="group bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-colors duration-200 overflow-hidden h-full">
        {/* Header with specialty color */}
        <div className={`${colorClass} h-2 w-full`} />

        <div className="p-6 flex flex-col h-full">
          {/* Profile section */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-3 border-gray-200 dark:border-gray-700 flex-shrink-0">
                <Image
                  src={member.avatar || "/placeholder.svg"}
                  alt={member.name}
                  width={60}
                  height={60}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 ${colorClass} rounded-full border-2 border-white dark:border-gray-900`}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {member.name}
                </h3>
                <UserBadges badges={member.badges || []} size="card" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {member.role}
              </p>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2 mb-4">
            {member.specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase tracking-wide rounded-md"
              >
                {specialty}
              </span>
            ))}
          </div>

          {/* View Profile Button - flex-grow to push to bottom */}
          <div className="mt-auto">
            <div className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors duration-200 rounded-lg text-center text-sm font-medium">
              View Profile
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

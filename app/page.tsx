"use client";

import { useState, useEffect } from "react";
import { MemberCard } from "@/components/member-card";
import { FilterTabs } from "@/components/filter-tabs";
import { AnimatedBackground } from "@/components/animated-background";

import { AddMemberForm } from "@/components/add-member-form";
import { EditModeProvider, useEditMode } from "@/contexts/edit-mode-context";
import { Edit, Eye } from "lucide-react";

function HomePageContent() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isEditMode } = useEditMode();

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setMembers(data.users || []);
      } catch (error) {
        console.error("Failed to load members:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const handleMemberAdded = async () => {
    // Refresh member list when a member is added
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setMembers(data.users || []);
    } catch (error) {
      console.error("Failed to refresh member list:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b-2 border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            {/* Decorative Elements */}
            <div className="flex justify-center items-center gap-4 mb-5">
              <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-purple-500"></div>
              <div className="text-3xl animate-pulse">🚀</div>
              <div className="w-20 h-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-transparent"></div>
            </div>

            {/* Main Title with Gradient and Animation */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 relative">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent animate-pulse">
                Global PBL{" "}
              </span>
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">
                Team
              </span>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 blur-xl -z-10 animate-pulse"></div>
            </h1>

            {/* Subtitle with typing effect */}
            <div className="relative mb-5">
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed">
                Innovative developers
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-bold">
                  {" "}
                  transforming the world{" "}
                </span>
                with technology
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>

            {/* Stats with Counter Animation */}
            <div className="flex flex-wrap justify-center gap-6 mb-5">
              <div className="text-center group">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  {members.length}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                  Team Members
                </div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <div className="text-center group">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  100+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                  Projects Done
                </div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <div className="text-center group">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-1">
                  24/7
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                  Innovation
                </div>
              </div>
            </div>

            {/* Floating Icons */}
            <div className="absolute top-10 left-10 animate-bounce delay-100">
              <div className="text-2xl opacity-70">💻</div>
            </div>
            <div className="absolute top-20 right-16 animate-bounce delay-300">
              <div className="text-2xl opacity-70">⚡</div>
            </div>
            <div className="absolute bottom-10 left-20 animate-bounce delay-500">
              <div className="text-2xl opacity-70">🎨</div>
            </div>
            <div className="absolute bottom-16 right-10 animate-bounce delay-700">
              <div className="text-2xl opacity-70">🚀</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <FilterTabs members={members} onMemberAdded={handleMemberAdded} />
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <EditModeProvider>
      <HomePageContent />
    </EditModeProvider>
  );
}

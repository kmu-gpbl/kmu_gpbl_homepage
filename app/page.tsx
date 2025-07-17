"use client";

import { useState, useEffect } from "react";
import { MemberCard } from "@/components/member-card";
import { FilterTabs } from "@/components/filter-tabs";
import { AnimatedBackground } from "@/components/animated-background";
import { CodeRain } from "@/components/code-rain";
import { AddMemberForm } from "@/components/add-member-form";

export default function HomePage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setMembers(data.users || []);
      } catch (error) {
        console.error("멤버 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const handleMemberAdded = async () => {
    // 멤버가 추가되면 멤버 목록을 새로고침
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setMembers(data.users || []);
    } catch (error) {
      console.error("멤버 목록 새로고침 실패:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <AnimatedBackground />
      <CodeRain />

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b-2 border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4">
              Global PBL Team
            </h1>
            {/* <p className="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">
              혁신적인 프로젝트를 통해 세상을 바꾸는 개발자들의 팀입니다.
            </p> */}
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

import { MemberCard } from "@/components/member-card";
import { FilterTabs } from "@/components/filter-tabs";
import { AnimatedBackground } from "@/components/animated-background";
import { CodeRain } from "@/components/code-rain";
import { getUsers } from "@/lib/api/users";

export default async function HomePage() {
  const usersResponse = await getUsers({ limit: 100 });
  const members = usersResponse.data;

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
          <FilterTabs members={members} />
        </div>
      </main>
    </div>
  );
}

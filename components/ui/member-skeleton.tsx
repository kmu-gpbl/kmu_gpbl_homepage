"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";

export function MemberSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader showBackButton={true} showHomeButton={true} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Profile Header Skeleton */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-[64px] h-[64px] rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>

              {/* Bio Section */}
              <div className="mb-6">
                <Skeleton className="h-5 w-12 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              {/* Resume Section */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <Skeleton className="h-5 w-16 mb-3" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Skeleton className="w-5 h-5 rounded" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Skeleton className="h-8 w-16 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Contact & Skills */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Info Skeleton */}
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="w-8 h-8 rounded-lg" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Skeleton */}
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="w-8 h-8 rounded-lg" />
                  </div>
                </div>
                <div className="p-6">
                  {/* Specialties */}
                  <div className="mb-6">
                    <Skeleton className="h-5 w-24 mb-3" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-18 rounded-full" />
                    </div>
                  </div>
                  {/* Technical Skills */}
                  <div>
                    <Skeleton className="h-5 w-32 mb-3" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-18 rounded-md" />
                      <Skeleton className="h-6 w-16 rounded-md" />
                      <Skeleton className="h-6 w-24 rounded-md" />
                      <Skeleton className="h-6 w-20 rounded-md" />
                      <Skeleton className="h-6 w-14 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications Skeleton */}
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="w-8 h-8 rounded-lg" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-5 h-5 rounded flex-shrink-0" />
                            <div>
                              <Skeleton className="h-5 w-40 mb-2" />
                              <div className="flex items-center gap-2">
                                <Skeleton className="w-4 h-4 rounded" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            </div>
                          </div>
                          <Skeleton className="w-4 h-4 rounded" />
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Skeleton className="w-4 h-4 rounded" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Projects */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Timeline Skeleton */}
              <div className="relative">
                {/* Timeline Start */}
                <div className="relative flex items-center mb-8" />

                {/* Timeline Line */}
                <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600 rounded-full">
                  <div className="w-full bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-1000 ease-out rounded-full h-full" />
                </div>

                {/* Timeline Items */}
                <div className="space-y-8">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="relative">
                      <div className="relative flex items-start">
                        {/* Timeline Dot */}
                        <div className="relative z-10 flex-shrink-0">
                          <Skeleton className="w-4 h-4 rounded-full border-4 border-white dark:border-gray-900" />
                        </div>

                        {/* Project Card */}
                        <div className="ml-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 w-full max-w-full overflow-hidden">
                          {/* Project Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                              <Skeleton className="w-6 h-6 text-2xl flex-shrink-0" />
                              <div className="min-w-0 flex-1 max-w-full">
                                <Skeleton className="h-5 w-48 mb-1" />
                                <Skeleton className="h-4 w-32 mb-1" />
                                <div className="flex items-center gap-1">
                                  <Skeleton className="w-3 h-3 rounded" />
                                  <Skeleton className="h-3 w-20" />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 min-w-fit">
                              <Skeleton className="h-6 w-20 rounded-full" />
                              <Skeleton className="w-4 h-4 rounded" />
                            </div>
                          </div>

                          {/* Project Description */}
                          <div className="mb-4 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>

                          {/* Tech Stack */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Skeleton className="h-6 w-16 rounded-md" />
                            <Skeleton className="h-6 w-20 rounded-md" />
                            <Skeleton className="h-6 w-14 rounded-md" />
                            <Skeleton className="h-6 w-18 rounded-md" />
                          </div>

                          {/* Project Media */}
                          <Skeleton className="h-40 w-full rounded-lg" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

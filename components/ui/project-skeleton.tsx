"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";

export function ProjectSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader showBackButton={true} showHomeButton={true} />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section Skeleton */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            {/* Hero Background Image Skeleton */}
            <Skeleton className="h-48 md:h-64 w-full rounded-t-2xl rounded-b-none" />

            {/* Hero Content Skeleton */}
            <div className="p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Project Icon Skeleton */}
                <div className="flex items-center">
                  <div className="relative">
                    <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-2xl" />
                    <Skeleton className="absolute -bottom-2 -right-2 w-16 h-6 rounded-full" />
                  </div>
                </div>

                {/* Project Info Skeleton */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <Skeleton className="h-12 md:h-14 lg:h-16 w-80 max-w-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-6 w-48 mb-4" />

                      {/* Quick Stats Skeleton */}
                      <div className="flex flex-wrap items-center gap-4">
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons Skeleton */}
                  <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-12 w-32 rounded-xl" />
                    <Skeleton className="h-12 w-36 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - 2 Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-2 space-y-8">
              {/* Project Description Skeleton */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-8 w-48" />
                </div>
                <div className="p-8 space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>

              {/* Media Gallery Skeleton */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
                <div className="p-8">
                  <div className="space-y-6">
                    {/* Main Media Display */}
                    <Skeleton className="aspect-video w-full rounded-xl" />

                    {/* Media Navigation */}
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      <Skeleton className="w-24 h-16 rounded-lg flex-shrink-0" />
                      <Skeleton className="w-24 h-16 rounded-lg flex-shrink-0" />
                      <Skeleton className="w-24 h-16 rounded-lg flex-shrink-0" />
                      <Skeleton className="w-24 h-16 rounded-lg flex-shrink-0" />
                    </div>

                    {/* Link Previews */}
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-32" />
                      <div className="space-y-3">
                        <Skeleton className="h-20 w-full rounded-lg" />
                        <Skeleton className="h-20 w-full rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Technologies Skeleton */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-14 rounded-full" />
                    <Skeleton className="h-8 w-18 rounded-full" />
                    <Skeleton className="h-8 w-22 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Project Information Skeleton */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-6 w-28" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members Skeleton */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                      >
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

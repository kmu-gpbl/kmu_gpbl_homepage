"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface SmartBackOptions {
  router: AppRouterInstance;
  fallbackPath: string;
  condition?: () => boolean;
}

/**
 * Smart back navigation function
 * Navigate back or use fallback path based on conditions
 */
export function smartBack({
  router,
  fallbackPath,
  condition,
}: SmartBackOptions) {
  // Use fallback if custom condition exists and is false
  if (condition && !condition()) {
    router.push(fallbackPath);
    return;
  }

  // Try back navigation first
  let backExecuted = false;
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  try {
    router.back();
    backExecuted = true;
  } catch (error) {
    // Use fallback immediately if back navigation fails
    router.push(fallbackPath);
    return;
  }

  // Check with timeout since back navigation might not work even if executed
  if (backExecuted && typeof window !== "undefined") {
    setTimeout(() => {
      if (window.location.href === currentUrl) {
        // Use fallback if URL hasn't changed after 300ms
        router.push(fallbackPath);
      }
    }, 300);
  }
}

/**
 * Smart back navigation for project pages
 */
export function smartBackForProject(
  router: AppRouterInstance,
  project?: { members?: { id: string }[] }
) {
  const fallbackPath =
    project?.members && project.members.length > 0
      ? `/member/${project.members[0].id}`
      : "/";

  smartBack({ router, fallbackPath });
}

/**
 * Smart back navigation for member pages
 */
export function smartBackForMember(router: AppRouterInstance) {
  smartBack({ router, fallbackPath: "/" });
}

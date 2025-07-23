"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { smartBack } from "@/lib/navigation-utils";

interface PageHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  onBack?: () => void;
  fallbackPath?: string;
}

export function PageHeader({
  title,
  showBackButton = true,
  showHomeButton = false,
  onBack,
  fallbackPath = "/",
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      smartBack({ router, fallbackPath });
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {showHomeButton && (
              <Link
                href="/"
                className="inline-flex items-center gap-3 px-4 py-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium rounded-lg transition-all duration-200 hover:scale-105"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
            )}
          </div>

          {title && (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          )}
        </div>
      </div>
    </header>
  );
}

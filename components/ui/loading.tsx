"use client";

import { cn } from "@/lib/utils";

interface LoadingProps {
  variant?: "page" | "inline" | "button";
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function Loading({
  variant = "page",
  size = "md",
  text = "Loading...",
  className,
}: LoadingProps) {
  const SpinLoader = ({ spinSize }: { spinSize: string }) => (
    <div className="relative">
      <div
        className={cn(
          "rounded-full border-4 border-gray-200 dark:border-gray-700",
          spinSize
        )}
      />
      <div
        className={cn(
          "absolute top-0 left-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin",
          spinSize
        )}
      />
    </div>
  );

  const sizeConfig = {
    sm: {
      spinSize: "w-6 h-6",
      textSize: "text-xs",
      spacing: "space-y-2",
    },
    md: {
      spinSize: "w-8 h-8",
      textSize: "text-sm",
      spacing: "space-y-3",
    },
    lg: {
      spinSize: "w-12 h-12",
      textSize: "text-base",
      spacing: "space-y-4",
    },
  };

  const config = sizeConfig[size];

  if (variant === "page") {
    return (
      <div
        className={cn(
          "min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center",
          className
        )}
      >
        <div className={cn("text-center", config.spacing)}>
          <div className="mb-6 flex justify-center">
            <SpinLoader spinSize={config.spinSize} />
          </div>

          <div
            className={cn(
              "font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent",
              config.textSize
            )}
          >
            {text}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className={cn("text-center", config.spacing)}>
          <div className="flex justify-center">
            <SpinLoader spinSize={config.spinSize} />
          </div>
          {text && (
            <p
              className={cn(
                "text-gray-600 dark:text-gray-400 font-medium",
                config.textSize
              )}
            >
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <SpinLoader spinSize={config.spinSize} />
        {text && (
          <span className={cn("font-medium", config.textSize)}>{text}</span>
        )}
      </div>
    );
  }

  return null;
}

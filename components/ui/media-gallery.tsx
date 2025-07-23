"use client";

import { useState, useEffect, useCallback } from "react";
import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  X,
  ZoomIn,
  Maximize2,
  MessageSquare,
} from "lucide-react";
import type { ProjectMedia } from "@/types/api";

interface MediaGalleryProps {
  media: ProjectMedia[];
  className?: string;
}

// LinkPreview component for OpenGraph data
const LinkPreview = React.memo(({ item }: { item: ProjectMedia }) => {
  const [ogData, setOgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchOpenGraphData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await fetch("/api/opengraph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: item.url }),
      });

      if (response.ok) {
        const result = await response.json();
        setOgData(result.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to fetch OpenGraph data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [item.url]);

  useEffect(() => {
    if (item.type === "url" && item.url) {
      fetchOpenGraphData();
    }
  }, [item.type, item.url, fetchOpenGraphData]);

  if (loading) {
    return (
      <div className="group transition-all duration-200 hover:scale-[1.02] min-w-0">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 ${
            item.description ? "rounded-t-xl border-b-0" : "rounded-xl"
          }`}
        >
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
              {item.title || new URL(item.url).hostname || "Link"}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
              Loading preview...
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate">
              {new URL(item.url).hostname}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </a>
        {/* Optional user description in separate connected area */}
        {item.description && (
          <div className="px-4 py-3 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 border-t-0 rounded-b-xl">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-800 dark:text-white line-clamp-3 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error || !ogData) {
    return (
      <div className="group transition-all duration-200 hover:scale-[1.02] min-w-0">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 ${
            item.description ? "rounded-t-xl border-b-0" : "rounded-xl"
          }`}
        >
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
            <ExternalLink className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
              {item.title || new URL(item.url).hostname || "Link"}
            </h4>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate">
              {new URL(item.url).hostname}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </a>
        {/* Optional user description in separate connected area */}
        {item.description && (
          <div className="px-4 py-3 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 border-t-0 rounded-b-xl">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-800 dark:text-white line-clamp-3 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group transition-all duration-200 hover:scale-[1.02] min-w-0">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 ${
          item.description ? "rounded-t-xl border-b-0" : "rounded-xl"
        }`}
      >
        {/* OpenGraph Image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
          {ogData.image ? (
            <img
              src={ogData.image}
              alt={ogData.title || item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-full h-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center"
            style={{ display: ogData.image ? "none" : "flex" }}
          >
            <ExternalLink className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* OpenGraph Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
            {ogData.title || item.title || new URL(item.url).hostname || "Link"}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mt-1">
            {ogData.description || "No description available"}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate">
            {ogData.siteName || new URL(item.url).hostname}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </a>
      {/* Optional user description in separate connected area */}
      {item.description && (
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 border-t-0 rounded-b-xl">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-800 dark:text-white line-clamp-3 leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export function MediaGallery({ media, className = "" }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Filter media types for different displays
  const visualMedia = media.filter(
    (item) => item.type === "image" || item.type === "video"
  );
  const linkMedia = media.filter((item) => item.type === "url");
  const documentMedia = media.filter((item) => item.type === "presentation");

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % visualMedia.length);
  };

  const prevLightboxImage = () => {
    setLightboxIndex(
      (prev) => (prev - 1 + visualMedia.length) % visualMedia.length
    );
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          prevLightboxImage();
          break;
        case "ArrowRight":
          nextLightboxImage();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isLightboxOpen]);

  if (media.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No media items yet
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          Media will appear here when added to the project
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Lightbox Modal - Outside of space-y-8 container */}
      {isLightboxOpen && visualMedia.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            {visualMedia.length > 1 && (
              <>
                <button
                  onClick={prevLightboxImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextLightboxImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Main content */}
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              {visualMedia[lightboxIndex]?.type === "image" ? (
                <img
                  src={visualMedia[lightboxIndex].url}
                  alt={visualMedia[lightboxIndex].title}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={visualMedia[lightboxIndex].url}
                  className="max-w-full max-h-full"
                  controls
                  autoPlay
                />
              )}
            </div>

            {/* Info bar - Bottom for both image and video */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-4 text-white">
              <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
                {visualMedia[lightboxIndex]?.title}
              </h3>
              {visualMedia[lightboxIndex]?.description && (
                <p className="text-white/80 mt-1 line-clamp-3 leading-relaxed">
                  {visualMedia[lightboxIndex].description}
                </p>
              )}
              <p className="text-white/60 text-sm mt-2">
                {lightboxIndex + 1} of {visualMedia.length}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`space-y-8 ${className}`}>
        {/* Visual Media Carousel (Images & Videos) */}
        {visualMedia.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Visual Media ({visualMedia.length})
            </h3>

            {/* Main Display */}
            <div className="relative group">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                {visualMedia[selectedIndex]?.type === "image" ? (
                  <img
                    src={visualMedia[selectedIndex].url}
                    alt={visualMedia[selectedIndex].title}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => openLightbox(selectedIndex)}
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={visualMedia[selectedIndex].url}
                      className="w-full h-full object-cover"
                      controls
                      poster=""
                    />
                  </div>
                )}

                {/* Zoom overlay for images */}
                {visualMedia[selectedIndex]?.type === "image" && (
                  <div
                    className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                    onClick={() => openLightbox(selectedIndex)}
                  >
                    <div className="bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}

                {/* Navigation arrows */}
                {visualMedia.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedIndex(
                          (prev) =>
                            (prev - 1 + visualMedia.length) % visualMedia.length
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedIndex(
                          (prev) => (prev + 1) % visualMedia.length
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Media info overlay */}
                {visualMedia[selectedIndex]?.type === "video" ? (
                  /* Video: Top overlay to avoid controls */
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
                    <h4 className="text-white font-semibold text-lg line-clamp-2 leading-tight">
                      {visualMedia[selectedIndex]?.title}
                    </h4>
                    {visualMedia[selectedIndex]?.description && (
                      <p className="text-white/80 text-sm mt-1 line-clamp-2 leading-relaxed">
                        {visualMedia[selectedIndex].description}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Image: Bottom overlay */
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h4 className="text-white font-semibold text-lg line-clamp-2 leading-tight">
                      {visualMedia[selectedIndex]?.title}
                    </h4>
                    {visualMedia[selectedIndex]?.description && (
                      <p className="text-white/80 text-sm mt-1 line-clamp-2 leading-relaxed">
                        {visualMedia[selectedIndex].description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {visualMedia.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {visualMedia.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedIndex === index
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                        />
                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/80 rounded-full p-1">
                            <Play className="w-3 h-3 text-gray-800" />
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedIndex !== index && (
                      <div className="absolute inset-0 bg-black/20"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Links Section */}
        {linkMedia.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Related Links ({linkMedia.length})
            </h3>
            <div className="grid gap-3">
              {linkMedia.map((item) => (
                <LinkPreview key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Documents Section */}
        {documentMedia.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents ({documentMedia.length})
            </h3>
            <div className="grid gap-3">
              {documentMedia.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-700 transition-all duration-200 hover:scale-[1.02] group"
                >
                  <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

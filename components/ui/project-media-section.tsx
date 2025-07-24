"use client";

import React from "react";
import MediaEditor, { MediaItem } from "./media-editor";

interface ProjectMediaSectionProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  allowUpload?: boolean;
  maxItems?: number;
}

// Memoized media section to prevent re-rendering when other form fields change
const ProjectMediaSection = React.memo(
  ({
    media,
    onChange,
    allowUpload = true,
    maxItems = 10,
  }: ProjectMediaSectionProps) => (
    <MediaEditor
      media={media}
      onChange={onChange}
      allowUpload={allowUpload}
      maxItems={maxItems}
    />
  )
);

ProjectMediaSection.displayName = "ProjectMediaSection";

export default ProjectMediaSection;

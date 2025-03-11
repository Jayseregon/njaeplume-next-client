import React from "react";
import { CircleCheckBig, Hourglass, X } from "lucide-react";

import { Progress } from "@/src/components/ui/progress";
import { ImageUploadState } from "@/src/hooks/useImageUpload";

interface ImageStatusIndicatorProps {
  status: ImageUploadState["status"];
  progress: number;
}

export const ImageStatusIndicator: React.FC<ImageStatusIndicatorProps> = ({
  status,
  progress,
}) => {
  switch (status) {
    case "existing":
      return (
        <span className="text-green-600 flex items-center gap-1 text-xs">
          <CircleCheckBig size={16} /> Existing
        </span>
      );
    case "pending":
      return (
        <span className="text-orange-600 flex items-center gap-1 text-xs">
          <Hourglass size={16} /> To Upload
        </span>
      );
    case "uploading":
      return (
        <div className="flex items-center gap-2">
          <Progress className="h-1.5 w-16" value={progress} />
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>
      );
    case "success":
      return (
        <span className="text-green-600 flex items-center gap-1 text-xs">
          <CircleCheckBig size={16} /> Uploaded
        </span>
      );
    case "error":
      return (
        <span className="text-red-600 flex items-center gap-1 text-xs">
          <X className="h-4 w-4" size={16} /> Failed
        </span>
      );
  }
};

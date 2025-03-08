"use client";

import { Loader2 } from "lucide-react";
import React from "react";

interface SpinLoaderProps {
  showText?: boolean;
}

export default function SpinLoader({ showText = false }: SpinLoaderProps) {
  return (
    <div className="absolute inset-0 flex justify-center items-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-purple-800 dark:text-purple-300" />
        {showText && (
          <span className="text-lg text-purple-800 dark:text-purple-300">
            Loading...
          </span>
        )}
      </div>
    </div>
  );
}

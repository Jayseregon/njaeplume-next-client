"use client";

import { useEffect } from "react";

export default function DisableRightClick() {
  useEffect(() => {
    // Prevent right-click on images
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.tagName === "IMG") {
        e.preventDefault();
      }
    };

    // Prevent drag on images
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;

      if (target.tagName === "IMG") {
        e.preventDefault();
      }
    };

    // Add global CSS to prevent user selection and dragging
    const style = document.createElement("style");

    style.innerHTML = `
      img {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        user-select: none;
        -webkit-user-select: none;
      }
    `;
    document.head.appendChild(style);

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.head.removeChild(style);
    };
  }, []);

  return null;
}

"use client";

import Image from "next/image";
import React from "react";

type LoadImageProps = {
  imageName: string;
  width?: number;
  height?: number;
};

export const LoadDynamicImage: React.FC<LoadImageProps> = ({
  imageName,
  width = 200,
  height = 200,
}) => {
  const imgSrc = `/docs/${imageName}.jpg`;

  return (
    <span className="flex flex-col items-center">
      <Image
        alt={imageName}
        className="shadow-xl shadow-slate-600/80 dark:shadow-teal-900/80"
        height={height}
        src={imgSrc}
        width={width}
      />
    </span>
  );
};

"use client";

import NextLink from "next/link";
import React, { useContext } from "react";

import { cn } from "@/lib/utils"; // Make sure you have this utility
import { Logo } from "@/components/icons";
import { NonceContext } from "@/app/providers";
import { siteConfig } from "@/config/site";

interface BrandProps {
  withMargin?: boolean;
}

export function Brand({ withMargin = true }: BrandProps) {
  const nonce = useContext(NonceContext);

  return (
    <NextLink
      className={cn("flex items-center gap-4", withMargin && "ml-6")}
      href="/"
      nonce={nonce}
    >
      <Logo nonce={nonce} />
      <p className="font-bold">{siteConfig.name}</p>
    </NextLink>
  );
}

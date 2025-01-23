"use client";

import NextLink from "next/link";
import React, { useContext } from "react";

import { Logo } from "@/components/icons";
import { NonceContext } from "@/app/providers";
import { siteConfig } from "@/config/site";

export function Brand() {
  const nonce = useContext(NonceContext);

  return (
    <NextLink className="flex items-center gap-4 ml-6" href="/" nonce={nonce}>
      <Logo nonce={nonce} />
      <p className="font-bold">{siteConfig.name}</p>
    </NextLink>
  );
}

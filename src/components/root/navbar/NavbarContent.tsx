"use client";

import React from "react";

import { NavbarCenter } from "@/components/root/navbar/NavbarCenter";
import { NavbarRight } from "@/components/root/navbar/NavbarRight";
import { MobileMenu } from "@/components/root/navbar/MobileMenu";
import { NavbarContentProps } from "@/src/interfaces/Root";

import { Brand } from "./Brand";

export function NavbarContent({ nonce, currentPath }: NavbarContentProps) {
  return (
    <div className="container max-w-screen-2xl mx-auto flex h-16 items-center px-0">
      <div className="flex-none">
        <Brand />
      </div>
      <NavbarCenter currentPath={currentPath} />
      <NavbarRight nonce={nonce} />
      <MobileMenu
        currentPath={currentPath}
        nonce={nonce}
      />
    </div>
  );
}

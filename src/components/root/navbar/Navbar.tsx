"use client";

import React, { useContext } from "react";
import { usePathname } from "next/navigation";

import { NonceContext } from "@/app/providers";
import { ThemeSwitch } from "@/components/root/ThemeSwitch";
import LocaleSwitcher from "@/components/root/LocaleSwitcher";
import { NavbarContent } from "@/components/root/navbar/NavbarContent";

import { UserLogin } from "../UserLogin";

export default function Navbar() {
  const nonce = useContext(NonceContext);
  const currentPath = usePathname();
  const isHomepage = currentPath === "/";

  if (isHomepage) {
    return (
      <nav className="sticky top-0 w-full bg-background">
        <div className="container max-w-(--breakpoint-2xl) mx-auto flex h-16 items-center px-0">
          <div className="flex-1" />
          <div className="flex items-center gap-1 pr-2">
            <ThemeSwitch nonce={nonce} />
            <LocaleSwitcher nonce={nonce} />
            <UserLogin nonce={nonce} />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 w-full bg-background">
      <NavbarContent currentPath={currentPath} nonce={nonce} />
    </nav>
  );
}

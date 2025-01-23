"use client";

import React, { useContext } from "react";
import { usePathname } from "next/navigation";

import { NonceContext } from "@/app/providers";

import { ThemeSwitch } from "./ThemeSwitch";
import LocaleSwitcher from "./LocaleSwitcher";
import { NavbarContent } from "./NavbarContent";

export default function Navbar() {
  const nonce = useContext(NonceContext);
  const currentPath = usePathname();
  const isHomepage = currentPath === "/";

  if (isHomepage) {
    return (
      <nav className="sticky top-0 w-full bg-background">
        <div className="container max-w-screen-2xl mx-auto flex h-16 items-center px-0">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <ThemeSwitch nonce={nonce} />
            <LocaleSwitcher nonce={nonce} />
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

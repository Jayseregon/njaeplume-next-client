"use client";

import React from "react";

import { NavbarRightProps } from "@/src/interfaces/Root";
import { SearchInput } from "@/components/root/SearchInput";
import { ThemeSwitch } from "@/components/root/ThemeSwitch";
import LocaleSwitcher from "@/components/root/LocaleSwitcher";

export function NavbarRight({ nonce }: NavbarRightProps) {
  return (
    <div className="hidden md:flex items-center gap-1">
      <SearchInput nonce={nonce} />
      <ThemeSwitch nonce={nonce} />
      <LocaleSwitcher nonce={nonce} />
    </div>
  );
}

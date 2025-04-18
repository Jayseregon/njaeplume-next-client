"use client";

import React from "react";

import { NavbarRightProps } from "@/src/interfaces/Root";
import { SearchInput } from "@/components/root/SearchInput";
import { ThemeSwitch } from "@/components/root/ThemeSwitch";
import LocaleSwitcher from "@/components/root/LocaleSwitcher";
import { UserLogin } from "@/src/components/root/UserLogin";

export function NavbarRight({ nonce }: NavbarRightProps) {
  return (
    <div className="hidden md:flex items-center gap-1 pr-2">
      <SearchInput nonce={nonce} />
      <ThemeSwitch nonce={nonce} />
      <LocaleSwitcher nonce={nonce} />
      <UserLogin nonce={nonce} />
    </div>
  );
}

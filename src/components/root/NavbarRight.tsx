"use client";

import React from "react";

import { NavbarRightProps } from "@/src/interfaces/Root";

import { SearchInput } from "./SearchInput";
import { ThemeSwitch } from "./ThemeSwitch";
import LocaleSwitcher from "./LocaleSwitcher";

export function NavbarRight({ nonce }: NavbarRightProps) {
  return (
    <div className="hidden md:flex items-center gap-4">
      <SearchInput nonce={nonce} />
      <ThemeSwitch nonce={nonce} />
      <LocaleSwitcher nonce={nonce} />
    </div>
  );
}

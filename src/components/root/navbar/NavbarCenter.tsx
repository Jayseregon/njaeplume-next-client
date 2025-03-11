"use client";

import React from "react";
import NextLink from "next/link";
import clsx from "clsx";
import { useUser } from "@clerk/nextjs";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { siteConfig, getCastleNavItemByKey } from "@/config/site";
import { NavbarCenterProps } from "@/src/interfaces/Root";

export function NavbarCenter({ currentPath }: NavbarCenterProps) {
  const { isSignedIn, user } = useUser();
  const castleItem = getCastleNavItemByKey("castle");

  return (
    <div className="hidden md:flex flex-1 justify-center">
      <NavigationMenu className="border-0 shadow-none bg-background">
        <NavigationMenuList className="flex justify-center space-x-6">
          {siteConfig.navItems.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                asChild
                className={clsx(
                  "px-4 py-2 hover:text-primary",
                  currentPath === item.href && "text-primary font-medium",
                )}
              >
                <NextLink href={item.href}>{item.label}</NextLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
          {isSignedIn &&
            user?.publicMetadata?.role === "castleAdmin" &&
            castleItem && (
              <NavigationMenuItem key={castleItem.href}>
                <NavigationMenuLink
                  asChild
                  className={clsx(
                    "px-4 py-2 hover:text-primary",
                    currentPath === castleItem.href &&
                      "text-primary font-medium",
                  )}
                >
                  <NextLink href={castleItem.href}>{castleItem.label}</NextLink>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

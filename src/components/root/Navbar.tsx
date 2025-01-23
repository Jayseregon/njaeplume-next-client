"use client";

import React, { useContext, useState } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import NextLink from "next/link";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NonceContext } from "@/app/providers";
import { siteConfig } from "@/config/site";
import { SearchInput } from "@/src/components/root/SearchInput";
import { ThemeSwitch } from "@/src/components/root/ThemeSwitch";

import LocaleSwitcher from "./LocaleSwitcher";
import { Brand } from "./Brand";

export default function Navbar() {
  const nonce = useContext(NonceContext);
  const currentPath = usePathname();
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
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
      <div className="container max-w-screen-2xl mx-auto flex h-16 items-center px-0">
        {/* Left section - Brand */}
        <div className="flex-none">
          <Brand />
        </div>

        {/* Center section - Navigation */}
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
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right section - Search & Switches */}
        <div className="hidden md:flex items-center gap-4">
          <SearchInput nonce={nonce} />
          <ThemeSwitch nonce={nonce} />
          <LocaleSwitcher nonce={nonce} />
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden ml-auto">
          <Sheet open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-3/4">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-3">
                <SearchInput alwaysExpanded={true} nonce={nonce} />
                {siteConfig.navItems.map((item) => (
                  <NextLink
                    key={item.href}
                    className={clsx(
                      "px-4 py-2 hover:text-primary",
                      currentPath === item.href && "text-primary font-medium",
                    )}
                    href={item.href}
                    onClick={() => setOpenMobileMenu(false)}
                  >
                    {item.label}
                  </NextLink>
                ))}
                <div className="flex items-center gap-3 px-4 mt-2">
                  <ThemeSwitch nonce={nonce} />
                  <LocaleSwitcher nonce={nonce} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

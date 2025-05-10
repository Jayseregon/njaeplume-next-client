"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import NextLink from "next/link";
import clsx from "clsx";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/root/SearchInput";
import { ThemeSwitch } from "@/components/root/ThemeSwitch";
import LocaleSwitcher from "@/components/root/LocaleSwitcher";
import { siteConfig } from "@/config/site";
import { MobileMenuProps } from "@/src/interfaces/Root";
import { Brand } from "@/components/root/navbar/Brand";
import { UserLogin } from "@/components/root/UserLogin";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function MobileMenu({ nonce, currentPath }: MobileMenuProps) {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  return (
    <>
      <div className="md:hidden ml-auto">
        <CartButton nonce={nonce} />
        <Sheet open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
          <SheetTrigger asChild className="mr-6">
            <Button size="icon" variant="ghost">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-3/4">
            <SheetHeader>
              <SheetTitle className="flex pt-5 justify-between items-center">
                <Brand withMargin={false} />
                <UserLogin nonce={nonce} />
              </SheetTitle>
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
              <div className="flex items-center gap-1 mt-2">
                <ThemeSwitch nonce={nonce} />
                <LocaleSwitcher nonce={nonce} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <CartDrawer />
    </>
  );
}

"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
  Link,
} from "@nextui-org/react";
import { link as linkStyles } from "@nextui-org/theme";
import React, { useContext, useState } from "react";
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import { NonceContext } from "@/app/providers";
import { SearchInput } from "@/src/components/root/SearchInput";
import { ThemeSwitch } from "@/src/components/root/ThemeSwitch";

import LocaleSwitcher from "./LocaleSwitcher";

export default function Navbar() {
  // Navbar state
  const nonce = useContext(NonceContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentPath = usePathname();
  const isHomepage = currentPath === `/` ? true : false;

  if (isHomepage) {
    return (
      <NextUINavbar
        className="bg-background"
        isMenuOpen={isMenuOpen}
        maxWidth="2xl"
        nonce={nonce}
        position="sticky"
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarContent justify="end" nonce={nonce}>
          <NavbarItem nonce={nonce}>
            <ThemeSwitch
              className="text-foreground bg-transparent hover:bg-primary-100"
              nonce={nonce}
            />
          </NavbarItem>
          <NavbarItem nonce={nonce}>
            <LocaleSwitcher nonce={nonce} />
          </NavbarItem>
        </NavbarContent>
      </NextUINavbar>
    );
  } else {
    return (
      // brand definition
      <NextUINavbar
        className="bg-background"
        isMenuOpen={isMenuOpen}
        maxWidth="2xl"
        nonce={nonce}
        position="sticky"
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarContent nonce={nonce}>
          <NavbarBrand as="li" className="gap-3 max-w-fit" nonce={nonce}>
            <NextLink
              className="flex justify-start items-center gap-4"
              href="/"
              nonce={nonce}
            >
              <Logo nonce={nonce} />
              <p className="font-bold text-inherit">{siteConfig.name}</p>
            </NextLink>
          </NavbarBrand>
        </NavbarContent>
        {/* navbar menu  */}
        <NavbarContent justify="center" nonce={nonce}>
          {/* toggle menu */}

          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            className="md:hidden"
            nonce={nonce}
          />

          {/* or list items menu */}
          <ul className="hidden md:flex items-start justify-start gap-16">
            {siteConfig.navItems.map((item) => (
              <NavbarItem key={item.href} nonce={nonce}>
                <NextLink
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "data-[active=true]:text-primary data-[active=true]:font-medium",
                  )}
                  color="foreground"
                  href={item.href}
                  nonce={nonce}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            ))}
          </ul>
        </NavbarContent>
        {/* avatar menu with theme switch and search */}
        <NavbarContent justify="end" nonce={nonce}>
          <NavbarItem className="hidden md:flex" nonce={nonce}>
            <SearchInput />
          </NavbarItem>
          <NavbarItem nonce={nonce}>
            <ThemeSwitch
              className="text-foreground bg-transparent hover:bg-primary-100"
              nonce={nonce}
            />
          </NavbarItem>
          <NavbarItem nonce={nonce}>
            <LocaleSwitcher nonce={nonce} />
          </NavbarItem>
        </NavbarContent>

        {/* menu definition when toggled */}
        <NavbarMenu nonce={nonce}>
          <SearchInput alwaysExpanded={true} />
          <div className="mx-4 mt-2 flex flex-col gap-3">
            {siteConfig.navItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`} nonce={nonce}>
                <Link
                  className="w-full"
                  color="foreground"
                  href={item.href}
                  nonce={nonce}
                  size="lg"
                  onPress={() => {
                    setIsMenuOpen((prev) => !prev);
                  }}
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
          </div>
        </NavbarMenu>
      </NextUINavbar>
    );
  }
}

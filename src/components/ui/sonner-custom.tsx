"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";
import { useTheme } from "next-themes";
import * as React from "react";

import { NonceContext } from "@/providers/RootProviders";

export function CustomToaster(props: Omit<ToasterProps, "theme" | "nonce">) {
  const { resolvedTheme } = useTheme();
  const nonce = React.useContext(NonceContext);

  return (
    <SonnerToaster
      nonce={nonce}
      theme={resolvedTheme as ToasterProps["theme"]}
      {...props}
    />
  );
}

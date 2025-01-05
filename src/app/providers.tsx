"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";

import EnvProvider from "@/components/EnvProvider";
import { validatedEnv } from "@/lib/env";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  nonce?: string;
}

export function Providers({ children, themeProps, nonce }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps} nonce={nonce}>
        <EnvProvider env={validatedEnv}>{children}</EnvProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}

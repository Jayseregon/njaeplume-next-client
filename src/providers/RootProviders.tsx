"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

// Create the NonceContext
const NonceContext = React.createContext<string | undefined>(undefined);

export { NonceContext };

export interface RootProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  nonce?: string;
}

export function RootProviders({
  children,
  themeProps,
  nonce,
}: RootProvidersProps) {
  return (
    <ClerkProvider nonce={nonce} appearance={{
      variables: {
        colorBackground: "rgb(248, 245, 238)",
        colorText: "rgb(196, 146, 136)",
      },
    }}>
      <NonceContext.Provider value={nonce}>
        <NextThemesProvider
          defaultTheme="dark"
          enableSystem={false}
          nonce={nonce}
          {...themeProps}
        >
          {children}
        </NextThemesProvider>
      </NonceContext.Provider>
    </ClerkProvider>
  );
}

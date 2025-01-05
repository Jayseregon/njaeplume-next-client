import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

import clsx from "clsx";
import { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { headers } from "next/headers";

import { siteConfig } from "@/config/site";
import {
  fontSans,
  fontMono,
  fontSerif,
  fontDisplay,
  fontSansAlt,
} from "@/config/fonts";

import { Providers } from "./providers";

type Props = {
  children: ReactNode;
  //   params: { locale: string };
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: siteConfig.icon,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  // maximumScale: 1,
  // userScalable: false,
};

export default async function RootLayout({ children }: Props) {
  const nonce = (await headers()).get("x-nonce");

  return (
    <html suppressHydrationWarning lang="en" nonce={nonce || undefined}>
      <head nonce={nonce || undefined} />
      <body
        className={clsx(
          "min-h-screen font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
          fontSerif.variable,
          fontDisplay.variable,
          fontSansAlt.variable,
        )}
        nonce={nonce || undefined}
      >
        <SpeedInsights />
        <Providers
          nonce={nonce || undefined}
          themeProps={{ attribute: "class", defaultTheme: "dark", children }}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}

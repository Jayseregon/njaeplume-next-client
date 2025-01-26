import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

import { NextIntlClientProvider } from "next-intl";
import clsx from "clsx";
import { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { headers } from "next/headers";
import Head from "next/head";
import { getLocale, getMessages } from "next-intl/server";

import Navbar from "@/components/root/navbar/Navbar";
import Footer from "@/components/root/Footer";
import { siteConfig } from "@/config/site";
import {
  fontSans,
  fontMono,
  fontSerif,
  fontDisplay,
  fontSansAlt,
} from "@/config/fonts";

import { Providers } from "./providers";

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

const locales = ["en", "fr"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") || "";
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      suppressHydrationWarning
      className="bg-background"
      lang={locale}
      {...(nonce ? { nonce } : {})}
    >
      <Head>
        <meta
          content="width=device-width, initial-scale=1"
          name="viewport"
          nonce={nonce}
        />
        <meta
          content="white"
          media="(prefers-color-scheme: light)"
          name="theme-color"
          nonce={nonce}
        />
        <meta
          content="black"
          media="(prefers-color-scheme: dark)"
          name="theme-color"
          nonce={nonce}
        />
      </Head>
      <body
        className={clsx(
          "min-h-screen font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
          fontSerif.variable,
          fontDisplay.variable,
          fontSansAlt.variable,
        )}
        nonce={nonce}
      >
        <SpeedInsights />
        <Providers
          nonce={nonce}
          themeProps={{ attribute: "class", defaultTheme: "dark", children }}
        >
          <NextIntlClientProvider messages={messages}>
            <div
              className="flex flex-col justify-between min-h-screen"
              nonce={nonce || undefined}
            >
              <Navbar />

              <main
                className="container mx-auto max-w-full px-6 grow"
                nonce={nonce || undefined}
              >
                {children}
              </main>

              <Footer nonce={nonce || undefined} />
            </div>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}

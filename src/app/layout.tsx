import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

import { NextIntlClientProvider } from "next-intl";
import clsx from "clsx";
import { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { headers } from "next/headers";
import Head from "next/head";
import { getLocale, getMessages } from "next-intl/server";
import Link from "next/link";
import Script from "next/script"; // Import Script

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
import { Toaster } from "@/components/ui/sonner";
import DisableRightClick from "@/components/DisableRightClick";
import { CartStoreProvider } from "@/providers/CartStoreProvider";
import { RootProviders } from "@/providers/RootProviders";
import UsercentricsCookieConsent from "@/components/legals/UsercentricsCookieConsent";

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
        <Link
          href="//privacy-proxy.usercentrics.eu"
          nonce={nonce}
          rel="preconnect"
        />
        <Link href="//app.usercentrics.eu" nonce={nonce} rel="preconnect" />
        {/* Add preload for the blocking script */}
        <Link
          as="script"
          href="https://privacy-proxy.usercentrics.eu/latest/uc-block.bundle.js"
          nonce={nonce || undefined}
          rel="preload"
        />
      </Head>
      {/* Load Usercentrics blocking script early */}
      <Script
        id="uc-block-bundle-script"
        nonce={nonce || undefined}
        src="https://privacy-proxy.usercentrics.eu/latest/uc-block.bundle.js"
        strategy="beforeInteractive"
      />
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
        <RootProviders
          nonce={nonce}
          themeProps={{ attribute: "class", defaultTheme: "dark", children }}
        >
          <NextIntlClientProvider messages={messages}>
            <CartStoreProvider>
              <div
                className="flex flex-col justify-between min-h-screen"
                nonce={nonce || undefined}
              >
                <Navbar />

                <main
                  className="container mx-auto max-w-full px-6 grow"
                  nonce={nonce || undefined}
                >
                  <DisableRightClick />
                  {children}
                </main>

                <Footer nonce={nonce || undefined} />
              </div>
            </CartStoreProvider>
          </NextIntlClientProvider>
        </RootProviders>
        <Toaster />
        <UsercentricsCookieConsent
          nonce={nonce}
          settingsId="f9mN3JpuDNuygD"
          translationsUrl="https://termageddon.ams3.cdn.digitaloceanspaces.com/translations/"
        />
      </body>
    </html>
  );
}

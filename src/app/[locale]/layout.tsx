import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { unstable_setRequestLocale } from "next-intl/server";

import { Navbar } from "@/components/navbar";
import { HeartFooterIcon } from "@/components/icons";

const locales = ["en", "fr"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const nonce = headers().get("x-nonce");

  unstable_setRequestLocale(locale);

  return (
    <NextIntlClientProvider messages={messages}>
      <div
        className="flex flex-col justify-between min-h-screen"
        nonce={nonce || undefined}
      >
        <Navbar locale={locale} nonce={nonce || undefined} />

        <main
          className="container mx-auto max-w-full px-6 flex-grow"
          nonce={nonce || undefined}
        >
          {children}
        </main>

        <footer
          className="w-full flex items-center justify-center py-3 text-default-300 space-x-1"
          nonce={nonce || undefined}
        >
          <span>Made with</span>
          <HeartFooterIcon size={20} />
          <span>in Canada</span>
          <span>&copy; {new Date().getFullYear()} NJAE Plume</span>
        </footer>
      </div>
    </NextIntlClientProvider>
  );
}

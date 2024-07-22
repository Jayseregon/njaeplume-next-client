import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { unstable_setRequestLocale } from "next-intl/server";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/src/components/footer";

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

        <Footer nonce={nonce || undefined} />
      </div>
    </NextIntlClientProvider>
  );
}

import { Pathnames, LocalePrefix } from "next-intl/routing";

export const defaultLocale = "en" as const;
export const locales = ["en", "fr"] as const;

export const pathnames: Pathnames<typeof locales> = {
  //   '/': '/',
};

export const localePrefix: LocalePrefix<typeof locales> = "always"; // 'always';

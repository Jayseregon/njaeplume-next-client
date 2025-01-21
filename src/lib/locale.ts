"use server";

import { cookies } from "next/headers";

import { Locale, defaultLocale } from "@/config";

const COOKIE_NAME = "NEXT_LOCALE";

/**
 * Get the user's locale from cookies.
 *
 * @returns {Promise<string>} The user's locale or the default locale if not set.
 */
export async function getUserLocale(): Promise<string> {
  return (await cookies()).get(COOKIE_NAME)?.value || defaultLocale;
}

/**
 * Set the user's locale in cookies.
 *
 * @param {Locale} locale - The locale to set.
 */
export async function setUserLocale(locale: Locale): Promise<void> {
  (await cookies()).set(COOKIE_NAME, locale);
}

/**
 * Type representing the supported locales.
 */
export type Locale = (typeof locales)[number];

/**
 * Array of supported locales.
 */
export const locales = ["en", "fr"] as const;

/**
 * Default locale.
 */
export const defaultLocale: Locale = "en";

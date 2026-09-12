export const locales = ["nb", "en"] as const;
export type Locale = (typeof locales)[number];
export const localeCookie = "vedoy_locale";
export function isLocale(value: unknown): value is Locale {
  return value === "nb" || value === "en";
}

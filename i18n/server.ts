import { getLocale, getTranslations } from "next-intl/server";
import { copyKey } from "./copy-key";

export async function getCopy() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("copy")]);
  return (source: string): string => {
    const key = copyKey(source);
    return locale === "nb" || !t.has(key) ? source : t.raw(key);
  };
}

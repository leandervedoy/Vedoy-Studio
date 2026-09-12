import { useLocale, useTranslations } from "next-intl";
import { copyKey } from "./copy-key";

export function useCopy() {
  const locale = useLocale();
  const t = useTranslations("copy");
  return (source: string): string => {
    const key = copyKey(source);
    return locale === "nb" || !t.has(key) ? source : t.raw(key);
  };
}

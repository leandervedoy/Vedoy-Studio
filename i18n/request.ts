import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { isLocale, localeCookie } from "./config";
import { copyEntries } from "../messages/copy";
import { copyKey } from "./copy-key";
import nbMessages from "../messages/nb.json";
import enMessages from "../messages/en.json";

export default getRequestConfig(async () => {
  const preference = (await cookies()).get(localeCookie)?.value;
  const locale = isLocale(preference) ? preference : "nb";
  return {
    locale,
    timeZone: "Europe/Oslo",
    messages: {
      ...(locale === "en" ? enMessages : nbMessages),
      copy: Object.fromEntries(copyEntries.map(([norwegian, english]) => [
        copyKey(norwegian),
        locale === "en" ? english : norwegian,
      ])),
    },
  };
});

import { permanentRedirect } from "next/navigation";

/** The former Vedøy News section has been consolidated under Vedoy Insights. */
export default function LegacyNewsPage() {
  permanentRedirect("/insights");
}

import { permanentRedirect } from "next/navigation";

/** Preserve old article URLs without exposing a second editorial section. */
export default function LegacyNewsArticlePage() {
  permanentRedirect("/insights");
}

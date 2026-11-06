import type { Metadata } from "next";
import MultisiteWizard from "@/components/multisite/multisite-wizard";

export const metadata: Metadata = {
  title: "Lag din nettside · Vedøy Multisite",
  description: "Finn riktig nettside for bedriften eller organisasjonen din. Se en personlig demo, hent publiserte Vedøy-priser og be om et uforpliktende tilbud.",
  robots: { index: true, follow: true }
};

export default function MultisitePage() {
  return <MultisiteWizard turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} />;
}

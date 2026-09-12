import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "@vedoy/booking/styles.css";
import "./globals.css";
import "@vedoy/notes/styles.css";
import "./marketing-navigation.css";

export const metadata: Metadata = {
  title: {
    default: "Vedøy Studio – bygg, drift og vekst på ett sted",
    template: "%s · Vedøy Studio"
  },
  description: "Vedøy Studio tilbyr nettsider, webapper, nettbutikker, hosting, IT-hjelp, design og Vedøy Growth for små og mellomstore virksomheter.",
  keywords: ["nettsider for bedrifter", "webapp utvikling", "nettbutikk", "hosting", "IT-hjelp", "Vedøy Growth", "profilprodukter"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Vedøy Studio",
    description: "Digital infrastruktur med skandinavisk enkelhet.",
    type: "website",
    locale: "nb_NO",
    siteName: "Vedøy Studio"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f5ef"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body><NextIntlClientProvider>{children}</NextIntlClientProvider></body>
    </html>
  );
}

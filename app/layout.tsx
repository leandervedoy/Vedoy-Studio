import type { Metadata, Viewport } from "next";
import "@vedoy/booking/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vedøy Studio – bygg, drift og vekst på ett sted",
    template: "%s · Vedøy Studio"
  },
  description: "Domener, hosting, booking, API-er, analyse, Vedi AI, Academy og personlig IT-hjelp samlet i én rolig plattform.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Vedøy Studio",
    description: "Digital infrastruktur med skandinavisk enkelhet.",
    type: "website",
    locale: "nb_NO"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f5ef"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nb">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vedøy Trust",
  description: "Trygg arbeidsplass, tydelige roller og enkel oppfølging."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nb"><body>{children}</body></html>;
}

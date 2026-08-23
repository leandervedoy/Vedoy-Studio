import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vedøy Shopify | Pilotintegrasjon",
  description: "Sikker Shopify-integrasjon for Vedøy Growth-piloter.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nb">
      <body>{children}</body>
    </html>
  );
}

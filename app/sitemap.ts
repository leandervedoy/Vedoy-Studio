import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.vedoystudio.no";
  const routes = ["/", "/pricing", "/booking", "/contact", "/about", "/developers", "/docs", "/news", "/tjenester/nettsider", "/tjenester/webapper", "/tjenester/ecommerce", "/tjenester/profilprodukter", "/tjenester/hosting-og-domene", "/tjenester/vedoy-growth"];
  return routes.map((route) => ({ url: `${base}${route}`, changeFrequency: "weekly", priority: route === "/" ? 1 : 0.7 }));
}

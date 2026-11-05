import type { MetadataRoute } from "next";
import { listNewsPosts } from "@/lib/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.vedoystudio.no";
  const posts = await listNewsPosts(true).catch(() => []);
  const routes = ["/", "/pricing", "/booking", "/contact", "/about", "/developers", "/docs", "/news", "/news/meninger/skriv", "/news/rss.xml", "/nettside-haugesund", "/tjenester/nettsider", "/tjenester/webapper", "/tjenester/ecommerce", "/tjenester/profilprodukter", "/tjenester/hosting-og-domene", "/tjenester/vedoy-growth"];
  return [...routes.map((route) => ({ url: `${base}${route}`, changeFrequency: "weekly" as const, priority: route === "/" ? 1 : 0.7 })), ...posts.map((post) => ({url: `${base}/news/${post.slug}`,lastModified:post.updatedAt,changeFrequency:"monthly" as const,priority:0.75}))];
}

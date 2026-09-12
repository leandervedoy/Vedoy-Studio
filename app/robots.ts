import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.vedoystudio.no";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/admin", "/api"] }, sitemap: `${base}/sitemap.xml` };
}

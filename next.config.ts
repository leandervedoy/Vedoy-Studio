import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@vedoy/booking"],
  redirects: async () => [
    { source: "/tjenester/shopify-og-commerce", destination: "/tjenester/ecommerce", permanent: true }
  ],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
};

export default createNextIntlPlugin()(nextConfig);

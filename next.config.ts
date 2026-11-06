import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { SHIELD_SITE_HEADERS, SHIELD_PRIVATE_HEADERS } from "./lib/vedoy-shield-headers.mjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@vedoy/booking"],
  redirects: async () => [
    { source: "/tjenester/shopify-og-commerce", destination: "/tjenester/ecommerce", permanent: true }
  ],
  // Vedoy Shield v1: transport/browser hardening. Does not claim application-layer encryption.
  headers: async () => [
    { source: "/(.*)", headers: SHIELD_SITE_HEADERS },
    { source: "/studio/:path*", headers: SHIELD_PRIVATE_HEADERS },
    { source: "/login", headers: SHIELD_PRIVATE_HEADERS },
    { source: "/auth/:path*", headers: SHIELD_PRIVATE_HEADERS },
    { source: "/api/auth/:path*", headers: SHIELD_PRIVATE_HEADERS },
    { source: "/api/cloud/:path*", headers: SHIELD_PRIVATE_HEADERS },
    { source: "/api/vedoy-manager/:path*", headers: SHIELD_PRIVATE_HEADERS },
    { source: "/api/team/:path*", headers: SHIELD_PRIVATE_HEADERS }
  ]
};

export default createNextIntlPlugin()(nextConfig);

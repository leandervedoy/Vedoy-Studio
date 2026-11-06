/**
 * Vedoy Shield, web hardening v1.
 * Real browser/HTTP controls for the Studio site.
 * Not end-to-end encryption, key management, a WAF, or proof of a security audit.
 */
export const SHIELD_SITE_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Preserve currently supported browser capabilities. Do not disable payments.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HTTPS-only transport for return visits, without committing all subdomains.
  { key: "Strict-Transport-Security", value: "max-age=15552000" },
  // Safe initial CSP: do not block Next.js scripts, OAuth, payment or analytics integrations.
  { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

export const SHIELD_PRIVATE_HEADERS = [
  // Never allow sensitive Studio/admin/auth pages to be embedded in frames.
  { key: "X-Frame-Options", value: "DENY" },
  // Sensitive authenticated pages and responses must not be stored by browsers or proxies.
  { key: "Cache-Control", value: "private, no-store" },
];

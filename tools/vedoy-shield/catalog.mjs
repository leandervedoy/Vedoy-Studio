/**
 * Reviewed package catalogue, 2026-11-06. A dependency is not a security control
 * until configured, tested, monitored and maintained in the host application.
 */
export const LIBRARIES = Object.freeze({
  zod: { version: "4.6.7", role: "Validate untrusted input at API and device boundaries", url: "https://zod.dev" },
  jose: { version: "6.2.15", role: "Verify and issue JWT/JWS/JWE using well-scoped keys and algorithms", url: "https://github.com/panva/jose" },
  dompurify: { version: "3.4.17", role: "Sanitize untrusted HTML in a browser DOM (not a server-only sanitizer)", url: "https://github.com/cure53/DOMPurify" },
  helmet: { version: "8.3.0", role: "HTTP security headers for Express servers", url: "https://helmetjs.github.io" },
  "express-rate-limit": { version: "8.7.3", role: "Request throttling in Express; use a shared store for multiple instances", url: "https://express-rate-limit.mintlify.app" },
  "@fastify/helmet": { version: "13.2.0", role: "HTTP security headers for Fastify v5", url: "https://github.com/fastify/fastify-helmet" },
  "@fastify/rate-limit": { version: "11.2.1", role: "Request throttling for Fastify v5; use a shared store when scaling", url: "https://github.com/fastify/fastify-rate-limit" },
  "@upstash/ratelimit": { version: "2.2.0", role: "Shared HTTP API rate limiting with an explicitly configured external Redis service", url: "https://github.com/upstash/ratelimit-js" },
  "@upstash/redis": { version: "1.41.0", role: "REST Redis client for distributed limits; verify data location and agreement", url: "https://github.com/upstash/redis-js" },
  "@simplewebauthn/server": { version: "14.0.3", role: "Passkey challenge creation and server-side verification (Node 22+)", url: "https://simplewebauthn.dev" },
  "@simplewebauthn/browser": { version: "14.0.0", role: "Browser-side WebAuthn enrollment and login (Node 22+ for tooling)", url: "https://simplewebauthn.dev" },
  mqtt: { version: "5.16.1", role: "MQTT transport for devices; requires separately configured TLS/mTLS and ACLs", url: "https://github.com/mqttjs/MQTT.js" },
  "libsodium-wrappers": { version: "0.8.4", role: "Well-studied cryptographic primitives; requires a reviewed protocol and key lifecycle", url: "https://github.com/jedisct1/libsodium.js" },
  "react-native-keychain": { version: "10.0.0", role: "Native iOS Keychain/Android Keystore for bare React Native apps", url: "https://github.com/oblador/react-native-keychain" },
  "expo-secure-store": { version: null, role: "Native encrypted local key-value storage; version MUST match Expo SDK", url: "https://docs.expo.dev/versions/latest/sdk/securestore/" },
});

export const PROFILES = Object.freeze({
  nextjs: {
    label: "Next.js website / API",
    framework: "next",
    mode: "npm",
    nodeMin: 20,
    libraries: ["zod", "jose", "dompurify"],
    note: "No headers, token verification or sanitization become active until wired into your routes and UI. DOMPurify requires a browser DOM.",
  },
  "nextjs-rate-limit": {
    label: "Next.js serverless API rate limiting (optional external service)",
    framework: "next",
    mode: "npm",
    nodeMin: 20,
    libraries: ["@upstash/ratelimit", "@upstash/redis"],
    note: "Requires configured Redis and privacy/data residency review. No endpoint is protected by installation alone. Not a local-only solution.",
  },
  express: {
    label: "Express HTTP API",
    framework: "express",
    mode: "npm",
    nodeMin: 20,
    libraries: ["helmet", "express-rate-limit", "zod", "jose"],
    note: "Register middleware and validate trust proxy/IP configuration; in-memory rate limits are not shared across replicas.",
  },
  fastify: {
    label: "Fastify v5 HTTP API",
    framework: "fastify",
    frameworkMajor: 5,
    mode: "npm",
    nodeMin: 20,
    libraries: ["@fastify/helmet", "@fastify/rate-limit", "zod", "jose"],
    note: "Register Fastify plugins and configure persistent/shared limits for production deployments.",
  },
  passkeys: {
    label: "WebAuthn passkeys (advanced, Node 22+)",
    framework: null,
    mode: "npm",
    nodeMin: 22,
    libraries: ["@simplewebauthn/server", "@simplewebauthn/browser"],
    note: "Requires a verified relying party ID, origin, challenge storage, credential persistence, anti-replay and account recovery. Not plug-and-play login.",
  },
  "node-device": {
    label: "Node.js / Raspberry Pi / IoT gateway",
    framework: null,
    mode: "npm",
    nodeMin: 20,
    libraries: ["mqtt", "zod", "jose"],
    note: "MQTT is not encryption: enforce mqtts://, broker certificate validation, per-device identity, server ACLs and signed firmware updates separately.",
  },
  "device-crypto": {
    label: "Device cryptography primitives (advanced)",
    framework: null,
    mode: "npm",
    nodeMin: 20,
    libraries: ["libsodium-wrappers"],
    note: "Requires an independently reviewed protocol, nonce management, secure key storage and rotation. No E2EE or post-quantum guarantee is provided.",
  },
  expo: {
    label: "Expo Android / iOS secure local storage",
    framework: "expo",
    mode: "expo",
    nodeMin: 20,
    libraries: ["expo-secure-store"],
    note: "Uses the local Expo CLI to resolve a compatible SDK version. Native build and platform-level configuration still required.",
  },
  "react-native": {
    label: "Bare React Native secure local storage (manual native setup)",
    framework: "react-native",
    mode: "manual",
    nodeMin: 20,
    libraries: ["react-native-keychain"],
    note: "Requires iOS pods, Android native rebuild and platform configuration. Review upstream instructions before installing.",
  },
});

for (const [id, profile] of Object.entries(PROFILES)) {
  if (new Set(profile.libraries).size !== profile.libraries.length) throw Error(`Repeated dependency in profile ${id}`);
  for (const name of profile.libraries) {
    const library = LIBRARIES[name];
    if (!library) throw Error(`Unknown library in profile ${id}: ${name}`);
    if (library.version && !/^\d+\.\d+\.\d+$/.test(library.version)) throw Error(`Invalid package pin: ${name}`);
  }
}

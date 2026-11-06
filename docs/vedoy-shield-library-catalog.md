# Vedoy Shield: opt-in Node.js security toolkit (2026-11-06)

This is a dependency installer and catalog for projects using Vedoy Shield. **Not an automatically deployed security product.** Installing a package alone does not enable encryption, authentication, validation, monitoring, or threat protection. Existing Vedoy Studio website headers live separately in `lib/vedoy-shield-headers.mjs`.

## Usage

From the Vedoy Studio repository root:

```bash
node tools/vedoy-shield/cli.mjs list
node tools/vedoy-shield/cli.mjs plan nextjs --target .
node tools/vedoy-shield/cli.mjs install nextjs --target . --apply
node tools/vedoy-shield/cli.mjs audit --target .
node --test tools/vedoy-shield/test/*.test.mjs
```

`install` without `--apply` is a dry run. `--apply` requires an explicit target folder containing `package.json`. The installer refuses unknown profiles and unsupported/non-npm package-manager setups. It does not change already declared dependencies or install packages globally. npm packages are pinned to versions reviewed on 2026-11-06, installed with `--save-exact --ignore-scripts`, and need an independently reviewed security upgrade policy. If an npm package requires install scripts or native post-install integration, use its dedicated setup workflow.

| Profile | Intended runtime | Libraries | Extra work after installation |
| --- | --- | --- | --- |
| `nextjs` | Next.js websites/APIs | `zod`, `jose`, `dompurify` | Implement schemas, JWT verification and browser HTML sanitization where needed; Next.js headers remain configured separately |
| `nextjs-rate-limit` | Next.js/Vercel serverless APIs | `@upstash/ratelimit`, `@upstash/redis` | Configure a shared Redis store, privacy/data residency review, per-endpoint limits; external provider not needed if you choose self-hosted Redis instead |
| `express` | Express | `helmet`, `express-rate-limit`, `zod`, `jose` | Register middleware, configure CSP, trust proxy, login/API limits, verify JWT claims |
| `fastify` | Fastify v5 | `@fastify/helmet`, `@fastify/rate-limit`, `zod`, `jose` | Register plugins, verify compatibility and distributed rate-limit storage |
| `passkeys` | Browser + Node 22+ server | `@simplewebauthn/server`, `@simplewebauthn/browser` | Implement challenge store, RP ID/origin validation, persistence, account recovery, anti-replay |
| `node-device` | Node on Raspberry Pi/IoT gateway | `mqtt`, `zod`, `jose` | Enable `mqtts://`, broker TLS cert validation/mTLS, per-device credentials, ACLs and message schemas |
| `device-crypto` | Advanced Node device cryptography | `libsodium-wrappers` | Protocol review, secure key storage, nonces, randomness, key rotation; **not an E2EE product** |
| `expo` | Expo Android/iOS | `expo-secure-store` via local Expo CLI | SDK-compatible version, native builds, backup rules and biometric platform setup. No secure-store equivalent for web |
| `react-native` | Bare RN Android/iOS | `react-native-keychain` | **Manual only:** native install, iOS pod install, rebuild and platform testing |

## Threat model and safety defaults

- The catalog is allowlisted: no arbitrary package names, shell commands or global installs. All installs require `--apply`; unknown profiles fail closed.
- Already-declared packages are **not overwritten**. Review or upgrade those explicitly; out-of-date versions and transitive vulnerabilities remain your responsibility.
- npm package scripts are disabled on supported npm installations. This reduces one supply-chain risk but can make some native packages incomplete. Review upstream source/maintenance, run `npm audit`, test, and commit the lockfile before shipping.
- Configuring CSP or Helmet can break payments, OAuth, embedded demos and analytics. Test in preview with production-like traffic before enabling restrictive policies.
- Never put encryption secrets, API keys or device credentials in frontend bundles. Use environment secrets, hardware-backed key storage where available, and minimum privileges.
- Do not use MQTT without TLS and authorization. Do not treat libsodium as a ready-made Signal Protocol or as post-quantum encryption.
- External Upstash endpoints may store/receive identifiers; confirm data location and GDPR arrangements before use. Self-hosted Redis or other shared store is a separate option.
- Expo SecureStore is for small local secrets, not entire databases or cloud backups. The React Native profile needs native rebuilding.
- Device security also requires OS and firmware patching, secure boot when supported, signed updates, certificate lifecycle and physical-access controls; Node packages do not replace these controls.

## Sources

- https://helmetjs.github.io/
- https://github.com/panva/jose
- https://zod.dev/
- https://github.com/cure53/DOMPurify
- https://simplewebauthn.dev/docs/packages/server
- https://docs.expo.dev/versions/latest/sdk/securestore/
- https://github.com/mqttjs/MQTT.js
- https://github.com/jedisct1/libsodium.js

This tool intentionally does not make unsolicited changes to existing Studio production authentication, API routes, devices, databases, or hosting settings. Vercel deployment status must be verified separately.

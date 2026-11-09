# Vedøy Studio: Baseline JavaScript build policy

## Production target

The marketing site uses **Next.js 16**, which already supports modern browsers (Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+). We explicitly set:

```json
"browserslist": ["baseline widely available"]
```

This tells Browserslist-aware tooling that the site targets browsers with **Baseline Widely Available** web features. It is intentionally not `esnext`, which could ship newer, non-Baseline features unsupported by some visitors. Next.js retains its own SWC/Turbopack transforms for TypeScript/JSX, bundling, and features that genuinely require lowering; **no configuration can guarantee that every transformation is eliminated**.

TypeScript target remains `ES2022` for typechecking. With `noEmit: true`, tsconfig does not itself emit client JavaScript: the Next.js build is responsible for production code generation.

## Why ES6+ without ES5 transforms?

Browsers have natively supported ES2015 (ES6) modules and most core syntax for years. Sending ES5-compatible versions to modern browsers often makes bundles larger, duplicates polyfills, and adds avoidable parse/execute work. Google's Chrome DevTools / Lighthouse **Legacy JavaScript** diagnostic detects unnecessary Baseline-related transforms/polyfills; its performance audit warns after >5 KiB. Source: https://developer.chrome.com/docs/performance/insights/legacy-javascript

## Validation before merge

1. Run `npm ci`, `npm run typecheck`, `npm run test`, and `npm run build` on this PR. Inspect resulting browser build output.
2. Run Chrome DevTools Lighthouse (mobile & desktop) against the **preview** URL. Check Legacy JavaScript, shipped JavaScript and Core Web Vitals against the current production build.
3. Verify interactive pages including booking, payments, login, Growth, builder and embedded Studio experiences on the oldest browser versions returned by the resolved Browserslist query.
4. Inspect actual visitors' browser distribution before widening the browser-support cutoff. If old browsers matter, add an explicitly scoped compatibility build rather than globally enabling ES5 transforms.
5. Confirm the installed Browserslist version understands the `baseline widely available` query. If it doesn't, upgrade deliberately using the lockfile and test, or revert this setting; do **not** silently substitute an older target.

The separate legacy Vue/Vite 5 repository `Vedoystudio` is **not** the linked production Next.js deployment and is not changed by this PR. Vite 5 supports `build.target` if that repository later needs a matching modernization.

## Security

Browser targets do **not** change TLS, Content-Security-Policy, sandboxing, secrets, authentication, encryption or Vedøy Shield protections. Keep the Shield security headers and tests intact.

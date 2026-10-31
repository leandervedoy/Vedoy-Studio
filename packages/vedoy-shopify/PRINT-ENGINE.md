# Vedøy Print Engine

**Current status:** Developer preview. Standalone artwork editor and portable renderer; **not** a production Shopify app and **no live provider fulfilment**.

## What works

- Visit `/print` on the Vedøy Shopify pilot (package `packages/vedoy-shopify`).
- 3 normalized poster sizes (A4, 30 × 40 cm, 20 × 20 cm).
- Add, move, rotate, recolor and reorder text/image layers.
- Print-ready pixel dimensions at nominal 300 DPI; client-side PNG export.
- Browser-local draft, JSON export/import.
- `GET /api/print/catalog` and `GET /api/print/status`.
- Core functions: `validateDesign`, `renderPrintSvg`, `outputPixels`, `estimateImageDpi` in `lib/print-engine/core.ts`.

## Start

From the root repository:

```sh
npm install
npm run dev:shopify
```

Navigate to `http://localhost:3101/print`.

## Critical limits

- No checkout, saved production orders, Shopify OAuth, app extension, merchant billing, fulfilment API or backend file storage. Images are stored only in the local browser draft.
- The 300 DPI label refers to **canvas pixel dimensions**, not guaranteed visual quality of uploaded photographs. A lower-resolution input can be blurry. Non-embedded system fonts may differ across production machines.
- SVG is generated for local preview. Never accept raw user-supplied SVG or expose the preview outside the trusted editor.
- Print boundaries and bleeds need per-SKU calibration to the manufacturer. Files here use zero bleed by default. **Do not send a live order based on these presets alone**.
- Large images can exceed mobile-browser memory; the UI limits image files to 4 MB and 40 MP each. The serialized draft may exceed localStorage quota.
- Client-local drafts are not encrypted; do not upload sensitive personal photographs on a shared device.

## Next integration gates

1. Persistent tenant-bound designs, private bucket, automatic metadata stripping, retention/deletion workflow.
2. Separate supplier adapters with product capability mapping, quote validation and webhook verification.
3. Server-side order workflow with a durable idempotency ledger and verified Shopify payment.
4. Public Shopify app OAuth, HMAC, per-shop access, checkout line-item properties and verified theme block.
5. Automated quality checks for print dimensions, bleed, vendor SKU and a sample-order run.

Review security boundaries before enabling any production purchase. No POD keys should be prefixed `NEXT_PUBLIC_`.

import assert from "node:assert/strict";
import test from "node:test";
import { PRINT_PRODUCTS, estimateImageDpi, outputPixels, renderPrintSvg, starterDesign, validateDesign } from "../lib/print-engine/core.ts";
test("catalog has sensible A4 dimensions", () => {
 const px = outputPixels(PRINT_PRODUCTS[0]);
 assert.equal(px.width, 2480); assert.equal(px.height, 3508);
});
test("valid starter designs for all presets", () => {
 for (const p of PRINT_PRODUCTS) assert.equal(validateDesign(starterDesign(p.id)).productId, p.id);
});
test("SVG renderer escapes untrusted text", () => {
 const design = starterDesign();
 design.layers[0] = { ...design.layers[0], text: "<script>alert(1)</script>&" };
 const svg = renderPrintSvg(design);
 assert.ok(svg.includes("&lt;script&gt;")); assert.ok(!svg.includes("<script>"));
});
test("rejects unsupported products and duplicate layer IDs", () => {
 assert.throws(() => validateDesign({ ...starterDesign(), productId: "hacked" }));
 const d = starterDesign(); d.layers.push({ ...d.layers[0] });
 assert.throws(() => validateDesign(d));
});
test("rejects inline svg and html image injection", () => {
 const d = starterDesign();
 d.layers.push({ kind: "image", id: "img", x: 500, y: 600, width: 200, height: 200, rotation: 0, dataUrl: "data:image/svg+xml;base64,PHN2Zz4=" });
 assert.throws(() => validateDesign(d));
});
test("image effective DPI estimate", () => { assert.ok(estimateImageDpi(3000, 500, PRINT_PRODUCTS[0]) > 600); });

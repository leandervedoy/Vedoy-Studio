// Vedøy Print Engine — portable product/renderer core. No supplier dependencies.
export const PRINT_PRODUCTS = [
  { id: "poster-a4", label: "Kunstplakat A4", widthMm: 210, heightMm: 297, dpi: 300, bleedMm: 0, category: "poster" },
  { id: "poster-30x40", label: "Kunstplakat 30 × 40", widthMm: 300, heightMm: 400, dpi: 300, bleedMm: 0, category: "poster" },
  { id: "poster-square", label: "Kvadratisk plakat 20 × 20", widthMm: 200, heightMm: 200, dpi: 300, bleedMm: 0, category: "poster" }
] as const;
export type PrintProduct = (typeof PRINT_PRODUCTS)[number];
export type ProductId = PrintProduct["id"];
export type FontChoice = "sans" | "serif" | "mono";
export type TextLayer = {
  id: string; kind: "text"; x: number; y: number; text: string; size: number;
  color: string; font: FontChoice; rotation: number;
};
export type ImageLayer = {
  id: string; kind: "image"; x: number; y: number; width: number; height: number;
  dataUrl: string; rotation: number;
};
export type PrintLayer = TextLayer | ImageLayer;
export type PrintDesign = { version: 1; productId: ProductId; background: string; layers: PrintLayer[] };
export const PRINT_MAX_LAYERS = 24;
const HEX = /^#[\da-fA-F]{6}$/;
const SAFE_IMAGE = /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/;
const FONTS: Record<FontChoice,string> = { sans: "Arial, Helvetica, sans-serif", serif: "Georgia, Times New Roman, serif", mono: "Courier New, monospace" };
export const productById = (id: string): PrintProduct | undefined => PRINT_PRODUCTS.find(p => p.id === id);
export const viewBoxFor = (product: PrintProduct) => ({
  width: 1000, height: Math.round(1000 * product.heightMm / product.widthMm)
});
export const outputPixels = (product: PrintProduct) => ({
  width: Math.round(product.widthMm / 25.4 * product.dpi),
  height: Math.round(product.heightMm / 25.4 * product.dpi)
});
export function starterDesign(productId: ProductId = "poster-a4"): PrintDesign {
  const product = productById(productId)!;
  const { height } = viewBoxFor(product);
  return { version: 1, productId, background: "#f8f6ef", layers: [
    { id: "headline", kind: "text", x: 500, y: Math.round(height * .40), text: "Et lite øyeblikk", size: 70, color: "#242823", font: "serif", rotation: 0 },
    { id: "subtitle", kind: "text", x: 500, y: Math.round(height * .49), text: "verdt å ta vare på.", size: 33, color: "#596356", font: "sans", rotation: 0 }
  ] };
}
function record(value: unknown): Record<string,unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Ugyldig objekt.");
  return value as Record<string,unknown>;
}
function numberIn(value: unknown, min: number, max: number, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new Error("Ugyldig " + field + ".");
  return value;
}
function stringIn(value: unknown, max: number, field: string): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error("Ugyldig " + field + ".");
  return value;
}
function colorIn(value: unknown): string {
  if (typeof value !== "string" || !HEX.test(value)) throw new Error("Ugyldig farge.");
  return value;
}
export function validateDesign(input: unknown): PrintDesign {
  const raw = record(input);
  if (raw.version !== 1) throw new Error("Ukjent designversjon.");
  const product = productById(String(raw.productId || ""));
  if (!product) throw new Error("Ukjent produkt.");
  const dimensions = viewBoxFor(product);
  if (!Array.isArray(raw.layers) || raw.layers.length > PRINT_MAX_LAYERS) throw new Error("For mange lag.");
  const seen = new Set<string>();
  const layers: PrintLayer[] = raw.layers.map((value: unknown) => {
    const r = record(value);
    const id = stringIn(r.id, 64, "lag-ID");
    if (!/^[A-Za-z0-9_-]+$/.test(id) || seen.has(id)) throw new Error("Duplikat eller ugyldig lag-ID.");
    seen.add(id);
    const x = numberIn(r.x, -500, 1500, "x-posisjon");
    const y = numberIn(r.y, -500, dimensions.height + 500, "y-posisjon");
    const rotation = numberIn(r.rotation, -180, 180, "rotasjon");
    if (r.kind === "text") {
      const font = r.font;
      if (font !== "sans" && font !== "serif" && font !== "mono") throw new Error("Ukjent skrifttype.");
      const text = stringIn(r.text, 280, "tekst");
      if (text.split("\n").length > 5) throw new Error("Maks fem tekstlinjer.");
      return { id, kind: "text", x, y, rotation, font, text, color: colorIn(r.color), size: numberIn(r.size, 10, 220, "tekststørrelse") };
    }
    if (r.kind === "image") {
      const dataUrl = stringIn(r.dataUrl, 8_000_000, "bildefil");
      if (!SAFE_IMAGE.test(dataUrl)) throw new Error("Kun base64 PNG, JPG eller WebP.");
      return { id, kind: "image", x, y, rotation, dataUrl, width: numberIn(r.width, 1, 1500, "bredde"), height: numberIn(r.height, 1, 1700, "høyde") };
    }
    throw new Error("Ukjent lagtype.");
  });
  return { version: 1, productId: product.id, background: colorIn(raw.background), layers };
}
function xml(value: string): string {
  return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}
export function renderPrintSvg(input: unknown): string {
  const design = validateDesign(input);
  const product = productById(design.productId)!;
  const box = viewBoxFor(product), pixels = outputPixels(product);
  const body = design.layers.map(layer => {
    if (layer.kind === "image") return '<image href="' + layer.dataUrl + '" x="' + (layer.x - layer.width / 2) + '" y="' + (layer.y - layer.height / 2) + '" width="' + layer.width + '" height="' + layer.height + '" preserveAspectRatio="xMidYMid meet" transform="rotate(' + layer.rotation + ' ' + layer.x + ' ' + layer.y + ')"/>';
    const lines = layer.text.split("\n");
    return '<text x="' + layer.x + '" y="' + layer.y + '" transform="rotate(' + layer.rotation + ' ' + layer.x + ' ' + layer.y + ')" text-anchor="middle" font-size="' + layer.size + '" font-family="' + xml(FONTS[layer.font]) + '" fill="' + layer.color + '">' +
      lines.map((line, i) => '<tspan x="' + layer.x + '" dy="' + (i === 0 ? 0 : 1.18 * layer.size) + '">' + xml(line) + '</tspan>').join("") + '</text>';
  }).join("");
  return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + pixels.width + '" height="' + pixels.height + '" viewBox="0 0 ' + box.width + ' ' + box.height + '">' +
    '<rect width="100%" height="100%" fill="' + design.background + '"/>' + body + '</svg>';
}
export function estimateImageDpi(imagePx: number, layerWidth: number, product: PrintProduct): number {
  if (!Number.isFinite(imagePx) || imagePx <= 0 || layerWidth <= 0) return 0;
  return Math.round(imagePx / (layerWidth / 1000 * product.widthMm / 25.4));
}

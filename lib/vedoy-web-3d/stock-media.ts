/**
 * Vedoy Stock Media adapter for Web 3D Engine.
 * Catalog metadata is not proof of license: only verified assets are importable.
 */
export type Stock3DAsset = {
  id: string;
  title: string;
  creator: string;
  source: "vedoy" | "polyhaven" | "kenney" | "quaternius" | "sketchfab";
  sourceUrl: string;
  modelUrl: string;
  license: "CC0-1.0" | "CC-BY-4.0" | "other";
  licenseVerifiedAt?: string;
  attribution?: string;
  redistributionAllowed: boolean;
  format: "glb" | "gltf";
  tags: string[];
};
export type Stock3DCatalog = {
  search(query: string, options?: { cc0Only?: boolean }): Promise<Stock3DAsset[]>;
  get(id: string): Promise<Stock3DAsset | null>;
};
export class VedoyStockMediaAdapter {
  constructor(private readonly catalog: Stock3DCatalog) {}
  async search(query: string, cc0Only = true) {
    const assets = await this.catalog.search(query, { cc0Only });
    return assets.filter(asset => asset.licenseVerifiedAt && (!cc0Only || asset.license === "CC0-1.0"));
  }
  async resolveImport(id: string) {
    const asset = await this.catalog.get(id);
    if (!asset) throw new Error("3D asset not found");
    if (!asset.licenseVerifiedAt) throw new Error("Asset license not verified");
    if (!asset.redistributionAllowed) throw new Error("Asset is not approved for redistribution");
    if (asset.license !== "CC0-1.0" && asset.license !== "CC-BY-4.0")
      throw new Error("Asset license requires manual review");
    const url = new URL(asset.modelUrl);
    if (url.protocol !== "https:") throw new Error("Only HTTPS asset URLs are supported");
    if (!["glb", "gltf"].includes(asset.format)) throw new Error("Unsupported model format");
    return { asset, url: url.toString(), attribution: asset.attribution ?? null };
  }
}

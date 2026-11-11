/** Project language/framework choices for the Vedoy Web 3D Engine editor. */
export const VEDOY_PROJECT_TARGETS = [
  "vedoy-framework", "vedoyscript", "typescript", "javascript",
  "html", "css", "react", "vue", "nextjs"
] as const;
export type VedoyProjectTarget = typeof VEDOY_PROJECT_TARGETS[number];
export type VedoyProjectConfig = {
  name: string;
  framework: "vedoy-framework" | "react" | "vue" | "nextjs" | "vanilla";
  language: "vedoyscript" | "typescript" | "javascript";
  styles: "css";
  output: "web";
};
export const DEFAULT_VEDOY_PROJECT: VedoyProjectConfig = {
  name: "My Vedoy 3D Project",
  framework: "vedoy-framework",
  language: "vedoyscript",
  styles: "css",
  output: "web"
};
/** Placeholder contract: VedoyScript needs a compiler/runtime before it can execute. */
export function validateProjectConfig(config: VedoyProjectConfig) {
  if (!config.name.trim()) throw new Error("Project name is required");
  return config;
}

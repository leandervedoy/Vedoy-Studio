import type { ServiceRenderType, StudioService } from "@/lib/services";

export type ServiceInput = Omit<StudioService, "id" | "number">;

const renderTypes = new Set<ServiceRenderType>(["general", "website", "webapp", "store", "hosting", "clothing", "ecommerce"]);

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function lines(value: unknown) {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split("\n") : [];
  return source.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 240)).filter(Boolean).slice(0, 20);
}

export function serviceInput(body: Record<string, unknown> | null): ServiceInput {
  const renderType = text(body?.renderType, 20) as ServiceRenderType;
  return {
    slug: text(body?.slug, 80).toLowerCase().replace(/[^a-z0-9æøå-]+/g, "-").replace(/^-|-$/g, ""),
    title: text(body?.title, 120),
    cardText: text(body?.cardText, 320),
    eyebrow: text(body?.eyebrow, 160),
    lead: text(body?.lead, 320),
    introduction: text(body?.introduction, 1600),
    deliverables: lines(body?.deliverables),
    focus: lines(body?.focus),
    process: lines(body?.process),
    nextStep: text(body?.nextStep, 600),
    renderType: renderTypes.has(renderType) ? renderType : "general",
    published: body?.published === true,
    sortOrder: Math.max(0, Math.min(9999, Math.round(Number(body?.sortOrder) || 0)))
  };
}

export function validateServiceInput(input: ServiceInput): string | null {
  if (!input.title || input.title.length < 2) return "Skriv inn et tjenestenavn.";
  if (!input.slug || input.slug.length < 2) return "Skriv inn en gyldig URL-identifikator.";
  if (!input.cardText || !input.lead || !input.introduction) return "Korttekst, hovedbudskap og introduksjon må fylles ut.";
  if (!input.deliverables.length || !input.process.length) return "Legg til minst ett leveransepunkt og ett prosessteg.";
  return null;
}

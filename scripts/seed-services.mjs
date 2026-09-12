import fs from "node:fs/promises";

const renderTypes = {
  nettsider: "website", webapper: "webapp", nettbutikk: "store", "hosting-og-domene": "hosting",
  profilprodukter: "clothing", ecommerce: "ecommerce"
};

export async function seedServices(sql) {
  const source = await fs.readFile(new URL("../lib/services.ts", import.meta.url), "utf8");
  const match = source.match(/export const studioServices: StudioService\[\] = (\[[\s\S]*?\n\]);\n\nfunction fallbackService/);
  if (!match) throw new Error("Fant ikke standardtjenestene i lib/services.ts.");
  // The source is a trusted, repository-owned array literal used only by this migration script.
  const studioServices = Function(`"use strict"; return (${match[1]});`)();
  for (const [index, service] of studioServices.entries()) {
    await sql`
      insert into studio_services (
        id, organization_id, number, slug, title, card_text, eyebrow, lead, introduction,
        deliverables, focus, process, next_step, render_type, published, sort_order
      ) values (
        ${`service_${service.slug}`}, 'org_vedoy', ${service.number}, ${service.slug}, ${service.title},
        ${service.cardText}, ${service.eyebrow}, ${service.lead}, ${service.introduction},
        ${JSON.stringify(service.deliverables)}, ${JSON.stringify(service.focus)}, ${JSON.stringify(service.process)},
        ${service.nextStep}, ${renderTypes[service.slug] ?? "general"}, true, ${index + 1}
      ) on conflict (organization_id, slug) do nothing
    `;
  }
}

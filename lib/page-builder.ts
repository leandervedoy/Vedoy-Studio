import { getSql } from "@/lib/db";
import { randomId, slugify } from "@/lib/utils";

export const pageBlockTypes = ["hero", "features", "pricing", "contact"] as const;
export type PageBlockType = (typeof pageBlockTypes)[number];
export type PageVisibility = "draft" | "published";

export type PageBlockContent = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  items?: Array<{ title: string; text: string; price?: string }>;
};

export type BuilderPage = {
  id: string;
  organizationId: string;
  slug: string;
  title: string;
  visibility: PageVisibility;
  updatedAt: string;
  blocks: BuilderBlock[];
};

export type BuilderBlock = {
  id: string;
  pageId: string;
  type: PageBlockType;
  position: number;
  content: PageBlockContent;
};

const organizationId = "org_vedoy";
const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function reserveBuilderRequest(limit = 10): Promise<{ allowed: boolean; used: number; limit: number }> {
  const sql = getSql();
  if (!sql) throw new Error("Databasen er nødvendig for kostnadsbegrensningen.");
  const safeLimit = Math.max(1, Math.min(1000, Math.floor(limit) || 10));
  const rows = await sql<{ request_count: number }[]>`
    insert into studio_ai_usage (organization_id, usage_date, request_count)
    values (${organizationId}, current_date, 1)
    on conflict (organization_id, usage_date) do update
      set request_count = studio_ai_usage.request_count + 1, updated_at = now()
      where studio_ai_usage.request_count < ${safeLimit}
    returning request_count
  `;
  if (!rows[0]) {
    const current = await sql<{ request_count: number }[]>`
      select request_count from studio_ai_usage where organization_id = ${organizationId} and usage_date = current_date
    `;
    return { allowed: false, used: Number(current[0]?.request_count || safeLimit), limit: safeLimit };
  }
  return { allowed: true, used: Number(rows[0].request_count), limit: safeLimit };
}

function parseContent(value: unknown): PageBlockContent {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as PageBlockContent;
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" ? value as PageBlockContent : {};
}

function pageFromRow(row: Record<string, unknown>): BuilderPage {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    slug: String(row.slug),
    title: String(row.title),
    visibility: row.visibility === "published" ? "published" : "draft",
    updatedAt: new Date(String(row.updated_at)).toISOString(),
    blocks: []
  };
}

function blockFromRow(row: Record<string, unknown>): BuilderBlock {
  const type = String(row.block_type);
  if (!pageBlockTypes.includes(type as PageBlockType)) throw new Error("Ugyldig sidetype i databasen.");
  return {
    id: String(row.id),
    pageId: String(row.page_id),
    type: type as PageBlockType,
    position: Number(row.position),
    content: parseContent(row.content)
  };
}

export function normalizePageSlug(value: string): string {
  const slug = slugify(value);
  if (!validSlug.test(slug)) throw new Error("Siden trenger en gyldig URL-identifikator.");
  return slug;
}

export function defaultBlockContent(type: PageBlockType): PageBlockContent {
  const copy: Record<PageBlockType, PageBlockContent> = {
    hero: { eyebrow: "VEDØY STUDIO", heading: "En tydelig neste side.", body: "Fortell hva dere tilbyr, hvorfor det betyr noe og hva besøkeren kan gjøre videre.", ctaLabel: "Ta kontakt", ctaHref: "/#kontakt" },
    features: { eyebrow: "DETTE KAN INNGÅ", heading: "Bygget for det dere faktisk trenger.", body: "Velg funksjoner og innhold som støtter målene deres.", items: [{ title: "Tydelig struktur", text: "Gjør det lett å forstå tilbudet." }, { title: "Responsivt", text: "Fungerer på mobil, nettbrett og desktop." }, { title: "Videre vekst", text: "Kan utvides når behovet endrer seg." }] },
    pricing: { eyebrow: "PRISER", heading: "Start med det som gir verdi nå.", body: "Alle priser er veiledende til vi har avklart omfang og leveranse.", items: [{ title: "Start", text: "For et avgrenset behov.", price: "Fra 2 990 kr" }, { title: "Vekst", text: "For en løsning som skal videre.", price: "Fra 6 990 kr" }] },
    contact: { eyebrow: "NESTE STEG", heading: "La oss finne riktig løsning.", body: "Send en kort beskrivelse, så avklarer vi behov, omfang og et realistisk prisanslag.", ctaLabel: "Send forespørsel", ctaHref: "/#kontakt" }
  };
  return copy[type];
}

export async function listBuilderPages(): Promise<BuilderPage[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql<Record<string, unknown>[]>`
    select id, organization_id, slug, title, visibility, updated_at
    from studio_pages where organization_id = ${organizationId}
    order by updated_at desc
  `;
  return rows.map(pageFromRow);
}

export async function getBuilderPageById(id: string): Promise<BuilderPage | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql<Record<string, unknown>[]>`
    select id, organization_id, slug, title, visibility, updated_at
    from studio_pages where id = ${id} and organization_id = ${organizationId} limit 1
  `;
  if (!rows[0]) return null;
  const page = pageFromRow(rows[0]);
  const blocks = await sql<Record<string, unknown>[]>`
    select id, page_id, block_type, position, content
    from studio_page_blocks where page_id = ${page.id} and organization_id = ${organizationId}
    order by position asc
  `;
  page.blocks = blocks.map(blockFromRow);
  return page;
}

export async function getBuilderPageBySlug(slug: string, includeDraft = false): Promise<BuilderPage | null> {
  const sql = getSql();
  if (!sql || !validSlug.test(slug)) return null;
  const rows = includeDraft
    ? await sql<Record<string, unknown>[]>`select id, organization_id, slug, title, visibility, updated_at from studio_pages where slug = ${slug} and organization_id = ${organizationId} limit 1`
    : await sql<Record<string, unknown>[]>`select id, organization_id, slug, title, visibility, updated_at from studio_pages where slug = ${slug} and organization_id = ${organizationId} and visibility = 'published' limit 1`;
  if (!rows[0]) return null;
  return getBuilderPageById(String(rows[0].id));
}

export async function createBuilderPage(input: { title: string; slug: string }): Promise<BuilderPage> {
  const sql = getSql();
  if (!sql) throw new Error("Databasen er ikke konfigurert.");
  const title = input.title.trim().slice(0, 120);
  if (!title) throw new Error("Siden trenger en tittel.");
  const slug = normalizePageSlug(input.slug || title);
  const id = randomId("page");
  await sql`
    insert into studio_pages (id, organization_id, slug, title)
    values (${id}, ${organizationId}, ${slug}, ${title})
  `;
  return (await getBuilderPageById(id))!;
}

export async function createPageBlock(input: { pageId: string; type: PageBlockType; content?: PageBlockContent }): Promise<BuilderBlock> {
  const sql = getSql();
  if (!sql) throw new Error("Databasen er ikke konfigurert.");
  const page = await getBuilderPageById(input.pageId);
  if (!page) throw new Error("Siden finnes ikke.");
  const position = page.blocks.length ? Math.max(...page.blocks.map((block) => block.position)) + 1 : 1;
  const block: BuilderBlock = { id: randomId("block"), pageId: page.id, type: input.type, position, content: input.content ?? defaultBlockContent(input.type) };
  await sql`
    insert into studio_page_blocks (id, page_id, organization_id, block_type, position, content)
    values (${block.id}, ${page.id}, ${organizationId}, ${block.type}, ${block.position}, ${sql.json(block.content)})
  `;
  await sql`update studio_pages set updated_at = now() where id = ${page.id}`;
  return block;
}

export async function updateTextBlock(input: { pageId: string; blockId: string; heading?: string; body?: string; eyebrow?: string; ctaLabel?: string }): Promise<BuilderBlock> {
  const sql = getSql();
  if (!sql) throw new Error("Databasen er ikke konfigurert.");
  const page = await getBuilderPageById(input.pageId);
  const existing = page?.blocks.find((block) => block.id === input.blockId);
  if (!existing) throw new Error("Blokken finnes ikke på denne siden.");
  const content: PageBlockContent = { ...existing.content };
  for (const key of ["heading", "body", "eyebrow", "ctaLabel"] as const) {
    const value = input[key];
    if (typeof value === "string") content[key] = value.trim().slice(0, key === "body" ? 1000 : 180);
  }
  await sql`update studio_page_blocks set content = ${sql.json(content)}, updated_at = now() where id = ${existing.id} and organization_id = ${organizationId}`;
  await sql`update studio_pages set updated_at = now() where id = ${input.pageId}`;
  return { ...existing, content };
}

export async function publishPage(pageId: string, visibility: PageVisibility): Promise<BuilderPage> {
  const sql = getSql();
  if (!sql) throw new Error("Databasen er ikke konfigurert.");
  const page = await getBuilderPageById(pageId);
  if (!page) throw new Error("Siden finnes ikke.");
  await sql`update studio_pages set visibility = ${visibility}, updated_at = now() where id = ${page.id} and organization_id = ${organizationId}`;
  return (await getBuilderPageById(page.id))!;
}

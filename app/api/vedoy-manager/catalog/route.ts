import { NextResponse } from "next/server";
import { z } from "zod";
import { logManagerAction, managerSession, privilegedSupabase, publicError, sameOriginWrite } from "@/lib/vedoy-manager";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const priceSchema = z.object({
  type: z.literal("price"), key: z.string().regex(/^[a-z0-9_-]{2,70}$/),
  version: z.number().int().positive(),
  title: z.string().trim().min(2).max(140), description: z.string().trim().max(750),
  amountOre: z.number().int().min(0).max(100_000_000), setupOre: z.number().int().min(0).max(100_000_000),
  features: z.array(z.string().trim().min(1).max(180)).max(20),
  featured: z.boolean(), published: z.boolean()
});
const contentSchema = z.object({
  type: z.literal("content"), key: z.string().regex(/^[a-z0-9_.-]{2,90}$/),
  version: z.number().int().positive(), eyebrow: z.string().trim().max(120),
  heading: z.string().trim().min(2).max(280), body: z.string().trim().max(2200),
  published: z.boolean()
});
const inputSchema = z.discriminatedUnion("type", [priceSchema, contentSchema]);

export async function GET() {
  if (!await managerSession()) return NextResponse.json({ error: "Ikke funnet." }, { status: 404 });
  try {
    const db = privilegedSupabase();
    const [p, c, a] = await Promise.all([
      db.from("vedoy_price_catalog").select("*").order("category").order("sort_order"),
      db.from("vedoy_site_content").select("*").order("sort_order"),
      db.from("vedoy_manager_audit").select("actor_email,action,entity_type,entity_key,created_at").order("created_at", { ascending: false }).limit(30)
    ]);
    if (p.error || c.error || a.error) throw new Error("Supabase read failed");
    return NextResponse.json({ prices: p.data, content: c.data, audit: a.data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(publicError(error), { status: 503 });
  }
}
export async function PUT(request: Request) {
  const session = await managerSession();
  if (!session) return NextResponse.json({ error: "Ikke funnet." }, { status: 404 });
  if (!sameOriginWrite(request)) return NextResponse.json({ error: "Ugyldig opphav." }, { status: 403 });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Kontroller feltene før lagring." }, { status: 422 });
  const input = parsed.data;
  try {
    const db = privilegedSupabase();
    const table = input.type === "price" ? "vedoy_price_catalog" : "vedoy_site_content";
    const key = input.type === "price" ? "code" : "content_key";
    const patch = input.type === "price"
      ? { title: input.title, description: input.description, amount_ore: input.amountOre, setup_ore: input.setupOre, features: input.features, featured: input.featured, published: input.published }
      : { eyebrow: input.eyebrow, heading: input.heading, body: input.body, published: input.published };
    const { data, error } = await db.from(table).update({
      ...patch, version: input.version + 1, updated_at: new Date().toISOString()
    }).eq(key, input.key).eq("version", input.version).select("*").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Oppføringen er endret av en annen. Oppdater før du prøver igjen." }, { status: 409 });
    await logManagerAction(session.email, "update", input.type, input.key, patch);
    return NextResponse.json({ item: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(publicError(error), { status: 503 });
  }
}

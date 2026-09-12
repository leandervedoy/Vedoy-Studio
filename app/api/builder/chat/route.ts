import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/customer-input";
import { createPageBlock, defaultBlockContent, getBuilderPageById, pageBlockTypes, publishPage, reserveBuilderRequest, updateTextBlock, type PageBlockType } from "@/lib/page-builder";

export const maxDuration = 30;

const requestSchema = z.object({
  messages: z.array(z.unknown()),
  pageId: z.string().min(1).max(80),
  allowPublish: z.boolean().optional().default(false),
  agent: z.object({ name: z.string().min(1).max(80), instructions: z.string().max(1000) }).optional()
});

function getModel() {
  const provider = process.env.AI_PAGE_BUILDER_PROVIDER === "anthropic" ? "anthropic" : "openai";
  if (provider === "anthropic") {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY mangler. Legg den inn før du bruker AI-byggeren.");
    return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })(process.env.AI_PAGE_BUILDER_MODEL || "claude-sonnet-4-5");
  }
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY mangler. Legg den inn før du bruker AI-byggeren.");
  return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })(process.env.AI_PAGE_BUILDER_MODEL || "gpt-5-mini");
}

export async function POST(request: Request) {
  if (!isAdminSession(await getSession())) return NextResponse.json({ error: "Krever administratortilgang." }, { status: 403 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldig AI-forespørsel." }, { status: 400 });
  const { messages, pageId, allowPublish, agent } = parsed.data;
  const page = await getBuilderPageById(pageId);
  if (!page) return NextResponse.json({ error: "Siden finnes ikke." }, { status: 404 });
  const usage = await reserveBuilderRequest(Number(process.env.AI_PAGE_BUILDER_DAILY_REQUEST_LIMIT || 10));
  if (!usage.allowed) return NextResponse.json({ error: `Dagens AI-grense er nådd (${usage.limit} kall). Prøv igjen i morgen.` }, { status: 429 });

  try {
    const result = streamText({
      model: getModel(),
      instructions: `Du er ${agent?.name || "Vedi Builder"}, Vedøy Studio sin interne sidebygger. Din arbeidsmåte: ${agent?.instructions || "vær tydelig, praktisk og fokusert på god struktur"}. Du arbeider bare med siden «${page.title}» (${page.slug}). Svar kort på norsk. Siden består av validerte innholdsblokker, ikke generert kildekode. Når brukeren ber deg lage en ny landingsside, oppretter du normalt fire blokker i denne rekkefølgen: hero, features, pricing og contact. Tilpass språk og priser til briefen; priser må beskrives som veiledende hvis omfang ikke er kjent. Bruk createPageBlock når brukeren vil ha ny seksjon, og updateTextBlock når en eksisterende blokk passer. Velg bare hero, features, pricing eller contact. Ikke publiser uten at brukeren uttrykkelig ber om det. Publisering er også sperret med mindre administrator har aktivert bekreftelse.`,
      messages: await convertToModelMessages(messages as UIMessage[]),
      stopWhen: stepCountIs(5),
      maxOutputTokens: Math.max(200, Math.min(4000, Number(process.env.AI_PAGE_BUILDER_MAX_OUTPUT_TOKENS || 1200))),
      maxRetries: 0,
      tools: {
        createPageBlock: {
          description: "Legg en ny visuell seksjon til på den aktive siden.",
          inputSchema: z.object({ type: z.enum(pageBlockTypes), heading: z.string().max(180).optional(), body: z.string().max(1000).optional(), eyebrow: z.string().max(180).optional(), ctaLabel: z.string().max(80).optional(), ctaHref: z.string().max(300).optional(), items: z.array(z.object({ title: z.string().max(120), text: z.string().max(300), price: z.string().max(80).optional() })).min(1).max(6).optional() }),
          execute: async ({ type, heading, body, eyebrow, ctaLabel, ctaHref, items }) => {
            const block = await createPageBlock({
              pageId,
              type: type as PageBlockType,
              content: { ...defaultBlockContent(type as PageBlockType), ...(heading ? { heading } : {}), ...(body ? { body } : {}), ...(eyebrow ? { eyebrow } : {}), ...(ctaLabel ? { ctaLabel } : {}), ...(ctaHref ? { ctaHref } : {}), ...(items ? { items } : {}) }
            });
            return { ok: true, blockId: block.id, type: block.type, message: `${type}-blokk lagt til i forhåndsvisningen.` };
          }
        },
        updateTextBlock: {
          description: "Oppdater overskrift, ingress, brødtekst eller CTA-tekst i en blokk som allerede finnes på aktiv side.",
          inputSchema: z.object({ blockId: z.string().describe(`En av disse blokkene: ${page.blocks.map((block) => `${block.id} (${block.type}: ${block.content.heading ?? "uten tittel"})`).join(", ")}`), heading: z.string().max(180).optional(), body: z.string().max(1000).optional(), eyebrow: z.string().max(180).optional(), ctaLabel: z.string().max(80).optional() }),
          execute: async (input) => {
            const block = await updateTextBlock({ pageId, ...input });
            return { ok: true, blockId: block.id, message: "Teksten er oppdatert i forhåndsvisningen." };
          }
        },
        publishPage: {
          description: "Publiser den aktive siden slik at besøkende kan åpne den på den offentlige URL-en.",
          inputSchema: z.object({ reason: z.string().max(240).describe("Bekreft kort hva brukeren ba om å publisere.") }),
          execute: async ({ reason }) => {
            if (!allowPublish) return { ok: false, message: "Publisering er ikke bekreftet i byggeren. Be administrator aktivere «Tillat publisering» og prøve igjen." };
            const updated = await publishPage(pageId, "published");
            return { ok: true, pageId: updated.id, visibility: updated.visibility, reason, message: "Siden er publisert." };
          }
        }
      }
    });
    return result.toUIMessageStreamResponse();
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "AI-byggeren kunne ikke starte." }, { status: 503 });
  }
}

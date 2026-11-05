import { NextResponse } from "next/server";
import { z } from "zod";
import { cloudAdmin, cloudSameOrigin, cloudSession } from "@/lib/vedoy-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sourceSchema = z.object({
  source: z.enum(["manual", "github", "folder"]),
  name: z.string().trim().min(2).max(100).optional(),
  githubUrl: z.string().trim().max(300).optional(),
});
const idSchema = z.string().uuid();

const errorMessage = { error: "Vedoy Cloud er midlertidig utilgjengelig." };

export async function GET() {
  const user = await cloudSession();
  if (!user) return NextResponse.json({ error: "Logg inn med Vedøy Login." }, { status: 401 });
  try {
    const db = cloudAdmin();
    const { data, error } = await db.from("vedoy_cloud_projects").select("id,name,source,github_url,github_default_branch,created_at,updated_at").eq("owner_id", user.sub).order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return NextResponse.json({ projects: data || [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("cloud projects list failed", error instanceof Error ? error.message : "error");
    return NextResponse.json(errorMessage, { status: 503 });
  }
}
export async function POST(request: Request) {
  const user = await cloudSession();
  if (!user) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  if (!cloudSameOrigin(request)) return NextResponse.json({ error: "Ugyldig opprinnelse." }, { status: 403 });
  const parsed = sourceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Kontroller prosjektdetaljene." }, { status: 422 });
  const input = parsed.data;
  let name = input.name || "";
  let owner: string | null = null, repo: string | null = null, branch: string | null = null, githubUrl: string | null = null;
  if (input.source === "github") {
    const match = /^https:\/\/github\.com\/([A-Za-z0-9-]{1,39})\/([A-Za-z0-9_.-]{1,100})(?:\/)?$/.exec(input.githubUrl || "");
    if (!match) return NextResponse.json({ error: "Bruk lenke til et GitHub-repositorium, f.eks. https://github.com/bruker/prosjekt." }, { status: 422 });
    owner = match[1]; repo = match[2].replace(/\.git$/, "");
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      let response: Response;
      try {
        response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { signal: controller.signal, headers: { Accept: "application/vnd.github+json", "User-Agent": "Vedoy-Studio-Cloud" }, cache: "no-store" });
      } finally { clearTimeout(timer); }
      if (!response.ok) return NextResponse.json({ error: "Fant ikke et tilgjengelig offentlig GitHub-repositorium." }, { status: 422 });
      const info = await response.json() as { private?: boolean; name?: string; default_branch?: string; html_url?: string; archived?: boolean };
      if (info.private || !info.html_url?.startsWith("https://github.com/")) return NextResponse.json({ error: "Bare offentlige GitHub-repositorier kan kobles i denne versjonen." }, { status: 422 });
      githubUrl = info.html_url; branch = info.default_branch || "main"; name ||= info.name || repo;
    } catch {
      return NextResponse.json({ error: "GitHub kunne ikke kontaktes. Prøv igjen." }, { status: 502 });
    }
  }
  if (name.trim().length < 2) return NextResponse.json({ error: "Skriv et prosjektnavn med minst to tegn." }, { status: 422 });
  try {
    const db = cloudAdmin();
    const { count, error: countError } = await db.from("vedoy_cloud_projects").select("id", { count: "exact", head: true }).eq("owner_id", user.sub);
    if (countError) throw countError;
    if ((count ?? 0) >= 30) return NextResponse.json({ error: "Du har nådd grensen på 30 prosjekter." }, { status: 409 });
    const { data, error } = await db.from("vedoy_cloud_projects").insert({ owner_id: user.sub, name: name.trim(), source: input.source, github_url: githubUrl, github_owner: owner, github_repo: repo, github_default_branch: branch }).select("id,name,source,github_url,github_default_branch,created_at,updated_at").single();
    if (error) throw error;
    return NextResponse.json({ project: data, note: input.source === "github" ? "GitHub-prosjektet er tilkoblet som lenke. Kildekoden er foreløpig ikke kopiert til Vedoy Cloud." : null }, { status: 201 });
  } catch (error) {
    console.error("cloud projects create failed", error instanceof Error ? error.message : "error");
    return NextResponse.json(errorMessage, { status: 503 });
  }
}
export async function DELETE(request: Request) {
  const user = await cloudSession();
  if (!user) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  if (!cloudSameOrigin(request)) return NextResponse.json({ error: "Ugyldig opprinnelse." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Ugyldig prosjekt." }, { status: 422 });
  try {
    const db = cloudAdmin();
    const files = await db.from("vedoy_cloud_files").select("storage_key").eq("owner_id", user.sub).eq("project_id", id!);
    if (files.error) throw files.error;
    if (files.data?.length) {
      const removed = await db.storage.from("vedoy-cloud-private").remove(files.data.map(f => f.storage_key));
      if (removed.error) throw removed.error;
    }
    const result = await db.from("vedoy_cloud_projects").delete().eq("id", id!).eq("owner_id", user.sub).select("id");
    if (result.error) throw result.error;
    if (!result.data?.length) return NextResponse.json({ error: "Prosjektet finnes ikke." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("cloud project delete failed", error instanceof Error ? error.message : "error");
    return NextResponse.json(errorMessage, { status: 503 });
  }
}

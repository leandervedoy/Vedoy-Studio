import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { CLOUD_BUCKET, CLOUD_OWNER_LIMIT, CLOUD_SETTINGS, cleanCloudPath, cloudAdmin, cloudSameOrigin, cloudSession } from "@/lib/vedoy-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Tree = { truncated?: boolean; tree?: Array<{ path?: string; type?: string; sha?: string; size?: number }> };
type Blob = { content?: string; encoding?: string; size?: number };
async function github<T>(endpoint: string): Promise<T> {
  const response = await fetch("https://api.github.com" + endpoint, { cache: "no-store", signal: AbortSignal.timeout(8000), headers: { Accept: "application/vnd.github+json", "User-Agent": "Vedoy-Studio-Cloud" } });
  if (!response.ok) throw new Error("GitHub responded " + response.status);
  return await response.json() as T;
}
export async function POST(request: Request) {
  const user = await cloudSession();
  if (!user) return NextResponse.json({ error: "Logg inn for å importere." }, { status: 401 });
  if (!cloudSameOrigin(request)) return NextResponse.json({ error: "Ugyldig opprinnelse." }, { status: 403 });
  const parsed = z.object({ projectId: z.string().uuid() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldig prosjekt." }, { status: 422 });
  const db = cloudAdmin();
  try {
    const { data: project, error: projectError } = await db.from("vedoy_cloud_projects").select("id,github_owner,github_repo,github_default_branch").eq("id", parsed.data.projectId).eq("owner_id", user.sub).eq("source", "github").maybeSingle();
    if (projectError) throw projectError;
    if (!project?.github_owner || !project.github_repo || !project.github_default_branch) return NextResponse.json({ error: "Koble et offentlig GitHub-repositorium først." }, { status: 404 });
    const owner = project.github_owner, repository = project.github_repo;
    if (!/^[a-zA-Z0-9-]{1,39}$/.test(owner) || !/^[a-zA-Z0-9_.-]{1,100}$/.test(repository)) return NextResponse.json({ error: "Ugyldig GitHub-kilde." }, { status: 422 });
    const prefix = `/repos/${owner}/${repository}`;
    const repoInfo = await github<{ private?: boolean; default_branch?: string }>(prefix);
    if (repoInfo.private) return NextResponse.json({ error: "Private GitHub-repositorier støttes ikke." }, { status: 422 });
    const tree = await github<Tree>(prefix + "/git/trees/" + encodeURIComponent(project.github_default_branch) + "?recursive=1");
    if (tree.truncated || !Array.isArray(tree.tree)) return NextResponse.json({ error: "GitHub-repositoriet er for stort for enkel import." }, { status: 422 });
    const metadata = await db.from("vedoy_cloud_files").select("display_path,size_bytes").eq("owner_id", user.sub).limit(3000);
    if (metadata.error) throw metadata.error;
    const usedBytes = (metadata.data || []).reduce((n, x) => n + Number(x.size_bytes), 0);
    const existing = new Set((metadata.data || []).map(x => x.display_path));
    const countResult = await db.from("vedoy_cloud_files").select("id", { count: "exact", head: true }).eq("owner_id", user.sub).eq("project_id", project.id);
    if (countResult.error) throw countResult.error;
    const slots = Math.max(0, CLOUD_SETTINGS.maxFilesPerProject - (countResult.count || 0));
    const candidates = tree.tree.filter(x => x.type === "blob" && typeof x.size === "number" && x.size > 0 && x.size <= 256 * 1024 && typeof x.sha === "string" && !!cleanCloudPath(x.path) && !existing.has(x.path!));
    if (!slots || usedBytes >= CLOUD_OWNER_LIMIT) return NextResponse.json({ error: "Ingen lagringsplass igjen." }, { status: 409 });
    const selected = candidates.slice(0, Math.min(slots, 12));
    let imported = 0, bytes = 0;
    const ownerFolder = createHash("sha256").update(user.sub).digest("hex");
    for (const entry of selected) {
      const expected = entry.size!;
      if (usedBytes + bytes + expected > CLOUD_OWNER_LIMIT || bytes + expected > 3 * 1024 * 1024) break;
      const blob = await github<Blob>(prefix + "/git/blobs/" + entry.sha);
      if (blob.encoding !== "base64" || typeof blob.content !== "string") continue;
      const content = Buffer.from(blob.content.replaceAll("\n", ""), "base64");
      if (content.length !== expected) continue;
      const key = `${ownerFolder}/${project.id}/${randomUUID()}`;
      const uploaded = await db.storage.from(CLOUD_BUCKET).upload(key, content, { contentType: "application/octet-stream", upsert: false });
      if (uploaded.error) throw uploaded.error;
      const saved = await db.from("vedoy_cloud_files").insert({ owner_id: user.sub, project_id: project.id, display_path: entry.path, storage_key: key, size_bytes: expected, mime_type: "application/octet-stream", status: "ready" });
      if (saved.error) { await db.storage.from(CLOUD_BUCKET).remove([key]); throw saved.error; }
      imported++; bytes += expected;
    }
    return NextResponse.json({ imported, remaining: Math.max(0, candidates.length - imported), note: imported ? "Et begrenset utvalg av kildefiler er kopiert til privat lagring. Importen er ikke en Git-klone med commit-historikk." : "Ingen nye små kildefiler ble importert." });
  } catch (error) {
    console.error("cloud public GitHub import failed", error instanceof Error ? error.message : "error");
    return NextResponse.json({ error: "GitHub-import kunne ikke fullføres. Prosjektet er fortsatt tilgjengelig." }, { status: 503 });
  }
}

import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { CLOUD_BUCKET, CLOUD_FILE_LIMIT, CLOUD_OWNER_LIMIT, CLOUD_SETTINGS, cleanCloudPath, cloudAdmin, cloudSameOrigin, cloudSession, cloudWriteError } from "@/lib/vedoy-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uuid = z.string().uuid();
const uploadInput = z.object({
  projectId: z.string().uuid(),
  path: z.string().min(1).max(500),
  size: z.number().int().positive().max(CLOUD_FILE_LIMIT),
  contentType: z.string().max(120).optional()
});
const confirmInput = z.object({ fileId: z.string().uuid() });

async function projectForOwner(db: ReturnType<typeof cloudAdmin>, owner: string, projectId: string) {
  const result = await db.from("vedoy_cloud_projects").select("id").eq("id", projectId).eq("owner_id", owner).maybeSingle();
  if (result.error) throw result.error;
  return Boolean(result.data);
}
const unavailable = { error: "Vedoy Cloud er midlertidig utilgjengelig." };

export async function GET(request: Request) {
  const user = await cloudSession();
  if (!user) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const search = new URL(request.url).searchParams;
  const projectId = search.get("projectId");
  if (!uuid.safeParse(projectId).success) return NextResponse.json({ error: "Ugyldig prosjekt." }, { status: 422 });
  try {
    const db = cloudAdmin();
    if (!await projectForOwner(db, user.sub, projectId!)) return NextResponse.json({ error: "Prosjektet finnes ikke." }, { status: 404 });
    const { data, error } = await db.from("vedoy_cloud_files").select("id,display_path,size_bytes,mime_type,created_at").eq("project_id", projectId!).eq("owner_id", user.sub).eq("status", "ready").order("created_at", { ascending: false }).limit(300);
    if (error) throw error;
    return NextResponse.json({ files: data || [], maxFileBytes: CLOUD_FILE_LIMIT }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("cloud file list failed", error instanceof Error ? error.message : "error");
    return NextResponse.json(unavailable, { status: 503 });
  }
}

export async function POST(request: Request) {
  const user = await cloudSession();
  if (!user) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  if (!cloudSameOrigin(request)) return NextResponse.json({ error: "Ugyldig opprinnelse." }, { status: 403 });
  const parsed = uploadInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldig fil eller filen overstiger 10 MiB." }, { status: 422 });
  const input = parsed.data;
  const path = cleanCloudPath(input.path);
  if (!path) return NextResponse.json({ error: "Ugyldig filsti." }, { status: 422 });
  try {
    const db = cloudAdmin();
    if (!await projectForOwner(db, user.sub, input.projectId)) return NextResponse.json({ error: "Prosjektet finnes ikke." }, { status: 404 });
    const { data: files, error: listError } = await db.from("vedoy_cloud_files").select("size_bytes").eq("owner_id", user.sub).limit(3000);
    if (listError) throw listError;
    if ((files || []).reduce((n, x) => n + Number(x.size_bytes), 0) + input.size > CLOUD_OWNER_LIMIT) return NextResponse.json({ error: "Lagringsgrensen på 100 MiB er nådd." }, { status: 409 });
    const { count, error: countError } = await db.from("vedoy_cloud_files").select("id", { count: "exact", head: true }).eq("project_id", input.projectId).eq("owner_id", user.sub);
    if (countError) throw countError;
    if ((count || 0) >= CLOUD_SETTINGS.maxFilesPerProject) return NextResponse.json({ error: "Prosjektet har nådd grensen på 200 filer." }, { status: 409 });
    const ownerFolder = createHash("sha256").update(user.sub).digest("hex");
    const objectKey = `${ownerFolder}/${input.projectId}/${randomUUID()}`;
    const { data: file, error: metaError } = await db.from("vedoy_cloud_files").insert({ project_id: input.projectId, owner_id: user.sub, display_path: path, storage_key: objectKey, size_bytes: input.size, mime_type: input.contentType || "application/octet-stream", status: "pending" }).select("id").single();
    if (metaError) throw metaError;
    const signed = await db.storage.from(CLOUD_BUCKET).createSignedUploadUrl(objectKey);
    if (signed.error || !signed.data?.signedUrl) {
      await db.from("vedoy_cloud_files").delete().eq("id", file.id).eq("owner_id", user.sub);
      throw signed.error || new Error("Missing signed URL");
    }
    return NextResponse.json({ fileId: file.id, signedUrl: signed.data.signedUrl }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const quota = cloudWriteError(error);
    if (quota) return NextResponse.json({ error: quota }, { status: 409 });
    console.error("cloud upload authorization failed", error instanceof Error ? error.message : "error");
    return NextResponse.json(unavailable, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const user = await cloudSession();
  if (!user) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  if (!cloudSameOrigin(request)) return NextResponse.json({ error: "Ugyldig opprinnelse." }, { status: 403 });
  const parsed = confirmInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldig fil." }, { status: 422 });
  try {
    const db = cloudAdmin();
    const row = await db.from("vedoy_cloud_files").select("id,storage_key,size_bytes").eq("owner_id", user.sub).eq("id", parsed.data.fileId).eq("status", "pending").maybeSingle();
    if (row.error) throw row.error;
    if (!row.data) return NextResponse.json({ error: "Filen finnes ikke." }, { status: 404 });
    const info = await db.storage.from(CLOUD_BUCKET).info(row.data.storage_key);
    if (info.error || !info.data) return NextResponse.json({ error: "Filen er ikke ferdig lastet opp." }, { status: 409 });
    if (Number(info.data.size) !== Number(row.data.size_bytes)) return NextResponse.json({ error: "Filstørrelsen stemmer ikke." }, { status: 409 });
    const result = await db.from("vedoy_cloud_files").update({ status: "ready" }).eq("id", row.data.id).eq("owner_id", user.sub);
    if (result.error) throw result.error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("cloud file confirmation failed", error instanceof Error ? error.message : "error");
    return NextResponse.json(unavailable, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const user = await cloudSession();
  if (!user) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  if (!cloudSameOrigin(request)) return NextResponse.json({ error: "Ugyldig opprinnelse." }, { status: 403 });
  const fileId = new URL(request.url).searchParams.get("id");
  if (!uuid.safeParse(fileId).success) return NextResponse.json({ error: "Ugyldig fil." }, { status: 422 });
  try {
    const db = cloudAdmin();
    const row = await db.from("vedoy_cloud_files").select("id,storage_key").eq("id", fileId!).eq("owner_id", user.sub).maybeSingle();
    if (row.error) throw row.error;
    if (!row.data) return NextResponse.json({ error: "Filen finnes ikke." }, { status: 404 });
    const removed = await db.storage.from(CLOUD_BUCKET).remove([row.data.storage_key]);
    if (removed.error) throw removed.error;
    const result = await db.from("vedoy_cloud_files").delete().eq("id", row.data.id).eq("owner_id", user.sub);
    if (result.error) throw result.error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("cloud file delete failed", error instanceof Error ? error.message : "error");
    return NextResponse.json(unavailable, { status: 503 });
  }
}

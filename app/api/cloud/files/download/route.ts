import { NextResponse } from "next/server";
import { z } from "zod";
import { CLOUD_BUCKET, cloudAdmin, cloudSession } from "@/lib/vedoy-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await cloudSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Ugyldig fil." }, { status: 422 });
  try {
    const db = cloudAdmin();
    const file = await db.from("vedoy_cloud_files").select("storage_key,display_path").eq("id", id!).eq("owner_id", session.sub).eq("status", "ready").maybeSingle();
    if (file.error) throw file.error;
    if (!file.data) return NextResponse.json({ error: "Filen finnes ikke." }, { status: 404 });
    const result = await db.storage.from(CLOUD_BUCKET).createSignedUrl(file.data.storage_key, 60, { download: file.data.display_path.split("/").at(-1) || "download" });
    if (result.error || !result.data?.signedUrl) throw result.error || new Error("No signed URL");
    return NextResponse.json({ url: result.data.signedUrl }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("cloud file download failed", error instanceof Error ? error.message : "error");
    return NextResponse.json({ error: "Nedlasting er midlertidig utilgjengelig." }, { status: 503 });
  }
}

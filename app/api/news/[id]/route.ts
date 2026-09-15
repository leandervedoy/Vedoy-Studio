import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { updateNewsPost } from "@/lib/repository";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) { const session = await requireSession(); const body = await request.json(); if (body.status === "published" && !["admin", "owner"].includes(session.role)) return NextResponse.json({ error: "Bare Admin eller Administrator kan publisere." }, { status: 403 }); return NextResponse.json({ post: await updateNewsPost((await context.params).id, { status: body.status }) }); }

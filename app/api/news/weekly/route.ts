import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createNewsPost } from "@/lib/repository";
export async function POST() {
  const session = await requireSession();
  const post = await createNewsPost({ slug: "ukens-vedoy-oppdatering-" + Date.now(), title: "Ukens Vedøy-oppdatering", excerpt: "Et Vedi-utkast klart for gjennomgang.", content: "Dette er en trygg startkladd. Oppdater innholdet med ukens nyheter før Admin publiserer.", category: "Announcements", status: "draft", authorType: "vedi", authorName: "Vedi", authorAvatarUrl: undefined, sortOrder: 0 });
  return NextResponse.json({ post, createdBy: session.email });
}

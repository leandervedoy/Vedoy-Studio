import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSharedStudioNote } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Delt notat", robots: { index: false, follow: false } };

export default async function SharedNotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const note = await getSharedStudioNote(token);
  if (!note) notFound();
  return <main className={`shared-note-page shared-note-page--${note.color}`}><article><header><div><small>VEDØY NOTES · DELT LESEVISNING</small><h1>{note.title}</h1><p>{note.notebook} / {note.section}</p></div><Link href="/">Vedøy Studio ↗</Link></header><div className="shared-note-tags">{note.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><div className="shared-note-content">{note.content}</div><footer>Sist oppdatert {new Intl.DateTimeFormat("nb-NO", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Oslo" }).format(new Date(note.updatedAt))}</footer></article></main>;
}

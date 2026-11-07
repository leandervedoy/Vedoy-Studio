import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getAuthorizedDraft } from "@/lib/studio-preview-access";
import { PageRenderer } from "@/components/page-builder/page-renderer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privat utkast | Vedoy Studio", robots: { index: false, follow: false } };

export default async function PrivateDraftPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const session = await requireSession();
  const page = await getAuthorizedDraft(session, pageId);
  if (!page) notFound();
  return <div>
    <header style={{ padding: "14px 20px", background: "#ffedb0", color: "#252016", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
      <strong>Privat forhåndsvisning · IKKE PUBLISERT</strong>
      <Link href="/studio/projects" style={{ textDecoration: "underline" }}>← Alle utkast</Link>
    </header>
    <PageRenderer page={page} preview />
  </div>;
}

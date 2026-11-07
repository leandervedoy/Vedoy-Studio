import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { listAuthorizedDrafts } from "@/lib/studio-preview-access";

export const dynamic = "force-dynamic";
export const metadata = { title: "Private forhåndsvisninger | Vedoy Studio", robots: { index: false, follow: false } };

export default async function PreviewHub() {
  const session = await requireSession();
  const pages = await listAuthorizedDrafts(session);
  return <section style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 0 64px" }}>
    <p className="eyebrow">VEDOY STUDIO · KUNDETEST</p>
    <h1>Upubliserte nettsider</h1>
    <p style={{ maxWidth: 680, color: "#666" }}>Test sider du har fått tilgang til, før publisering. Endringene dine er ikke synlige på den offentlige nettsiden.</p>
    {pages.length === 0 ? <div className="studio-panel" style={{ marginTop: 28, padding: 26 }}>
      <h2>Ingen sider delt med deg ennå</h2><p>En Vedoy-redaktør kan gi deg tilgang til et privat utkast fra sidebyggeren.</p>
    </div> :
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16, marginTop: 28 }}>
      {pages.map(page => <article className="studio-panel" key={page.id} style={{ padding: 22 }}>
        <small>UTKAST · IKKE PUBLISERT</small><h2 style={{ margin: "12px 0 8px" }}>{page.title}</h2>
        <p style={{ color: "#666" }}>/{page.slug}</p>
        <Link className="button button--dark" href={`/studio/previews/${encodeURIComponent(page.id)}`}>Test siden →</Link>
      </article>)}
    </div>}
  </section>;
}

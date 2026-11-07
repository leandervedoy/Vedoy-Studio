import Link from "next/link";
import { ModuleHeader } from "@/components/studio/module-header";
import { ProjectManager } from "@/components/studio/project-manager";
import { HostingOverview } from "@/components/studio/hosting-overview";
import { requireSession } from "@/lib/auth";
import { listProjects } from "@/lib/repository";
import { listAuthorizedDrafts, requirePreviewAdmin } from "@/lib/studio-preview-access";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await requireSession();
  const [drafts, internalAdmin] = await Promise.all([
    listAuthorizedDrafts(session),
    requirePreviewAdmin(session)
  ]);
  // The legacy project table is not tenant-scoped. It must never be read
  // for a customer account until explicit organization ownership exists.
  const projects = internalAdmin ? await listProjects() : [];

  return <>
    <ModuleHeader eyebrow="VEDØY STUDIO" title={internalAdmin ? "Prosjekter og forhåndsvisninger" : "Mine prosjekter"}
      description="Se prosjekter du har tilgang til, og test upubliserte nettsider før lansering." badge="BETA" />
    <section className="studio-panel" aria-label="Private forhåndsvisninger" style={{ padding: 24, marginBottom: 22 }}>
      <div className="panel-heading">
        <div><small>KUN FOR INVITERTE</small><h2>Til testing</h2></div>
        <span>{drafts.length} {drafts.length === 1 ? "utkast" : "utkast"}</span>
      </div>
      <p>Utkastene er private og ikke publisert. Åpne en side for å teste layout, mobilvisning og funksjoner.</p>
      {drafts.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          {drafts.map(page => (
            <article key={page.id} style={{ padding: 18, border: "1px solid var(--line)", borderRadius: 14, background: "var(--white)" }}>
              <small>IKKE PUBLISERT</small><h3 style={{ margin: "10px 0 6px" }}>{page.title}</h3>
              <p style={{ color: "var(--muted)" }}>/{page.slug}</p>
              <Link className="button button--dark button--small"
                href={`/studio/previews/${encodeURIComponent(page.id)}`}>Åpne forhåndsvisning</Link>
            </article>
          ))}
        </div>
      ) : <p role="status">Ingen utkast er delt med kontoen din ennå.</p>}
    </section>
    {internalAdmin ? <>
      <HostingOverview projects={projects} />
      <ProjectManager initialProjects={projects} />
    </> : <section className="studio-panel" style={{ padding: 24 }}>
      <h2>Prosjektoppfølging</h2>
      <p>Vedøy legger til prosjektet ditt her når det er klart for testing. Du får bare tilgang til prosjektene som deles med din konto.</p>
    </section>}
  </>;
}

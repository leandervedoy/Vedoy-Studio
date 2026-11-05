import Link from "next/link";
import { ModuleHeader } from "@/components/studio/module-header";
import { ProjectManager } from "@/components/studio/project-manager";
import { HostingOverview } from "@/components/studio/hosting-overview";
import { isUsingDatabase, listProjects } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await listProjects();
  const demoMode = !isUsingDatabase();

  return <>
    <ModuleHeader eyebrow="NETTSIDER OG DRIFT" title="Prosjekter" description="Finn nettsidene dine, se registrert status og åpne riktig prosjekt." badge="BETA" />
    {demoMode && <div className="studio-info-banner" role="status">
      <strong>Eksempelprosjekter</strong>
      <span>Databasen er ikke koblet til. Listen viser demonstrasjonsdata, og nye prosjekter kan ikke lagres før tilkoblingen fungerer.</span>
    </div>}
    <div className="project-navigation">
      <Link href="/studio/domains">Administrer domener ↗</Link>
      <Link href="/studio/analytics">Se statistikk ↗</Link>
    </div>
    <ProjectManager initialProjects={projects} demoMode={demoMode} />
    <p className="project-integration-note">Prosjektlisten henter ikke automatisk oppdateringer fra GitHub eller Vercel ennå. Status og trafikk må derfor ikke tolkes som sanntidsmålinger.</p>
    <details className="project-page-help">
      <summary>Hvordan fungerer Vedøy Hosting?</summary>
      <HostingOverview projects={projects} />
    </details>
  </>;
}

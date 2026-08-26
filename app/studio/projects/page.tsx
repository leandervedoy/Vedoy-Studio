import { ModuleHeader } from "@/components/studio/module-header";
import { ProjectManager } from "@/components/studio/project-manager";
import { HostingOverview } from "@/components/studio/hosting-overview";
import { listProjects } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await listProjects();
  return <><ModuleHeader eyebrow="BYGG" title="Hosting og prosjekter" description="Nettsider og API-er samlet med deploystatus, region og trafikk." badge="BETA" /><HostingOverview projects={projects} /><ProjectManager initialProjects={projects} /></>;
}

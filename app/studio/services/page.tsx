import { ServiceManager } from "@/components/studio/service-manager";
import { ModuleHeader } from "@/components/studio/module-header";
import { requireAdminSession } from "@/lib/auth";
import { listStudioServices } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function ServicesAdminPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  await requireAdminSession();
  const query = await searchParams;
  const services = await listStudioServices({ includeUnpublished: true });
  return <><ModuleHeader eyebrow="INNHOLD" title="Tjenester" description="Opprett, rediger, sorter og publiser tjenestene som vises på Vedøy Studio." badge="ADMIN" /><ServiceManager initialServices={services} startNew={query.new === "1"} /></>;
}

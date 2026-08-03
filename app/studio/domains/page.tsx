import { DomainManager } from "@/components/studio/domain-manager";
import { ModuleHeader } from "@/components/studio/module-header";
import { listDomains } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function DomainsStudioPage() {
  return <><ModuleHeader eyebrow="BYGG" title="Domener" description="Søk, koble og følg domenene dine uten å grave i flere kontrollpaneler." badge="BETA" /><DomainManager domains={await listDomains()} /></>;
}

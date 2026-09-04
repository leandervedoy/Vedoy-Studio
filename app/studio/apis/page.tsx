import { ApiKeyManager } from "@/components/studio/api-key-manager";
import { ModuleHeader } from "@/components/studio/module-header";
import { listApiKeys } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function ApiPage() {
  return <><ModuleHeader eyebrow="UTVIKLE" title="API og utviklerverktøy" description="Koble egne nettsider og apper til booking, prosjekter og statistikk." badge="BETA" /><ApiKeyManager initialKeys={await listApiKeys()} /></>;
}

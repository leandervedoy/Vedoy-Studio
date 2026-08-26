import { ModuleHeader } from "@/components/studio/module-header";
import { BuilderWorkspace } from "@/components/studio/builder-workspace";

export default function BuilderPage() {
  return <><ModuleHeader eyebrow="BYGG" title="Vedøy Builder" description="Sett sammen en profesjonell nettside fra rolige, responsive seksjoner." badge="BETA" /><BuilderWorkspace /></>;
}

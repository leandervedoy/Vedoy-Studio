import { ModuleHeader } from "@/components/studio/module-header";
import { VedoyManagerConsole } from "@/components/studio/vedoy-manager-console";
import { requireVedoyOwnerSession } from "@/lib/auth";
import "@/app/vedoy-manager.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Vedøy Manager · privat", robots: { index:false, follow:false } };
export default async function VedoyManagerPage() {
  await requireVedoyOwnerSession();
  return <><ModuleHeader eyebrow="VEDØY · EIERVERKTØY" title="Vedøy Manager" description="Administrer publiserte priser, nettsideinnhold, roller og kundeforespørsler fra ett kontrollsenter." badge="VEDØY OWNER" />
    <VedoyManagerConsole/></>;
}

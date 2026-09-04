import { ModuleHeader } from "@/components/studio/module-header";
import { SupportCenter } from "@/components/studio/support-center";
import { listTickets } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  return <><ModuleHeader eyebrow="DRIFT" title="Vedøy Assist" description="Når et dashboard ikke er nok: få personlig og tålmodig hjelp." badge="TILGJENGELIG" /><SupportCenter initialTickets={await listTickets()} /></>;
}

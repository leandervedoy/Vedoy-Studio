import { requireVedoyStaff } from "@/lib/staff-access";
import { ModuleHeader } from "@/components/studio/module-header";
import { VediChat } from "@/components/studio/vedi-chat";

export default async function VediPage() {
  await requireVedoyStaff();
  return <><ModuleHeader eyebrow="VOKS" title="Vedi AI" description="Spør om nettsiden, kundereisen, booking, statistikk og digitale rutiner." badge={process.env.OPENAI_API_KEY ? "KI TILKOBLET" : "SMART DEMO"} /><VediChat /></>;
}

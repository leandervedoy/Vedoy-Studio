import { ModuleHeader } from "@/components/studio/module-header";
import { VediChat } from "@/components/studio/vedi-chat";

export default function VediPage() {
  return <><ModuleHeader eyebrow="VOKS" title="Vedi AI" description="Spør om nettsiden, kundereisen, booking, statistikk og digitale rutiner." badge={process.env.OPENAI_API_KEY ? "KI TILKOBLET" : "SMART DEMO"} /><VediChat /></>;
}

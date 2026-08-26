import { ModuleHeader } from "@/components/studio/module-header";
import { WorkHoursModule } from "@/components/studio/work-hours-module";
import { requireSession } from "@/lib/auth";
import { listWorkTimeEntries } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function HoursPage() {
  const session = await requireSession();
  return <><ModuleHeader eyebrow="VEDØY GROWTH" title="Timeregistrering" description="Start og stopp arbeidsøkter. Timer lagres sikkert på brukeren din." badge="LIVE" /><WorkHoursModule initialEntries={await listWorkTimeEntries(session.email)} expanded /></>;
}

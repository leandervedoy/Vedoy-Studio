import { BookingStudio } from "@/components/studio/booking-studio";
import { ModuleHeader } from "@/components/studio/module-header";

export default function BookingStudioPage() {
  return <><ModuleHeader eyebrow="DRIFT" title="Vedøy Booking" description="Administrer bestillinger, kundevisning, åpningstider, tjenester og planer." badge="BETA" action={{ label: "Åpne offentlig demo ↗", href: "/booking" }} /><BookingStudio /></>;
}

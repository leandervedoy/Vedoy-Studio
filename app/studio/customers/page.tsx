import { ModuleHeader } from "@/components/studio/module-header";
import { CustomerCrm } from "@/components/studio/customer-crm";
import { listCustomers } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomers();
  return <><ModuleHeader eyebrow="DRIFT" title="Kunder og CRM" description="Søk, kontakt og følg opp kunder som kommer inn gjennom Vedøy Booking." badge="BETA" /><CustomerCrm customers={customers} referenceTime={new Date().toISOString()} /></>;
}

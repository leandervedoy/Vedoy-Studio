import { CompanyOperations } from "@/components/studio/company-operations";
import { ModuleHeader } from "@/components/studio/module-header";
import { requireAdminSession } from "@/lib/auth";
import { listCompanyRegistrations, listDomainEmailOrders } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  await requireAdminSession();
  const [registrations, orders] = await Promise.all([listCompanyRegistrations(), listDomainEmailOrders()]);
  return <><ModuleHeader eyebrow="ADMINISTRATOR · BEDRIFTSOPPSETT" title="Nye bedrifter" description="Se registreringer, bekreft abonnementsnivå og følg opp bestillinger av domene og e-post. Alle eksternkjøp gjøres manuelt etter avtale." /><CompanyOperations initialRegistrations={registrations} initialDomainOrders={orders} /></>;
}

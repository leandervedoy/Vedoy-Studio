import { notFound } from "next/navigation";
import { getSession, requireSession } from "@/lib/auth";
import { ModuleHeader } from "@/components/studio/module-header";
import { RoleEditor } from "@/components/studio/role-editor";
import "@/app/vedoy-manager.css";
export const dynamic = "force-dynamic";
export default async function RolesPage() {
  const session = await requireSession();
  if (session.role !== "owner" && session.role !== "vedoy_owner") notFound();
  return <><ModuleHeader eyebrow="BEDRIFT · TILGANGER" title="Roller og tillatelser" description="Bedriftseieren kan opprette egendefinerte roller, velge rettigheter og tildele dem til medarbeidere." badge="EIER" />
    <section className="vm vm-panel"><RoleEditor/></section></>;
}

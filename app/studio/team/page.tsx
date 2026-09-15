import { ModuleHeader } from "@/components/studio/module-header";
import { TeamHierarchy } from "@/components/studio/team-hierarchy";
import { requireSession } from "@/lib/auth";
import { listTeamMembers } from "@/lib/repository";
export const dynamic = "force-dynamic";
export default async function TeamPage(){const session=await requireSession();const members=await listTeamMembers();return <><ModuleHeader eyebrow="VEDØY GROWTH" title="Team" description="Se hvem som jobber med hvilke tjenester og hvem du samarbeider med."/><TeamHierarchy initialMembers={members} canManage={session.role==="owner"||session.role==="admin"}/></>;}

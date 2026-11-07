import { StudioShell } from "@/components/studio/studio-shell";
import { getSession } from "@/lib/auth";
import { hasVerifiedStaffSession } from "@/lib/staff-access";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeStudioNext } from "@/lib/vedoy-owner-access.mjs";

export const dynamic = "force-dynamic";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    const path = safeStudioNext((await headers()).get("x-vedoy-pathname"));
    redirect(`/login?next=${encodeURIComponent(path)}`);
  }
  const isInternalStaff = await hasVerifiedStaffSession(session);
  return <StudioShell userName={session.name} userRole={session.role} isInternalStaff={isInternalStaff} organizationName={isInternalStaff ? "Vedøy" : "Mine prosjekter"}>{children}</StudioShell>;
}

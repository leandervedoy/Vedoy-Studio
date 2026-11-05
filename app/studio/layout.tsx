import { StudioShell } from "@/components/studio/studio-shell";
import { getSession } from "@/lib/auth";
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
  return <StudioShell userName={session.name} userRole={session.role} organizationName="Vedøy">{children}</StudioShell>;
}

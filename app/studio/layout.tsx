import { StudioShell } from "@/components/studio/studio-shell";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return <StudioShell userName={session.name} userRole={session.role} organizationName="Vedøy">{children}</StudioShell>;
}

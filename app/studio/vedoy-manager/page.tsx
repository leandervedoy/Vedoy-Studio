import { ModuleHeader } from "@/components/studio/module-header";
import { VedoyManagerConsole } from "@/components/studio/vedoy-manager-console";
import { OwnerReauth } from "@/components/studio/owner-reauth";
import { getSession } from "@/lib/auth";
import { managerDecision, managerLoginPath } from "@/lib/vedoy-owner-access.mjs";
import { notFound, redirect } from "next/navigation";
import "@/app/vedoy-manager.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vedøy Manager · privat", robots: { index: false, follow: false } };

export default async function VedoyManagerPage() {
  const access = managerDecision(await getSession());
  if (access === "login") redirect(managerLoginPath);
  if (access === "notFound") notFound();
  // A pre-existing signed owner session is not a new verified vedoy_owner session.
  // Require a fresh login instead of silently escalating privileges or returning a 404.
  if (access === "reauth") return <OwnerReauth />;
  return <>
    <ModuleHeader eyebrow="VEDØY · EIERVERKTØY" title="Vedøy Manager"
      description="Administrer publiserte priser, nettsideinnhold, roller og kundeforespørsler fra ett kontrollsenter."
      badge="VEDØY OWNER" />
    <VedoyManagerConsole />
  </>;
}

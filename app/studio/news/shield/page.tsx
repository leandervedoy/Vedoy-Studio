import Link from "next/link";
import { requireAdminSession } from "@/lib/auth";
import { ModuleHeader } from "@/components/studio/module-header";
import { NewsShieldPanel } from "@/components/studio/news-shield-panel";
export const dynamic="force-dynamic";
export const metadata={title:"Vedoy Shield – Moderering og annonser"};
export default async function NewsShieldPage(){
  await requireAdminSession();
  return <>
    <ModuleHeader eyebrow="VEDOY NEWS" title="Shield & Advertisement" description="Menneskelig moderering, tidsbestemte utestengelser og tydelig merkede annonser." badge="ADMIN" />
    <p style={{marginBottom:24}}><Link href="/studio/news">← Tilbake til nyhetsredaksjonen</Link></p>
    <NewsShieldPanel/>
  </>;
}

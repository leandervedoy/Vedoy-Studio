import Link from "next/link";
import { requireAdminSession } from "@/lib/auth";
import { ModuleHeader } from "@/components/studio/module-header";
import { OpinionEditor } from "@/components/studio/opinion-editor";
export const dynamic="force-dynamic";
export const metadata={title:"Meninger · Vedoy News redaksjon"};
export default async function OpinionReviewPage(){
 await requireAdminSession();
 return <><ModuleHeader eyebrow="VEDOY NEWS" title="Redaksjonen · Meninger" description="Godkjenn, avslå eller send endringsforslag til forfatteren." badge="ADMIN"/><p style={{marginBottom:24}}><Link href="/studio/news">← Til Vedoy News-redaksjonen</Link></p><OpinionEditor/></>;
}

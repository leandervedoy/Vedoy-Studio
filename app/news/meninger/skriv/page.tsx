import Link from "next/link";
import type { Metadata } from "next";
import { OpinionWorkspace } from "@/components/news/opinion-workspace";
export const metadata:Metadata={title:"Send inn mening · Vedoy News",description:"Del dine perspektiver om utvikling og teknologi. Følg redaksjonell status fra utkast til publisering."};
export default function NewOpinionPage(){
 return <main><nav style={{padding:"18px 5%",background:"#0e170f"}}><Link style={{color:"#b7ff59"}} href="/news">← Vedoy News</Link></nav><OpinionWorkspace/></main>;
}

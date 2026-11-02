import Link from "next/link";
import { getSql } from "@/lib/db";
import { requireSession, isAdminSession } from "@/lib/auth";
export const dynamic = "force-dynamic";
type Tip={id:string;title:string;body:string;category:string};
export default async function Page(){
 const session=await requireSession();let tips:Tip[]=[];let available=true;
 try {const db=getSql();if(!db) throw Error("Mangler database");tips=await db<Tip[]>`select id::text,title,body,category from new_customer_tips where is_active=true order by created_at desc limit 60`;}catch{available=false;}
 return <main style={{display:"grid",gap:24}}>
 <header><p className="eyebrow">VEDOY STUDIO / VEKST</p><h1>Skaff kunder</h1><p>Enkle, praktiske grep for å bli funnet, skape tillit og gjøre besøkende til kunder.</p></header>
 <section className="studio-panel"><h2>Begynn med det du kan best</h2><p>Bruk mest tid på å levere god kvalitet til kundene. En erfaren markedsfører kan gjøre vekstarbeidet mer effektivt, men lønnsomhet er aldri garantert. Avtal mål, budsjett og måling før du kjøper hjelp.</p><Link className="button button--dark" href="/studio/synlighet">Forbedre synligheten →</Link></section>
 <section className="studio-panel"><h2>Vedi foreslår</h2>{tips.length?<RandomTip tips={tips}/>:<p>{available?"Ingen publiserte tips ennå.":"Tipsene kunne ikke hentes fra databasen. Kontakt administrator."}</p>}</section>
 <section className="studio-panel"><div className="panel-heading"><h2>Alle tips</h2>{isAdminSession(session)&&<Link href="/studio/skaff-kunder/admin">Administrer tips →</Link>}</div>{tips.map(t=><article key={t.id} style={{padding:"12px 0",borderBottom:"1px solid #ddd"}}><small>{t.category}</small><h3>{t.title}</h3><p>{t.body}</p></article>)}</section>
 </main>;
}
import { RandomTip } from "@/components/studio/random-tip";

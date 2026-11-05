import { privilegedSupabase } from "@/lib/vedoy-manager";
import { requireVedoyOwnerSession } from "@/lib/auth";
import { CampaignManager } from "./manager-client";
export const dynamic="force-dynamic";
export const metadata={title:"Vedoy Advertize | Vedoy Studio"};
export default async function AdvertizeAdminPage(){
 await requireVedoyOwnerSession();
 const client=privilegedSupabase();
 const [campaigns,metrics,voluntary]=await Promise.all([
  client.from("advertize_campaigns").select("id,slot_key,advertiser,headline,body,destination_url,status,created_at").order("created_at",{ascending:false}).limit(200),
  client.from("advertize_daily_metrics").select("day,campaign_id,slot_key,impressions,clicks").order("day",{ascending:false}).limit(1000),
  client.from("statistics_voluntary_daily").select("day,site_slug,page_group,metric,total").order("day",{ascending:false}).limit(500)
 ]);
 const stats=metrics.data||[];
 const visits=voluntary.data||[];
 const impressions=stats.reduce((sum,x)=>sum+Number(x.impressions),0);
 const clicks=stats.reduce((sum,x)=>sum+Number(x.clicks),0);
 const optIns=visits.filter(x=>x.metric==="page_view").reduce((sum,x)=>sum+Number(x.total),0);
 return <div style={{maxWidth:1080,margin:"0 auto",padding:"25px 20px 70px",fontFamily:"system-ui"}}>
  <p style={{fontSize:11,fontWeight:800,letterSpacing:".12em",color:"#10754b"}}>VEDOY STUDIO · ANNONSERING</p>
  <h1 style={{fontSize:36,letterSpacing:"-.06em",marginBottom:9}}>Vedoy Advertize</h1>
  <p style={{fontSize:13,color:"#607667"}}>Første testversjon: kontekstuelle husannonser, aggregerte leveringshendelser og frivillig besøksstatistikk. Kun Vedoy-eier har administrasjonstilgang.</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:11,margin:"25px 0"}}>
   {[["Annonseforespørsler (ikke verifiserte visninger)",impressions],["Annonseklikk (ikke svindelfiltrert)",clicks],["Frivillige sidevisningsbidrag",optIns],["Kampanjer",campaigns.data?.length??0]].map(([name,value])=><article key={name} style={{borderRadius:15,padding:20,background:"white",border:"1px solid #e0eae1"}}><small style={{color:"#627866"}}>{name}</small><div style={{fontSize:30,fontWeight:850}}>{Number(value).toLocaleString("nb-NO")}</div></article>)}
  </div>
  <CampaignManager campaigns={campaigns.data||[]}/>
  <section style={{marginTop:26,padding:22,background:"white",borderRadius:18,border:"1px solid #dfebdf"}}>
   <h2>Statistikk og integrering</h2>
   <p>Dette er en separat datakilde fra Vedoy Statistics. Frivillige bidrag registreres kun etter et uttrykkelig ja, uten cookie, kontaktliste, identitet eller meldingsinnhold.</p>
   <p style={{fontSize:12}}>Første versjon viser husannonser. Målinger skal ikke brukes til fakturering før visningskvalitet, samtykke, trafikkfiltrering og annonsebeskyttelse er revisjonsklare.</p>
   <code style={{display:"block",whiteSpace:"pre-wrap",overflowWrap:"anywhere",padding:14,background:"#f1f8f2",borderRadius:10}}>{'<iframe src="https://www.vedoystudio.no/api/advertize/frame?slot=sent-sidebar" title="Annonse" sandbox="allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer" loading="lazy"></iframe>'}</code>
  </section>
 </div>;
}

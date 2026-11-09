import { privilegedSupabase } from "@/lib/vedoy-manager";
import { ModuleHeader } from "@/components/studio/module-header";
import { TrafficChart } from "@/components/studio/traffic-chart";
import { trafficPoints } from "@/lib/demo-data";
import { listBookings, listContactRequests, listCustomers, listProjects } from "@/lib/repository";

export const dynamic = "force-dynamic";
async function voluntaryData() {
 try {
  const db=privilegedSupabase();
  const [events,ads,insights]=await Promise.all([
   db.from("statistics_voluntary_daily").select("site_slug,metric,total").limit(1000),
   db.from("advertize_daily_metrics").select("impressions,clicks").limit(1000),
   db.from("statistics_insights_preferences_daily").select("goal,knowledge_level,depth,total").limit(1000),
  ]);
  if(events.error||ads.error||insights.error) throw Error("Stats unavailable");
  return {
   available:true,
   pageViews:(events.data||[]).filter(e=>e.metric==="page_view").reduce((a,e)=>a+Number(e.total),0),
   ctaClicks:(events.data||[]).filter(e=>e.metric==="cta_click").reduce((a,e)=>a+Number(e.total),0),
   adRequests:(ads.data||[]).reduce((a,e)=>a+Number(e.impressions),0),
   adClicks:(ads.data||[]).reduce((a,e)=>a+Number(e.clicks),0),
   readerChoices:(insights.data||[]).reduce((a,e)=>a+Number(e.total),0),
   learningChoices:(insights.data||[]).filter(e=>e.goal==="learn").reduce((a,e)=>a+Number(e.total),0),
   quizChoices:(insights.data||[]).filter(e=>e.goal==="test").reduce((a,e)=>a+Number(e.total),0),
   exploreChoices:(insights.data||[]).filter(e=>e.goal==="explore").reduce((a,e)=>a+Number(e.total),0),
   detailedChoices:(insights.data||[]).filter(e=>e.depth==="deep").reduce((a,e)=>a+Number(e.total),0),
  };
 } catch {return {available:false,pageViews:0,ctaClicks:0,adRequests:0,adClicks:0,readerChoices:0,learningChoices:0,quizChoices:0,exploreChoices:0,detailedChoices:0};}
}

const sources = [
  { name: "Direkte", value: 42, color: "#171714" },
  { name: "Google", value: 31, color: "#2563eb" },
  { name: "Instagram", value: 18, color: "#7c3aed" },
  { name: "Andre", value: 9, color: "#dfb934" }
];

export default async function AnalyticsPage() {
  const [bookings, contacts, customers, projects, consent] = await Promise.all([listBookings(), listContactRequests(), listCustomers(), listProjects(), voluntaryData()]);
  return <><ModuleHeader eyebrow="VOKS" title="Vedøy Statistics" description="Live tall fra Vedøy-databasen, med tydelig skille mellom ekte data og demo." badge="LIVE DATA" /><section className="analytics-kpis"><article><small>Henvendelser</small><strong>{contacts.length}</strong><span>fra databasen</span></article><article><small>Kunder</small><strong>{customers.length}</strong><span>i registeret</span></article><article><small>Bookinger</small><strong>{bookings.length}</strong><span>lagret totalt</span></article><article><small>Prosjekter</small><strong>{projects.length}</strong><span>i Vedøy Growth</span></article></section><section className="studio-panel" aria-label="Frivillig data og annonser">
 <div className="panel-heading"><div><small>VEDOY STATISTICS · FRIVILLIG</small><h2>Besøksbidrag og annonser</h2></div></div>
 {consent.available?<><p className="settings-copy">Aggregerte hendelser uten personprofiler. Frivillige lesevalg er ikke unike personer og kan inneholde gjentatte bidrag.</p>
 <div className="source-list">
  <div><span>Frivillige sidevisninger</span><strong>{consent.pageViews.toLocaleString("nb-NO")}</strong></div>
  <div><span>Frivillige CTA-klikk</span><strong>{consent.ctaClicks.toLocaleString("nb-NO")}</strong></div><div><span>Frivillige lesevalg (Insights)</span><strong>{consent.readerChoices.toLocaleString("nb-NO")}</strong></div><div><span>Ønsker å lære</span><strong>{consent.learningChoices.toLocaleString("nb-NO")}</strong></div><div><span>Ønsker quiz</span><strong>{consent.quizChoices.toLocaleString("nb-NO")}</strong></div><div><span>Ønsker å utforske</span><strong>{consent.exploreChoices.toLocaleString("nb-NO")}</strong></div><div><span>Ønsker detaljert innhold</span><strong>{consent.detailedChoices.toLocaleString("nb-NO")}</strong></div>
  <div><span>Annonseforespørsler</span><strong>{consent.adRequests.toLocaleString("nb-NO")}</strong></div>
  <div><span>Annonseklikk</span><strong>{consent.adClicks.toLocaleString("nb-NO")}</strong></div>
 </div></>:<p role="status">Frivillig statistikk er ikke tilgjengelig. Kontroller databaseintegrasjonen.</p>}
 </section><div className="analytics-grid"><article className="studio-panel studio-panel--large"><div className="panel-heading"><div><small>TRAFIKK · DEMO</small><h2>Besøksmåling kommer</h2></div><span className="status-chip status-chip--pending">IKKE KOBLET</span></div><p className="settings-copy">Vercel Analytics er installert for innsamling. En egen Vedøy-trackingtabell kobles til her når vi skal vise live besøk, kilder og konverteringer uten å blande leverandørdata.</p><TrafficChart points={trafficPoints} /></article><article className="studio-panel"><div className="panel-heading"><div><small>DATAGRUNNLAG</small><h2>Live kilder</h2></div></div><div className="source-list"><div><span><i style={{ background: "#16a34a" }} />Booking</span><strong>{bookings.length}</strong></div><div><span><i style={{ background: "#2563eb" }} />Henvendelser</span><strong>{contacts.length}</strong></div><div><span><i style={{ background: "#7c3aed" }} />Kunder</span><strong>{customers.length}</strong></div></div></article><article className="studio-panel funnel-panel"><div className="panel-heading"><div><small>LIVE OVERSIKT</small><h2>Fra henvendelse til kunde</h2></div></div><div className="funnel"><div style={{ width: "100%" }}><span>{contacts.length}</span><small>Henvendelser</small></div><div style={{ width: contacts.length ? "70%" : "0%" }}><span>{bookings.length}</span><small>Bookinger</small></div><div style={{ width: contacts.length ? "45%" : "0%" }}><span>{customers.length}</span><small>Kunder</small></div></div></article><article className="studio-panel insight-list"><div className="panel-heading"><div><small>NESTE STEG</small><h2>Hva mangler?</h2></div></div><article><span>↗</span><div><strong>Live besøksdata</strong><p>Koble Vedøy Tracking til siden for ekte sidevisninger og kampanjekilder.</p></div></article><article><span>✦</span><div><strong>Konverteringsmål</strong><p>Registrer booking, skjema og kjøp som mål når betalingsflyten er klar.</p></div></article></article></div></>;
}

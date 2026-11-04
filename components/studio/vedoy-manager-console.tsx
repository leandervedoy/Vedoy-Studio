"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { RoleEditor } from "@/components/studio/role-editor";
type PriceRow = { code:string;category:string;title:string;description:string;amount_ore:number;setup_ore:number;features:string[];featured:boolean;published:boolean;version:number;billing_period:string;vat_mode:string };
type ContentRow = { content_key:string;eyebrow:string;heading:string;body:string;published:boolean;version:number };
type Lead = {id:string;created_at:string;plan_code:string;company_name:string;contact_person:string;email:string;phone:string|null;status:string};
type Audit = {actor_email:string;action:string;entity_type:string;entity_key:string;created_at:string};
const kroner=(ore:number)=>new Intl.NumberFormat("nb-NO",{maximumFractionDigits:2}).format(ore/100);
export function VedoyManagerConsole(){
  const [tab,setTab]=useState<"prices"|"content"|"roles"|"leads"|"audit"|"tools">("prices");
  const [prices,setPrices]=useState<PriceRow[]>([]);
  const [content,setContent]=useState<ContentRow[]>([]);
  const [audit,setAudit]=useState<Audit[]>([]);
  const [leads,setLeads]=useState<Lead[]>([]);
  const [price,setPrice]=useState<PriceRow|null>(null);
  const [copy,setCopy]=useState<ContentRow|null>(null);
  const [notice,setNotice]=useState("");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  async function load(){
    setLoading(true);
    try{
      const [cr,lr]=await Promise.all([fetch("/api/vedoy-manager/catalog",{cache:"no-store"}),fetch("/api/vedoy-manager/leads",{cache:"no-store"})]);
      const cd=await cr.json();const ld=await lr.json();
      if(!cr.ok)throw Error(cd.error||"Ingen tilgang til katalogen.");
      setPrices(cd.prices||[]);setContent(cd.content||[]);setAudit(cd.audit||[]);
      if(lr.ok)setLeads(ld.leads||[]);
      setPrice(current=>cd.prices?.find((p:PriceRow)=>p.code===current?.code)||cd.prices?.[0]||null);
      setCopy(current=>cd.content?.find((c:ContentRow)=>c.content_key===current?.content_key)||cd.content?.[0]||null);
    }catch(error){setNotice(error instanceof Error?error.message:"Kunne ikke hente data.");}
    finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);
  async function savePrice(){
    if(!price)return;setSaving(true);setNotice("");
    try{
      const response=await fetch("/api/vedoy-manager/catalog",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        type:"price",key:price.code,version:price.version,title:price.title,description:price.description,
        amountOre:price.amount_ore,setupOre:price.setup_ore,features:price.features,featured:price.featured,published:price.published
      })});
      const data=await response.json();if(!response.ok)throw Error(data.error||"Lagringen feilet.");
      setNotice("Prisendringen er lagret i Supabase. Publiserte priser distribueres gjennom Developer Portal.");await load();
    }catch(error){setNotice(error instanceof Error?error.message:"Kunne ikke lagre prisen.");}
    finally{setSaving(false);}
  }
  async function saveContent(){
    if(!copy)return;setSaving(true);setNotice("");
    try{
      const response=await fetch("/api/vedoy-manager/catalog",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        type:"content",key:copy.content_key,version:copy.version,eyebrow:copy.eyebrow,heading:copy.heading,body:copy.body,published:copy.published
      })});
      const data=await response.json();if(!response.ok)throw Error(data.error||"Lagringen feilet.");
      setNotice("Innholdet er lagret og blir tilgjengelig gjennom Developer Portal.");await load();
    }catch(error){setNotice(error instanceof Error?error.message:"Kunne ikke lagre teksten.");}
    finally{setSaving(false);}
  }
  const tabs=[["prices","Priser"],["content","Nettsideinnhold"],["roles","Roller"],["leads","Leads"],["audit","Endringslogg"],["tools","Verktøy"]] as const;
  return <div className="vm">
    <div className="vm-banner"><div><small>PRIVAT KONTROLLSENTER · VEDØY</small><h2>Én kilde for priser og innhold.</h2><p>Rediger på ett sted. Publiserte endringer deles via Vedøy Developer Portal.</p></div><span><i/> Eiertilgang verifisert</span></div>
    <nav className="vm-tabs" aria-label="Vedøy Manager"><>{tabs.map(([key,label])=><button type="button" key={key} onClick={()=>{setTab(key);setNotice("");}} className={tab===key?"active":""}>{label}</button>)}</></nav>
    {loading&&<p className="vm-notice">Henter data fra Vedøy …</p>}
    {notice&&<p role="status" className="vm-notice">{notice}</p>}
    {tab==="prices"&&<div className="vm-grid">
      <section className="vm-panel vm-list"><h3>Priskatalog ({prices.length})</h3>{prices.map(p=><button type="button" key={p.code} onClick={()=>setPrice(p)} className={price?.code===p.code?"active":""}><span><strong>{p.title}</strong><small>{p.category} · {p.code}</small></span><b>{kroner(p.amount_ore)} kr</b></button>)}</section>
      <section className="vm-panel vm-editor"><h3>Rediger pris</h3>{price?<><p className="vm-muted">ID: {price.code} · versjon {price.version}</p>
        <label>Tittel<input value={price.title} maxLength={140} onChange={e=>setPrice({...price,title:e.target.value})}/></label>
        <label>Beskrivelse<textarea value={price.description} rows={3} onChange={e=>setPrice({...price,description:e.target.value})}/></label>
        <div className="vm-dual"><label>Pris (NOK)<input type="number" min={0} max={1000000} step="0.01" value={price.amount_ore/100} onChange={e=>setPrice({...price,amount_ore:Math.round(Number(e.target.value)*100)})}/></label>
        <label>Etablering (NOK)<input type="number" min={0} step="0.01" value={price.setup_ore/100} onChange={e=>setPrice({...price,setup_ore:Math.round(Number(e.target.value)*100)})}/></label></div>
        <label>Inkluderte fordeler (én per linje)<textarea rows={6} value={price.features.join("\n")} onChange={e=>setPrice({...price,features:e.target.value.split("\n").map(x=>x.trim()).filter(Boolean)})}/></label>
        <div className="vm-options"><label><input type="checkbox" checked={price.published} onChange={e=>setPrice({...price,published:e.target.checked})}/> Publisert</label><label><input type="checkbox" checked={price.featured} onChange={e=>setPrice({...price,featured:e.target.checked})}/> Fremhevet</label></div>
        <button className="vm-action" type="button" disabled={saving} onClick={()=>void savePrice()}>{saving?"Lagrer …":"Lagre ny pris"}</button>
      </>:<p>Ingen priser er lastet.</p>}</section>
    </div>}
    {tab==="content"&&<div className="vm-grid"><section className="vm-panel vm-list"><h3>Redigerbare seksjoner</h3>{content.map(c=><button type="button" key={c.content_key} onClick={()=>setCopy(c)} className={copy?.content_key===c.content_key?"active":""}><span><strong>{c.heading}</strong><small>{c.content_key}</small></span></button>)}</section>
      <section className="vm-panel vm-editor"><h3>Rediger nettsidetekst</h3>{copy?<><p className="vm-muted">Plassering: {copy.content_key} · versjon {copy.version}</p>
      <label>Overtittel<input maxLength={120} value={copy.eyebrow} onChange={e=>setCopy({...copy,eyebrow:e.target.value})}/></label>
      <label>Overskrift<textarea rows={3} maxLength={280} value={copy.heading} onChange={e=>setCopy({...copy,heading:e.target.value})}/></label>
      <label>Beskrivelse<textarea rows={8} maxLength={2200} value={copy.body} onChange={e=>setCopy({...copy,body:e.target.value})}/></label>
      <label><input type="checkbox" checked={copy.published} onChange={e=>setCopy({...copy,published:e.target.checked})}/> Publiser denne seksjonen</label>
      <button className="vm-action" disabled={saving} onClick={()=>void saveContent()}>{saving?"Lagrer …":"Lagre innhold"}</button></>:<p>Ingen innhold er lastet.</p>}</section>
    </div>}
    {tab==="roles"&&<section className="vm-panel"><h3>Roller og tilganger</h3><RoleEditor/></section>}
    {tab==="leads"&&<section className="vm-panel"><h3>Prisforespørsler</h3><p className="vm-muted">Viser de siste 100 henvendelsene. Kun Vedøy Owner har tilgang til disse personopplysningene.</p>
      <div className="vm-table-scroll"><table><thead><tr><th>Mottatt</th><th>Bedrift</th><th>Kontakt</th><th>Valgt pakke</th><th>Status</th></tr></thead><tbody>{leads.map(l=><tr key={l.id}><td>{new Date(l.created_at).toLocaleDateString("nb-NO")}</td><td>{l.company_name}</td><td><a href={`mailto:${l.email}`}>{l.contact_person}</a><small>{l.email} · {l.phone||"—"}</small></td><td>{l.plan_code}</td><td>{l.status}</td></tr>)}</tbody></table>{leads.length===0&&<p>Ingen forespørsler ennå.</p>}</div></section>}
    {tab==="audit"&&<section className="vm-panel"><h3>Siste endringer</h3><div className="vm-table-scroll"><table><thead><tr><th>Tidspunkt</th><th>Bruker</th><th>Handling</th><th>Objekt</th></tr></thead><tbody>{audit.map((a,i)=><tr key={i}><td>{new Date(a.created_at).toLocaleString("nb-NO")}</td><td>{a.actor_email}</td><td>{a.action}</td><td>{a.entity_type}: {a.entity_key}</td></tr>)}</tbody></table>{audit.length===0&&<p>Ingen registrerte endringer.</p>}</div></section>}
    {tab==="tools"&&<section className="vm-tools"><a href="https://vedoy-dev-portal.vercel.app" target="_blank" rel="noreferrer"><strong>API-sentral</strong><span>Vedøy Developer Portal ↗</span></a>
      <Link href="/studio/requests"><strong>Henvendelser</strong><span>Følg opp kundeforespørsler ↗</span></Link>
      <Link href="/studio/services"><strong>Tjenestekatalog</strong><span>Rediger tjenester på nettsiden ↗</span></Link>
      <Link href="/studio/analytics"><strong>Statistikk</strong><span>Se drift og utvikling ↗</span></Link>
      <Link href="/studio/team"><strong>Team</strong><span>Organiser medarbeidere ↗</span></Link>
      <Link href="/studio/roles"><strong>Bedriftsroller</strong><span>Administrer tilganger ↗</span></Link></section>}
    <p className="vm-muted vm-footnote">Tilgangen krever innlogget og bekreftet leander@vedoy.store. Dette grensesnittet eksponerer ingen Supabase-nøkler i nettleseren.</p>
  </div>;
}

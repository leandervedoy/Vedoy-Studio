"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./opinion-workspace.module.css";

type Opinion={id:string;authorName:string;title:string;excerpt:string;body:string;status:"pending_review"|"changes_requested"|"author_approval"|"rejected"|"published";feedback:string|null;proposedTitle:string|null;proposedExcerpt:string|null;proposedBody:string|null;createdAt:string};
const blank={title:"",excerpt:"",body:""};
const labels:Record<Opinion["status"],string>={
 pending_review:"Venter på gjennomgang",
 changes_requested:"Vedøy ber om endringer",
 author_approval:"Vedøy ber om endringer",
 rejected:"Ikke godkjent",
 published:"Publisert"
};
export function OpinionWorkspace(){
 const [form,setForm]=useState(blank);
 const [terms,setTerms]=useState(false);
 const [my,setMy]=useState<Opinion[]>([]);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const [loggedOut,setLoggedOut]=useState(false),[active,setActive]=useState<string|null>(null);
 const [editing,setEditing]=useState<string|null>(null);
 async function refresh(){
  try{
   const res=await fetch("/api/news/opinions",{cache:"no-store"});
   const json=await res.json();
   if(res.status===401){setLoggedOut(true);return;}
   if(!res.ok)throw new Error(json.error||"Kunne ikke hente innlegg.");
   setMy(json.opinions||[]);setLoggedOut(false);
  }catch(err){setMessage(err instanceof Error?err.message:"Kunne ikke hente innlegg.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void refresh();},[]);
 async function request(url:string,payload:Record<string,unknown>){
  setBusy(true);setMessage("");
  try{
   const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||"Handlingen mislyktes.");
   setMessage(data.message||"Endringene er lagret.");setActive(null);setEditing(null);setForm(blank);setTerms(false);
   await refresh();
   if(data.slug){window.location.assign("/news/"+data.slug);}
  }catch(err){setMessage(err instanceof Error?err.message:"Kunne ikke lagre.");}
  finally{setBusy(false);}
 }
 function openEditor(opinion:Opinion){setEditing(opinion.id);setForm({title:opinion.title,excerpt:opinion.excerpt,body:opinion.body});setActive(null);}
 const selected=my.find(x=>x.id===active);
 return <div className={styles.layout}>
  <div className={styles.head}><div><span className={styles.kicker}>DIN STEMME · DITT NAVN</span><h1>Skriv en <em>mening.</em></h1><p>Del en begrunnet mening om kode, teknologi, KI eller sikkerhet. Vedoy gjennomgår alle innlegg før publisering. Leserne ser tydelig at meningen er din, ikke Vedøys.</p></div></div>
  {loggedOut?<div className={styles.panel}><h2>Logg inn for å bidra</h2><p>Bruk Vedøy-kontoen din for å skrive, sende inn og følge status.</p><Link className={styles.primaryLink} href={"/login?next="+encodeURIComponent("/news/meninger/skriv")}>Logg inn med Vedøy ↗</Link></div>:null}
  {!loggedOut?<div className={styles.columns}>
   <section className={styles.panel} aria-labelledby="new-opinion">
    <h2 id="new-opinion">{editing?"Oppdater meningen":"Send inn din mening"}</h2>
    <form className={styles.form} onSubmit={e=>{
      e.preventDefault();
      if(editing){void request("/api/news/opinions/"+editing,{action:"resubmit",...form});}
      else if(terms){void request("/api/news/opinions",{...form,licenseConfirmed:true});}
    }}>
     <label>Tittel <input minLength={10} maxLength={160} required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Hva mener du om ...?"/></label>
     <label>Kort ingress <textarea rows={3} minLength={20} maxLength={500} required value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} placeholder="Oppsummer budskapet ditt i to setninger."/></label>
     <label>Innlegget <textarea rows={13} minLength={300} maxLength={20000} required value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Argumenter, eksempler, kilder og din konklusjon."/></label>
     <span className={styles.help}>{form.body.length}/20 000 tegn · Minst 300 tegn</span>
     {!editing?<label className={styles.consent}><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} required/> Jeg har rettigheter til teksten og gir Vedoy News en ikke-eksklusiv rett til å publisere og dele den med navnet mitt. Større redaksjonelle endringer må godkjennes av meg. Jeg bekrefter at innlegget ikke inneholder plagiert eller ulovlig innhold.</label>:null}
     <div className={styles.actions}><button type="submit" disabled={busy||(!editing&&!terms)}>{busy?"Sender …":editing?"Send oppdatert innlegg":"Send til gjennomgang"}</button>{editing?<button type="button" className={styles.secondary} onClick={()=>{setEditing(null);setForm(blank);}}>Avbryt</button>:null}</div>
    </form>
   </section>
   <section className={styles.panel} aria-labelledby="mine-meninger">
    <div className={styles.panelTop}><h2 id="mine-meninger">Mine innlegg</h2><button className={styles.secondary} type="button" disabled={busy} onClick={()=>void refresh()}>Oppdater</button></div>
    {loading?<p>Henter innlegg …</p>:null}
    {my.map(opinion=><article className={styles.item} key={opinion.id}>
      <div><span className={styles.status} data-status={opinion.status}>{labels[opinion.status]}</span><time dateTime={opinion.createdAt}>{new Date(opinion.createdAt).toLocaleDateString("nb-NO")}</time></div>
      <h3>{opinion.title}</h3><p>{opinion.excerpt}</p>
      <div className={styles.actions}>
        {(opinion.status==="rejected"||opinion.status==="changes_requested"||opinion.status==="author_approval")?<button type="button" className={styles.secondary} onClick={()=>setActive(opinion.id)}>Info / redaksjonens svar</button>:null}
        {opinion.status==="changes_requested"?<button type="button" onClick={()=>openEditor(opinion)}>Rediger og send på nytt</button>:null}
        {opinion.status==="published"?<Link href="/news?topic=meninger">Se publiserte meninger ↗</Link>:null}
      </div>
    </article>)}
    {!my.length&&!loading?<p>Du har ingen innsendte meninger ennå.</p>:null}
   </section>
  </div>:null}
  {message?<p role="status" className={styles.notice}>{message}</p>:null}
  {selected?<div role="presentation" className={styles.overlay} onMouseDown={e=>{if(e.target===e.currentTarget)setActive(null);}}>
    <section className={styles.modal} role="dialog" aria-modal="true" aria-label="Redaksjonens svar">
     <div className={styles.panelTop}><h2>Redaksjonens svar</h2><button type="button" className={styles.secondary} onClick={()=>setActive(null)}>Lukk</button></div>
     <span className={styles.status} data-status={selected.status}>{labels[selected.status]}</span>
     <p>{selected.feedback||"Redaksjonen har ikke lagt inn en begrunnelse ennå."}</p>
     {selected.status==="author_approval"?<>
       <div className={styles.proposal}><h3>Vedøys foreslåtte versjon</h3><strong>{selected.proposedTitle}</strong><p>{selected.proposedExcerpt}</p><div className={styles.proposedBody}>{selected.proposedBody}</div></div>
       <p className={styles.help}>Ved å godkjenne denne versjonen bekrefter du at den kan publiseres i ditt navn. Innlegget blir offentlig umiddelbart.</p>
       <div className={styles.actions}>
         <button type="button" disabled={busy} onClick={()=>void request("/api/news/opinions/"+selected.id,{action:"approve-and-publish"})}>Godkjenn endring og publiser</button>
         <button type="button" disabled={busy} className={styles.secondary} onClick={()=>void request("/api/news/opinions/"+selected.id,{action:"request-another-revision"})}>Jeg ønsker å redigere selv</button>
       </div>
     </>:null}
     {selected.status==="changes_requested"?<button type="button" onClick={()=>openEditor(selected)}>Rediger og send på nytt</button>:null}
    </section>
   </div>:null}
 </div>;
}

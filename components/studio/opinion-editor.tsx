"use client";
import { useEffect,useState } from "react";
import styles from "./opinion-editor.module.css";

type Opinion={id:string;authorName:string;authorId:string;title:string;excerpt:string;body:string;status:string;feedback:string|null};
export function OpinionEditor(){
 const [items,setItems]=useState<Opinion[]>([]);
 const [selected,setSelected]=useState<Opinion|null>(null);
 const [proposal,setProposal]=useState({title:"",excerpt:"",body:""});
 const [reason,setReason]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 async function load(){
  try{
   const r=await fetch("/api/news/opinions/moderation",{cache:"no-store"});
   const data=await r.json();if(!r.ok)throw new Error(data.error||"Kunne ikke hente.");
   setItems(data.opinions||[]);
  }catch(e){setMessage(e instanceof Error?e.message:"Feil");}
 }
 useEffect(()=>{void load();},[]);
 function open(item:Opinion){
  setSelected(item);setReason("");setProposal({title:item.title,excerpt:item.excerpt,body:item.body});
 }
 async function decide(body:Record<string,unknown>){
  if(!selected||busy)return;
  setBusy(true);setMessage("");
  try{
   const r=await fetch("/api/news/opinions/moderation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected.id,...body})});
   const data=await r.json();if(!r.ok)throw new Error(data.error||"Feil ved lagring.");
   setSelected(null);await load();setMessage(data.message||"Lagret.");
  }catch(e){setMessage(e instanceof Error?e.message:"Feil ved lagring.");}
  finally{setBusy(false);}
 }
 return <div className={styles.layout}>
  <div className={styles.top}><h2>Innsendte meningsinnlegg ({items.length})</h2><button type="button" onClick={()=>void load()}>Oppdater</button></div>
  <p>Publiser originalen, be om endring, avvis med begrunnelse eller send en redigert versjon til forfatteren.</p>
  {message?<p role="status">{message}</p>:null}
  {items.map(item=><article key={item.id} className={styles.card}>
   <div><small>{item.status==="pending_review"?"Venter på gjennomgang":item.status==="author_approval"?"Venter på forfatterens godkjenning":"Endringer etterspurt"}</small><h3>{item.title}</h3><p>Av {item.authorName} · {item.authorId}</p></div>
   <button type="button" onClick={()=>open(item)}>Åpne sak</button>
  </article>)}
  {!items.length?<p>Ingen saker til gjennomgang.</p>:null}
  {selected?<div className={styles.backdrop} onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
   <section role="dialog" aria-modal="true" aria-label="Gjennomgå mening" className={styles.dialog}>
    <div className={styles.top}><div><small>{selected.authorName} · MENING</small><h2>{selected.title}</h2></div><button type="button" onClick={()=>setSelected(null)}>Lukk</button></div>
    <p>{selected.excerpt}</p><div className={styles.body}>{selected.body}</div>
    {selected.status==="pending_review"?<>
     <h3>Redaksjonelt forslag</h3>
     <label>Overskrift <input value={proposal.title} onChange={e=>setProposal({...proposal,title:e.target.value})}/></label>
     <label>Ingress <textarea rows={3} value={proposal.excerpt} onChange={e=>setProposal({...proposal,excerpt:e.target.value})}/></label>
     <label>Forslag til artikkel <textarea rows={12} value={proposal.body} onChange={e=>setProposal({...proposal,body:e.target.value})}/></label>
     <label>Begrunnelse eller ønskede endringer <textarea rows={4} value={reason} onChange={e=>setReason(e.target.value)}/></label>
     <div className={styles.actions}>
      <button disabled={busy} onClick={()=>{if(confirm("Publisere den originale meningen?"))void decide({action:"publish_original"});}}>Godkjenn og publiser original</button>
      <button disabled={busy||reason.trim().length<5} onClick={()=>void decide({action:"propose",feedback:reason,...proposal})}>Send redigert versjon til forfatter</button>
      <button disabled={busy||reason.trim().length<5} onClick={()=>void decide({action:"request_changes",feedback:reason})}>Be om endringer</button>
      <button disabled={busy||reason.trim().length<5} onClick={()=>void decide({action:"reject",feedback:reason})}>Ikke godkjenn</button>
     </div>
    </>:<p>Denne saken venter på at forfatteren sender oppdatering eller godkjenner forslag. Redaksjonen kan ikke publisere en redigert versjon uten samtykke.</p>}
   </section>
  </div>:null}
 </div>;
}

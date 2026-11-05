"use client";
import { useEffect, useState } from "react";
import styles from "./news-shield-panel.module.css";

type Flag={id:string;postId:string;userId:string;username:string;body:string;reason:string;createdAt:string};
type Ban={userId:string;username:string;expiresAt:string;reason:string};
type Phrase={id:string;phrase:string;active:boolean};
type Ad={id:string;sponsor:string;headline:string;body:string;destinationUrl:string;placement:string;status:"draft"|"active"|"paused"};
type Overview={flagged:Flag[];bans:Ban[];terms:Phrase[];ads:Ad[]};
const empty:Overview={flagged:[],bans:[],terms:[],ads:[]};
export function NewsShieldPanel(){
  const [data,setData]=useState<Overview>(empty),[loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const [phrase,setPhrase]=useState(""),[banReason,setBanReason]=useState("Brudd på kommentarfeltets regler");
  const [banHours,setBanHours]=useState(24);
  const [ad,setAd]=useState({sponsor:"",headline:"",body:"",destinationUrl:"",placement:"index"});
  async function load(){
    try{const response=await fetch("/api/news/shield",{cache:"no-store"});const next=await response.json();
      if(!response.ok)throw new Error(next.error||"Kunne ikke hente data.");
      setData(next);setMessage("");
    }catch(error){setMessage(error instanceof Error?error.message:"Tjenesten er utilgjengelig.");}
    finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);
  async function act(body:Record<string,unknown>){
    if(busy)return;setBusy(true);
    try{
      const response=await fetch("/api/news/shield",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Handlingen mislyktes.");
      await load();setMessage("Endringen ble lagret.");
    }catch(error){setMessage(error instanceof Error?error.message:"Kunne ikke lagre.");}
    finally{setBusy(false);}
  }
  return <div className={styles.layout}>
    <div className={styles.intro}><h2>Vedoy Shield & Advertisement</h2><p>Moderer offentlige kommentarer, velg tidsbegrenset utestenging og administrer tydelig merkede sponsorannonser. Ingen private krypterte samtaler blir skannet.</p></div>
    {loading?<p>Henter modereringskø …</p>:null}
    {message?<p role="status" className={styles.notice}>{message}</p>:null}
    <section className={styles.panel}>
      <h3>Til vurdering ({data.flagged.length})</h3><p>Automatiske treff gir en menneskelig vurdering, ikke en automatisk permanent utestenging.</p>
      {data.flagged.map(item=><article key={item.id} className={styles.queueItem}>
        <div className={styles.meta}><strong>{item.username}</strong><span>Bruker-ID: <code>{item.userId}</code></span><span>Artikkel: {item.postId}</span></div>
        <p className={styles.reason}>Årsak: {item.reason}</p>
        <blockquote>{item.body}</blockquote>
        <div className={styles.actions}>
          <button disabled={busy} onClick={()=>act({action:"approve",id:item.id})}>Godkjenn</button>
          <button disabled={busy} onClick={()=>act({action:"remove",id:item.id})}>Skjul / fjern</button>
          <button disabled={busy} onClick={()=>act({action:"ban",userId:item.userId,hours:banHours,reason:banReason})}>Utesteng bruker</button>
        </div>
      </article>)}
      {!data.flagged.length?<p>Ingen meldinger venter på vurdering.</p>:null}
      <div className={styles.row}><label>Utestengelse <select value={banHours} onChange={e=>setBanHours(Number(e.target.value))}><option value={1}>1 time</option><option value={24}>1 døgn</option><option value={168}>7 dager</option><option value={720}>30 dager</option></select></label><label>Begrunnelse <input value={banReason} maxLength={240} onChange={e=>setBanReason(e.target.value)}/></label></div>
    </section>
    <section className={styles.panel}><h3>Aktive utestengelser ({data.bans.length})</h3>
      {data.bans.map(ban=><div key={ban.userId} className={styles.listRow}><div><strong>{ban.username}</strong><p><code>{ban.userId}</code> · Til {new Date(ban.expiresAt).toLocaleString("nb-NO")} · {ban.reason}</p></div><button disabled={busy} onClick={()=>act({action:"unban",userId:ban.userId})}>Opphev</button></div>)}
      {!data.bans.length?<p>Ingen aktive utestengelser.</p>:null}
    </section>
    <section className={styles.panel}><h3>Ord- og setningsfilter</h3><p>Legg bare til konkrete ord og uttrykk. Alle treff sendes til moderering for å unngå urimelig automatisk sensur.</p>
      <form className={styles.row} onSubmit={e=>{e.preventDefault();void act({action:"phrase",phrase});setPhrase("");}}><input aria-label="Ord eller setning" value={phrase} onChange={e=>setPhrase(e.target.value)} minLength={3} maxLength={80} placeholder="Ord eller setning"/><button type="submit" disabled={busy||phrase.trim().length<3}>Legg til</button></form>
      {data.terms.map(term=><div key={term.id} className={styles.listRow}><span>{term.phrase}</span><button disabled={busy} onClick={()=>act({action:"phrase-toggle",id:term.id,active:!term.active})}>{term.active?"Deaktiver":"Aktiver"}</button></div>)}
    </section>
    <section className={styles.panel}><h3>Vedoy Advertisement</h3><p>Sponsede innlegg er tydelig merket «ANNONSE». Annonsører kan ikke publisere direkte uten redaksjonell godkjenning.</p>
      <form className={styles.form} onSubmit={e=>{e.preventDefault();void act({action:"ad-create",...ad});setAd({sponsor:"",headline:"",body:"",destinationUrl:"",placement:"index"});}}>
        <label>Annonsør <input required minLength={2} maxLength={100} value={ad.sponsor} onChange={e=>setAd({...ad,sponsor:e.target.value})}/></label>
        <label>Overskrift <input required minLength={3} maxLength={140} value={ad.headline} onChange={e=>setAd({...ad,headline:e.target.value})}/></label>
        <label>Beskrivelse <textarea required minLength={5} maxLength={400} value={ad.body} onChange={e=>setAd({...ad,body:e.target.value})}/></label>
        <label>Lenke (HTTPS) <input required type="url" pattern="https://.*" value={ad.destinationUrl} onChange={e=>setAd({...ad,destinationUrl:e.target.value})}/></label>
        <label>Plassering <select value={ad.placement} onChange={e=>setAd({...ad,placement:e.target.value})}><option value="index">Nyhetsoversikt</option><option value="article">Artikler</option><option value="all">Begge</option></select></label>
        <button type="submit" disabled={busy}>Opprett annonse som utkast</button>
      </form>
      {data.ads.map(item=><div className={styles.listRow} key={item.id}><div><strong>{item.sponsor} · {item.headline}</strong><p>{item.placement} · {item.status}</p></div>
        <button disabled={busy} onClick={()=>act({action:"ad-status",id:item.id,status:item.status==="active"?"paused":"active"})}>{item.status==="active"?"Pause":"Aktiver"}</button>
      </div>)}
    </section>
  </div>;
}

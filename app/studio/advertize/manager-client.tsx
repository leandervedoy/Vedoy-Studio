"use client";
import { useState, type FormEvent } from "react";
type Campaign={id:string;slot_key:string;advertiser:string;headline:string;body:string;destination_url:string;status:string;created_at:string};
export function CampaignManager({campaigns}:{campaigns:Campaign[]}){
 const [items,setItems]=useState(campaigns);
 const [notice,setNotice]=useState("");
 const [busy,setBusy]=useState(false);
 const control={padding:"10px 12px",border:"1px solid #dce5dc",borderRadius:10,width:"100%",font:"inherit"} as const;
 async function requestChange(event:FormEvent<HTMLFormElement>){
   event.preventDefault();if(busy)return;setBusy(true);setNotice("");
   const form=event.currentTarget;
   const values=Object.fromEntries(new FormData(form).entries());
   const response=await fetch("/api/advertize/manage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});
   const data=await response.json().catch(()=>({error:"Ukjent feil"}));
   if(!response.ok)setNotice(data.error||"Kunne ikke lagre.");
   else{setNotice("Utkast opprettet. Oppdater siden for å gjennomgå og aktivere.");form.reset();}
   setBusy(false);
 }
 async function change(id:string,status:"draft"|"active"|"paused"){
   if(busy)return;setBusy(true);setNotice("");
   const response=await fetch("/api/advertize/manage",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
   if(response.ok)setItems(current=>current.map(x=>x.id===id?{...x,status}:x));
   else setNotice("Status kunne ikke endres.");
   setBusy(false);
 }
 return <div style={{display:"grid",gap:24}}>
  <form onSubmit={event=>void requestChange(event)} style={{display:"grid",gap:12,background:"white",border:"1px solid #e2e9e2",borderRadius:18,padding:22}}>
   <h2 style={{margin:0}}>Ny husannonse</h2>
   <p style={{margin:0,fontSize:13,color:"#627463"}}>Lages som utkast. Ingen eksterne annonsører eller betalinger aktiveres automatisk.</p>
   <label>Plassering<select name="slot_key" required style={control}><option value="sent-sidebar">Sent – samtalelisten</option><option value="studio-home">Studio – offentlig forside</option></select></label>
   <label>Annonsør<input style={control} name="advertiser" minLength={2} maxLength={100} required defaultValue="Vedoy Studio"/></label>
   <label>Overskrift<input style={control} name="headline" minLength={3} maxLength={100} required/></label>
   <label>Beskrivelse<textarea style={control} name="body" minLength={5} maxLength={240} required/></label>
   <label>Mål-URL (HTTPS)<input style={control} name="destination_url" type="url" required placeholder="https://vedoystudio.no"/></label>
   <button type="submit" disabled={busy} style={{padding:12,border:0,borderRadius:10,background:"#145b40",color:"#fff",fontWeight:800}}>{busy?"Lagrer...":"Opprett utkast"}</button>
  </form>
  <section aria-label="Kampanjer" style={{background:"white",padding:22,borderRadius:18,border:"1px solid #e0e9e0"}}>
   <h2 style={{marginTop:0}}>Kampanjer</h2>
   {items.length===0?<p>Ingen kampanjer.</p>:items.map(c=><article key={c.id} style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",padding:"14px 0",borderTop:"1px solid #e9efe9"}}>
    <div><strong>{c.headline}</strong><div style={{fontSize:12,color:"#5b7262"}}>{c.advertiser} · {c.slot_key} · {c.status}</div><p style={{fontSize:12,color:"#5b7262",maxWidth:500}}>{c.body}</p></div>
    <div style={{display:"flex",gap:5,alignItems:"start"}}>{(["active","paused","draft"] as const).filter(status=>status!==c.status).map(status=><button key={status} disabled={busy} onClick={()=>void change(c.id,status)} style={{padding:"8px 10px",fontSize:11,borderRadius:8,border:"1px solid #dce6dc",background:"#f6faf7"}}>{status==="active"?"Aktiver":status==="paused"?"Pause":"Utkast"}</button>)}</div>
   </article>)}
  </section>
  {notice&&<p role="status">{notice}</p>}
 </div>;
}

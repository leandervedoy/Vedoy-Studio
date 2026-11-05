"use client";
import { useState } from "react";

/** Explicit opt-in only; no cookies or local tracking identifiers. */
export function VoluntaryStatistics({site="studio",group="home"}:{
 site?:"studio"|"sent";
 group?:"home"|"marketing"|"sent"|"news";
}){
 const [choice,setChoice]=useState<"idle"|"accepted"|"declined">("idle");
 const [status,setStatus]=useState("");
 async function select(choice:"accepted"|"declined"){
   setChoice(choice);setStatus(choice==="accepted"?"Takk! Én anonym, aggregert sidevisning registreres.":"Valget er respektert. Ingen måling sendes.");
   if(choice!=="accepted")return;
   // Deliberately no persistence, fingerprint or automatic tracking.
   try{await fetch("https://www.vedoystudio.no/api/advertize/voluntary",{
      method:"POST",mode:"cors",headers:{"content-type":"application/json"},
      body:JSON.stringify({site,group,metric:"page_view",consent:true}),
      credentials:"omit",keepalive:false
   });}catch{setStatus("Vi kunne ikke lagre visningen. Ingen personlig informasjon ble lagret.");}
 }
 return <section aria-label="Frivillig besøksstatistikk" style={{margin:"18px auto",maxWidth:650,background:"#f4f8f5",border:"1px solid #dce8dd",borderRadius:16,padding:16}}>
  <strong style={{fontSize:13}}>Vil du bidra med anonym statistikk?</strong>
  <p style={{fontSize:12,color:"#5a7162",margin:"7px 0"}}>Kun en aggregert sidevisning, uten profil, melding, kontaktliste, cookie eller bruker-ID. Helt frivillig og avslått som standard.</p>
  {choice==="idle"?
   <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
    <button type="button" onClick={()=>void select("accepted")} style={{border:0,background:"#147c4b",color:"white",borderRadius:9,padding:"9px 12px",cursor:"pointer"}}>Ja, bidra</button>
    <button type="button" onClick={()=>void select("declined")} style={{border:"1px solid #cbdcd0",background:"white",borderRadius:9,padding:"9px 12px",cursor:"pointer"}}>Nei takk</button>
   </div>:
   <p role="status" style={{fontSize:12,margin:0}}>{status}</p>}
 </section>;
}

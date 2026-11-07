"use client";
import { useEffect, useRef, useState } from "react";
import { InsightsLevelSlider } from "./insights-level-slider";
import { InsightsStorageChoice, readLocalPreference, saveLocalPreference, clearLocalPreference, type StorageChoice } from "./insights-storage-choice";
import { INSIGHT_LEVEL_CONTENT, type ReaderLevel } from "@/lib/insights-levels";
import styles from "@/app/insights/insights.module.css";
type Section = { heading: string; paragraphs: readonly string[] };
const choices: {level:ReaderLevel;label:string;detail:string}[]=[
 {level:"standard",label:"Kjapp oversikt",detail:"Få med deg det viktigste."},
 {level:"beginner",label:"Lære fra bunnen",detail:"Forklar fagord og vis enkle eksempler."},
 {level:"intermediate",label:"Lære mer",detail:"Praktiske forklaringer og eksempler."},
 {level:"advanced",label:"Fordype meg",detail:"Teknisk innhold og detaljer."}
];
export function InsightsArticleReader({slug,sections}:{slug:string;sections:readonly Section[]}){
 const [level,setLevel]=useState<ReaderLevel>("standard");
 const [storage,setStorage]=useState<StorageChoice>("none");
 const [open,setOpen]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  const remembered=readLocalPreference();
  if(remembered){setLevel(remembered as ReaderLevel);setStorage("local");}
  else setOpen(true);
 },[]);
 useEffect(()=>{
  const el=dialog.current;if(!el)return;
  if(open&&!el.open)el.showModal();
  if(!open&&el.open)el.close();
 },[open]);
 const changeLevel=(next:ReaderLevel)=>{setLevel(next);if(storage==="local")saveLocalPreference(next);};
 const changeStorage=(next:StorageChoice)=>{
  if(next==="cloud")return;
  setStorage(next);
  if(next==="local")saveLocalPreference(level);else clearLocalPreference();
 };
 const variants=INSIGHT_LEVEL_CONTENT[slug];
 const selected=level==="standard"?sections:variants?.[level] ?? sections;
 return <>
  <button type="button" onClick={()=>setOpen(true)} style={{padding:"8px 0",textDecoration:"underline",background:"none",border:0,color:"inherit",cursor:"pointer"}}>Hva ønsker du å få ut av artikkelen?</button>
  <dialog ref={dialog} aria-labelledby="insights-goal-heading" onClose={()=>setOpen(false)} onClick={e=>{if(e.target===dialog.current)setOpen(false)}} style={{width:"min(92vw,540px)",maxHeight:"85dvh",overflowY:"auto",padding:24,borderRadius:18,background:"#161a18",color:"#fff",border:"1px solid #777"}}>
   <button type="button" aria-label="Lukk" onClick={()=>setOpen(false)} style={{float:"right",fontSize:26,background:"none",border:0,color:"inherit",cursor:"pointer"}}>×</button>
   <p style={{fontSize:12,letterSpacing:2}}>VEDOY INSIGHTS</p>
   <h2 id="insights-goal-heading">Hva ønsker du å oppnå med lesingen?</h2>
   <p>Velg et nivå, eller lukk for å lese som vanlig. Du kan endre valget når som helst.</p>
   <div style={{display:"grid",gap:9}}>
    {choices.map(c=><button key={c.level} type="button" onClick={()=>{changeLevel(c.level);setOpen(false)}} style={{textAlign:"left",padding:14,borderRadius:10,border:"1px solid #777",background:"transparent",color:"inherit",cursor:"pointer"}}><strong>{c.label}</strong><br/><small>{c.detail}</small></button>)}
   </div>
   <button type="button" onClick={()=>setOpen(false)} style={{marginTop:16,padding:8,background:"transparent",color:"inherit",border:0,textDecoration:"underline",cursor:"pointer"}}>Bare vis artikkelen</button>
  </dialog>
  <InsightsLevelSlider level={level} onChange={changeLevel}/>
  <InsightsStorageChoice choice={storage} onChange={changeStorage}/>
  <div className={styles.articleBody}>
   {selected.map((section,index)=><section key={section.heading}>
    <div className={styles.chapterNumber}>{String(index+1).padStart(2,"0")}</div>
    <h2>{section.heading}</h2>
    {section.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>}
   </section>)}
  </div>
 </>;
}

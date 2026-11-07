"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
type Article={slug:string;title:string;excerpt:string;category:string;publishedAt:string;readingMinutes:number};
const KEY="vedoy-insights-interests-v1";
const TOPICS=[["web","Nettsider og utvikling"],["business","Bedrift og økonomi"],["art","Kunst og design"],["security","Sikkerhet og KI"]] as const;
type Topic=typeof TOPICS[number][0];
const matches:Record<Topic,RegExp>={
 web:/nettsid|utvikl|kode|script|web|developer|sky|cloud/i,
 business:/handel|nettbutikk|black friday|pris|økonomi|markedsfør|bedrift|rabatt/i,
 art:/kunst|klær|collective|design|kreativ|artist/i,
 security:/sikker|krypter|ki|ai|personvern|shield/i
};
export function InsightsPersonalizedFeed({articles,limit}:{articles:Article[];limit?:number}){
 const [topic,setTopic]=useState<Topic|null>(null);
 const [save,setSave]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const v=JSON.parse(raw);if(v.save===true&&TOPICS.some(t=>t[0]===v.topic)){setTopic(v.topic);setSave(true);}}}catch{}},[]);
 const update=(next:Topic|null,persist:boolean)=>{
  setTopic(next);setSave(persist);
  try{if(persist&&next)localStorage.setItem(KEY,JSON.stringify({topic:next,save:true}));else localStorage.removeItem(KEY);}catch{}
 };
 const ordered=[...articles].sort((a,b)=>{
  if(topic){const score=(x:Article)=>Number(matches[topic].test(x.title+" "+x.category+" "+x.excerpt));const diff=score(b)-score(a);if(diff)return diff;}
  return b.publishedAt.localeCompare(a.publishedAt);
 });
 return <section aria-label="Artikler tilpasset dine interesser">
  <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",marginBottom:16}}>
   <label htmlFor="insights-interest">Hva vil du lese om? </label>
   <select id="insights-interest" value={topic??""} onChange={e=>update(e.target.value as Topic||null,save)} style={{padding:9,borderRadius:9}}>
    <option value="">Alle temaer</option>
    {TOPICS.map(([key,label])=><option key={key} value={key}>{label}</option>)}
   </select>
   <label><input type="checkbox" checked={save} disabled={!topic} onChange={e=>update(topic,e.target.checked)}/> Husk på denne enheten</label>
   {topic?<button type="button" onClick={()=>update(null,false)}>Nullstill</button>:null}
  </div>
  <p style={{fontSize:13,opacity:.8}}>Frivillig tilpasning. Uten avkrysning lagres ingen interesser. Sorteringen skjer bare i nettleseren og sender ikke interesser til Vedøy.</p>
  <div style={{display:"grid",gap:18,marginTop:16}}>
   {ordered.slice(0,limit??articles.length).map(a=><article key={a.slug} style={{padding:"18px 0",borderTop:"1px solid #8885"}}>
    <small>{a.category} · {a.readingMinutes} min lesing</small>
    <h3 style={{margin:"8px 0"}}><Link href={"/insights/"+a.slug}>{a.title}</Link></h3>
    <p>{a.excerpt}</p>
    <Link href={"/insights/"+a.slug}>Les artikkelen →</Link>
   </article>)}
  </div>
 </section>;
}

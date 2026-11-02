"use client";
import { useState } from "react";
import Link from "next/link";

const options = [
  ["🛍️","Nettbutikk","commerce","Produktkatalog, SEO, betaling og drift"],
  ["🎵","Musikk","music","Artistnettside, utgivelser og merch"],
  ["🎨","Kunst","art","Galleri, originalverk og kunsttrykk"],
  ["👕","Klær","collective","Kolleksjoner, drops og nettbutikk"],
  ["📷","Fotograf","photo","Portefølje, booking og bildegalleri"],
  ["🔧","Håndverker","services","Tjenester, referanser og befaring"],
  ["🎮","Spill","games","Spillpresentasjon, trailer og presskit"],
  ["🎭","Skuespiller","actor","Showreel, CV og castingkontakt"],
  ["⚽","Fotballag","football","Kamper, lag, sponsorer og dugnad"],
  ["🧵","Syklubb","sewing","Aktiviteter, kurs og påmelding"],
  ["✨","Frilanser","studio","Portefølje og tjenestepakker"],
  ["🤝","Forening","association","Medlemmer, arrangementer og nyheter"],
] as const;
export function IndustryDemoSection() {
  const [active,setActive] = useState(0);
  const [expanded,setExpanded] = useState(false);
  const choice = options[active];
  return <section id="yrkesdemo" aria-labelledby="yrkesdemo-heading" style={{background:"#e8f2ea",color:"#173b2b",padding:"clamp(48px,7vw,100px) 20px"}}>
    <div style={{maxWidth:1190,margin:"auto"}}>
      <p style={{fontSize:12,fontWeight:850,letterSpacing:".12em",color:"#347b56",marginBottom:12}}>SE NETTSIDEN FOR DITT YRKE</p>
      <h2 id="yrkesdemo-heading" style={{fontSize:"clamp(36px,5vw,68px)",lineHeight:1.06,letterSpacing:"-.06em",margin:"0 0 16px"}}>Du får det du trenger.<br/><em style={{fontWeight:500}}>Ikke noe mer.</em></h2>
      <p style={{maxWidth:720,fontSize:18,lineHeight:1.6,margin:"0 0 26px",color:"#506c5a"}}>Velg yrke eller interesse og se hva Vedøy Studio kan bygge for akkurat deg. Samme kvalitet, forskjellige behov – uten unødvendige funksjoner.</p>
      <div role="tablist" aria-label="Velg yrke" style={{display:"flex",gap:9,overflowX:"auto",padding:"6px 0 18px",scrollSnapType:"x proximity"}}>
        {options.map((opt,i)=><button key={opt[2]} role="tab" aria-selected={active===i} onClick={()=>setActive(i)} style={{scrollSnapAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,minWidth:92,padding:"13px 12px",borderRadius:17,border:active===i?"1px solid #206744":"1px solid #cadccc",background:active===i?"#206744":"#fff",color:active===i?"white":"#21452e",fontWeight:750,cursor:"pointer"}}><span style={{fontSize:26}} aria-hidden>{opt[0]}</span><span style={{fontSize:12}}>{opt[1]}</span></button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,310px),1fr))",gap:24,alignItems:"center",padding:"clamp(22px,4vw,38px)",background:"#fff",borderRadius:28,boxShadow:"0 18px 45px #17412815"}}>
        <div aria-live="polite">
          <p style={{fontSize:13,fontWeight:850,color:"#407754"}}>{choice[0]} SKREDDERSYDD FOR {choice[1].toUpperCase()}</p>
          <h3 style={{fontSize:"clamp(28px,3.7vw,43px)",letterSpacing:"-.045em",margin:"8px 0"}}>{choice[3]}</h3>
          <p style={{fontSize:17,color:"#5d7063",lineHeight:1.55}}>Vedøy Studio hjelper med en nettside og de funksjonene som faktisk gir verdi for virksomheten din.</p>
          {expanded&&<div style={{padding:15,background:"#edf7ee",borderRadius:16,marginBottom:12,color:"#365e42"}}>Vi kan hjelpe med oppsett, design, mobiltilpasning, hosting, innhold og videreutvikling. Omfanget avklares før du bestiller.</div>}
          <button onClick={()=>setExpanded(!expanded)} aria-expanded={expanded} style={{display:"block",background:"transparent",border:0,color:"#206744",padding:"8px 0",fontWeight:750,cursor:"pointer"}}>{expanded?"Vis mindre −":"Hva kan Vedøy gjøre? +"}</button>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:15}}>
            <Link href="/yrker" style={{display:"inline-flex",padding:"13px 19px",background:"#206744",color:"#fff",borderRadius:14,fontWeight:800}}>Se eksempler →</Link>
            <Link href="/#kontakt" style={{display:"inline-flex",padding:"13px 19px",border:"1px solid #b8d1bf",borderRadius:14,fontWeight:800}}>Be om tilbud ↗</Link>
          </div>
        </div>
        <div style={{background:"linear-gradient(140deg,#d8ecdc,#f3f6ec)",borderRadius:24,padding:24}}>
          <div style={{borderRadius:20,background:"#fff",padding:24,boxShadow:"0 15px 32px #153c271c"}}>
            <span style={{fontSize:12,color:"#627a67",fontWeight:800}}>NETTSIDEEKSEMPEL · DEMO</span>
            <div style={{fontSize:53,margin:"22px 0 10px"}}>{choice[0]}</div>
            <strong style={{fontSize:28,display:"block",lineHeight:1.2}}>{choice[1]}</strong>
            <p style={{color:"#66806d"}}>{choice[3]}</p>
            <div style={{background:"#e9f3ea",borderRadius:12,padding:"12px 15px",fontWeight:750,color:"#206744"}}>Din idé. Vår teknologi. ↗</div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

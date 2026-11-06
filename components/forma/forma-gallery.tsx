"use client";

import Link from "next/link";
import {useEffect,useMemo,useRef,useState} from "react";
import {formaCategories,formaComponentCount,formaExamples} from "@/lib/forma-components";
import {initForma} from "@/packages/forma/index.js";
import {FormaMenuBuilder} from "./forma-menu-builder";

type Category=(typeof formaCategories)[number];
type Device="desktop"|"tablet"|"mobile";
const deviceWidths:Record<Device,string>={desktop:"100%",tablet:"768px",mobile:"360px"};

export function FormaGallery(){
 const [filter,setFilter]=useState<Category>("Alle");
 const [query,setQuery]=useState("");
 const [selectedId,setSelectedId]=useState("menu");
 const [device,setDevice]=useState<Device>("desktop");
 const [codeTab,setCodeTab]=useState<"html"|"usage">("html");
 const [notification,setNotification]=useState("");
 const preview=useRef<HTMLDivElement>(null);
 useEffect(()=>preview.current?initForma(preview.current):undefined,[]);
 const filtered=useMemo(()=>formaExamples.filter(item=>
  (filter==="Alle"||item.category===filter)&&
  [item.title,item.description,item.id].join(" ").toLocaleLowerCase("nb").includes(query.trim().toLocaleLowerCase("nb"))
 ),[filter,query]);
 const selected=formaExamples.find(x=>x.id===selectedId)??formaExamples[0];
 async function copy(content:string){
  try{await navigator.clipboard.writeText(content);setNotification("Kopiert til utklippstavlen")}
  catch{setNotification("Kopiering ikke tilgjengelig. Marker koden og kopier manuelt.")}
 }
 const usage=`// Kun lokal beta – npm-pakken er ikke publisert.
import "@/packages/forma/styles.css";
import { initForma } from "@/packages/forma/index.js";

// Kjør i nettleseren når DOM-en er klar.
const cleanup = initForma(document);
// Kall cleanup() ved avmontering.`;
 return <main className="vf-docs vf-ui">
  <header className="vf-doc-hero">
   <nav className="vf-crumb" aria-label="Brødsmulesti"><Link href="/developers">Developers</Link><span>/</span><Link href="/developers/forma">Forma</Link><span>/</span><strong>Komponenter</strong></nav>
   <div className="vf-kicker">VEDOY FORMA · KOMPONENTBIBLIOTEK · BETA</div>
   <h1>50 byggeklosser.<br/><span>Én konsistent stil.</span></h1>
   <p>Utforsk responsive UI-mønstre for nettsider og webapper. Se levende eksempler, kopier kildekode og bygg din egen navigasjonsmeny. Skjemakomponenter er UI-demoer – ingen autentisering eller meldingssending er aktivert.</p>
   <div className="vf-doc-metrics"><span><strong>{formaComponentCount}</strong> eksempler</span><span><strong>5</strong> kategorier</span><span><strong>0</strong> obligatoriske UI-avhengigheter</span></div>
  </header>
  <section className="vf-catalog" aria-label="Komponentkatalog">
   <div className="vf-section-heading"><p className="vf-kicker">BIBLIOTEK</p><h2>Finn komponenten du trenger.</h2><p>Velg en komponent for å vise hvordan den ser ut og hvilken HTML-struktur den trenger.</p></div>
   <div className="vf-catalog-shell">
    <aside className="vf-catalog-aside">
     <label htmlFor="vf-search">Søk i komponenter</label>
     <input id="vf-search" className="vf-input" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Søk: skjema, meny, galleri…" />
     <fieldset className="vf-category-list"><legend>Kategorier</legend>
      {formaCategories.map(cat=><button type="button" key={cat} onClick={()=>setFilter(cat)} aria-pressed={filter===cat} className={filter===cat?"is-active":""}>{cat}<span>{cat==="Alle"?formaComponentCount:formaExamples.filter(e=>e.category===cat).length}</span></button>)}
     </fieldset>
     <p className="vf-muted">HTML-strukturen er åpen og kan brukes med vanlig CSS eller tilpasses videre. Noen interaksjoner bruker et lite valgfritt JavaScript-lag.</p>
    </aside>
    <div className="vf-catalog-main">
     <div className="vf-row vf-between vf-catalog-top"><strong>{filtered.length} komponenter</strong><span>Velg et kort for forhåndsvisning</span></div>
     <div className="vf-component-grid" role="list">
      {filtered.map(item=><div role="listitem" key={item.id}>
       <button type="button" className={"vf-component-card"+(item.id===selected.id?" is-selected":"")} aria-pressed={item.id===selected.id} onClick={()=>{setSelectedId(item.id);setNotification("");setCodeTab("html")}}>
        <span className="vf-component-card-category">{item.category}</span>
        <strong>{item.title}</strong>
        <span>{item.description}</span>
        <small>{item.id===selected.id?"Vises nå":"Se eksempel ↗"}</small>
       </button>
      </div>)}
     </div>
     {filtered.length===0?<div className="vf-empty-results"><h3>Ingen treff</h3><p>Prøv et annet søkeord eller velg «Alle».</p><button className="vf-button vf-button-outline" onClick={()=>{setQuery("");setFilter("Alle")}}>Nullstill filtre</button></div>:null}
    </div>
   </div>
  </section>
  <section className="vf-component-view" aria-labelledby="vf-preview-title">
   <div className="vf-section-heading"><p className="vf-kicker">LIVE EKSEMPEL</p><h2 id="vf-preview-title">{selected.title}</h2><p>{selected.description}</p></div>
   <div className="vf-example-frame">
    <div className="vf-example-toolbar">
     <strong>Forhåndsvisning</strong>
     <fieldset className="vf-device-picker"><legend className="vf-visually-hidden">Forhåndsvisningsbredde</legend>
      {(["desktop","tablet","mobile"] as const).map(d=><button key={d} type="button" aria-pressed={device===d} onClick={()=>setDevice(d)}>{d==="desktop"?"Desktop":d==="tablet"?"Nettbrett":"Mobil"}</button>)}
     </fieldset>
    </div>
    <div className="vf-example-viewport">
     <div className="vf-live-preview" ref={preview} style={{width:deviceWidths[device]}}>
      <div className="vf-component-demo" dangerouslySetInnerHTML={{__html:selected.html}} />
     </div>
    </div>
    <div className="vf-example-toolbar">
     <div className="vf-tabs-lite" role="tablist" aria-label="Eksempelkode">
      <button type="button" role="tab" aria-selected={codeTab==="html"} onClick={()=>setCodeTab("html")}>HTML</button>
      <button type="button" role="tab" aria-selected={codeTab==="usage"} onClick={()=>setCodeTab("usage")}>Slik brukes pakken</button>
     </div>
     <button type="button" className="vf-small-action" onClick={()=>copy(codeTab==="html"?selected.html:usage)}>Kopier kode</button>
    </div>
    <pre className="vf-code vf-example-code"><code>{codeTab==="html"?selected.html:usage}</code></pre>
   </div>
   <p className="vf-muted" role="status" aria-live="polite">{notification||"Eksemplene er statiske maler med valgfri interaktiv oppførsel. Bytt ut demonstrasjonsinnhold og koble skjemaer til din egen backend."}</p>
  </section>
  <FormaMenuBuilder/>
  <section className="vf-usage" id="install">
   <div className="vf-section-heading"><p className="vf-kicker">KOM I GANG</p><h2>CSS først. JavaScript når du trenger det.</h2><p>Forma holdes atskilt fra Forge, slik at det også kan brukes i eksisterende HTML-, React-, Vue- og Next.js-prosjekter.</p></div>
   <div className="vf-usage-grid">
    <article><h3>1. Importer CSS</h3><pre className="vf-code"><code>{'import "@vedoy/forma/styles.css";'}</code></pre><p>Dette er målsyntaksen for en fremtidig publisert pakke. Inntil videre ligger kildekoden i Vedoy Studio-repositoriet.</p></article>
    <article><h3>2. Aktiver interaktive kontroller</h3><pre className="vf-code"><code>{'import { initForma } from "@vedoy/forma";\nconst cleanup = initForma(document);'}</code></pre><p>Valgfritt for faner, dialoger, skuffer, nedtrekksmenyer og karusell.</p></article>
   </div>
   <p className="vf-notice"><strong>Betastatus:</strong> 50 dokumenterte, stylede UI-mønstre. Dette er ikke en offentlig publisert npm-pakke eller 50 selvstendige React-komponenter ennå. Integrasjoner som faktisk logger inn brukere eller sender kontaktmeldinger må utvikles separat.</p>
  </section>
 </main>;
}

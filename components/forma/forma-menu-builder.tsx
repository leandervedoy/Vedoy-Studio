"use client";
import {useMemo,useState} from "react";
import type {CSSProperties} from "react";
type Place="top"|"bottom"|"left"|"right";
type Mode="static"|"sticky"|"fixed";
const fonts={sans:"Inter, system-ui, sans-serif",serif:"Georgia, serif",mono:"Consolas, monospace"} as const;
const shadows={none:"none",soft:"0 8px 26px #0004",strong:"0 20px 55px #0009"} as const;
const escape=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
export function FormaMenuBuilder(){
 const [place,setPlace]=useState<Place>("top");
 const [mode,setMode]=useState<Mode>("static");
 const [font,setFont]=useState<keyof typeof fonts>("sans");
 const [shadow,setShadow]=useState<keyof typeof shadows>("soft");
 const [size,setSize]=useState(14);
 const [gap,setGap]=useState(16);
 const [round,setRound]=useState(12);
 const [brand,setBrand]=useState("VEDOY");
 const [links,setLinks]=useState(["Forside","Produkter","Kontakt"]);
 const [bg,setBg]=useState("#142033");
 const [fg,setFg]=useState("#f6f8fb");
 const [accent,setAccent]=useState("#6dff9c");
 const [copyState,setCopyState]=useState("");
 const vertical=place==="left"||place==="right";
 const style={
  "--vf-menu-font":fonts[font],"--vf-menu-size":size+"px","--vf-menu-fg":fg,"--vf-menu-bg":bg,
  "--vf-menu-shadow":shadows[shadow],"--vf-menu-radius":round+"px",
  "--vf-menu-gap":gap+"px","--vf-menu-padding":Math.round(size*.92)+"px"
 } as CSSProperties;
 const html=useMemo(()=>['<nav class="my-menu" aria-label="Hovedmeny">','  <strong class="logo">'+escape(brand)+'</strong>',...links.map(label=>'  <a href="#">'+escape(label)+'</a>'),'</nav>'].join("\n"),[brand,links]);
 const css=useMemo(()=>[
  ".my-menu {","  display: flex;","  flex-wrap: wrap;",
  "  flex-direction: "+(vertical?"column;":"row;"),
  "  align-items: "+(vertical?"stretch;":"center;"),
  "  gap: "+gap+"px;","  padding: "+Math.round(size*.92)+"px;",
  "  font: "+size+"px "+fonts[font]+";","  color: "+fg+";","  background: "+bg+";",
  "  border-radius: "+round+"px;","  box-shadow: "+shadows[shadow]+";",
  "  position: "+mode+";",...(mode==="static"?[]:place==="top"?["  top: 0;"]:place==="bottom"?["  bottom: 0;"]:place==="left"?["  left: 0;","  top: 0;"]:["  right: 0;","  top: 0;"]),
  "}"," .my-menu a { color: inherit; text-decoration: none; }",
  " .my-menu a:hover { color: "+accent+"; }",
  " .my-menu .logo { font-weight: 800; margin-right: auto; }",
  " @media (max-width: 600px) { .my-menu { gap: 9px; } }"
 ].join("\n"),[place,vertical,mode,size,gap,font,bg,fg,round,accent,shadow]);
 async function copy(text:string,key:string){try{await navigator.clipboard.writeText(text);setCopyState(key)}catch{setCopyState("")}}
 return <section className="vf-builder-section" id="menu-builder">
  <div className="vf-section-heading"><p className="vf-kicker">LIVE · MENYBYGGER</p><h2>En meny. Uendelige muligheter.</h2><p>Tilpass plassering, skriftstil, størrelse, farger, skygger og innhold. Kopier HTML og CSS når du er fornøyd.</p></div>
  <div className="vf-menu-builder">
   <div className="vf-menu-controls">
    <label>Plassering<select value={place} onChange={e=>setPlace(e.target.value as Place)}><option value="top">Topp</option><option value="bottom">Bunn</option><option value="left">Venstre</option><option value="right">Høyre</option></select></label>
    <label>Posisjon<select value={mode} onChange={e=>setMode(e.target.value as Mode)}><option value="static">Static</option><option value="sticky">Sticky</option><option value="fixed">Fixed</option></select></label>
    <label>Fontstil<select value={font} onChange={e=>setFont(e.target.value as keyof typeof fonts)}><option value="sans">Sans serif</option><option value="serif">Serif</option><option value="mono">Monospace</option></select></label>
    <label>Fontstørrelse ({size}px)<input type="range" min={11} max={22} value={size} onChange={e=>setSize(Number(e.target.value))}/></label>
    <label>Avstand ({gap}px)<input type="range" min={4} max={32} value={gap} onChange={e=>setGap(Number(e.target.value))}/></label>
    <label>Hjørner ({round}px)<input type="range" min={0} max={28} value={round} onChange={e=>setRound(Number(e.target.value))}/></label>
    <label>Skygge<select value={shadow} onChange={e=>setShadow(e.target.value as keyof typeof shadows)}><option value="none">Ingen</option><option value="soft">Myk</option><option value="strong">Sterk</option></select></label>
    <div className="vf-color-row"><label>Bakgrunn<input type="color" value={bg} onChange={e=>setBg(e.target.value)}/></label><label>Tekst<input type="color" value={fg} onChange={e=>setFg(e.target.value)}/></label></div>
    <label>Aksentfarge<input type="color" value={accent} onChange={e=>setAccent(e.target.value)}/></label>
    <label>Logo / navn<input value={brand} maxLength={65} onChange={e=>setBrand(e.target.value)}/></label>
    <fieldset className="vf-menu-links-editor"><legend>Menyvalg</legend>{links.map((name,i)=>
     <div className="vf-menu-link-edit" key={i}><label className="vf-visually-hidden" htmlFor={"vf-menu-"+i}>Menyvalg {i+1}</label><input id={"vf-menu-"+i} maxLength={65} value={name} onChange={e=>setLinks(xs=>xs.map((x,j)=>j===i?e.target.value:x))}/><button type="button" aria-label={"Fjern lenke "+(i+1)} disabled={links.length===1} onClick={()=>setLinks(xs=>xs.filter((_,j)=>j!==i))}>×</button></div>
    )}<button className="vf-button vf-button-outline" type="button" disabled={links.length>=8} onClick={()=>setLinks(xs=>[...xs,"Ny lenke"])}>+ Legg til lenke</button></fieldset>
   </div>
   <div className="vf-menu-workspace">
    <div className="vf-row vf-between vf-preview-head"><strong>Forhåndsvisning</strong><span>Test de fire plasseringene</span></div>
    <div className="vf-menu-stage">
     <nav className="vf-custom-menu" aria-label="Forhåndsvisning av meny" data-placement={place} data-position={mode} style={style}>
      <strong>{brand||"Logo"}</strong>{links.map((name,i)=><a key={i} href="#menu-builder" style={{color:i===0?accent:undefined}}>{name||"Lenke"}</a>)}
     </nav>
     <p>Eksempelinnhold under menyen. Prøv static, sticky og fixed.</p>
    </div>
    <div className="vf-row vf-between vf-preview-head"><strong>HTML</strong><button type="button" className="vf-small-action" onClick={()=>copy(html,"html")}>{copyState==="html"?"✓ Kopiert":"Kopier HTML"}</button></div>
    <pre className="vf-code"><code>{html}</code></pre>
    <div className="vf-row vf-between vf-preview-head"><strong>CSS</strong><button type="button" className="vf-small-action" onClick={()=>copy(css,"css")}>{copyState==="css"?"✓ Kopiert":"Kopier CSS"}</button></div>
    <pre className="vf-code"><code>{css}</code></pre>
    <p className="vf-muted">Ingenting sendes til en server. Bytt ut eksempellenkene med ekte adresser før publisering.</p>
   </div>
  </div>
 </section>;
}

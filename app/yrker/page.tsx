"use client";
import { useState } from "react";

const sectors = [
  {id:"commerce",emoji:"🛍️",name:"Nettbutikk",pitch:"Selg produkter uten unødvendig administrasjon.",features:["Nettbutikk og betaling","Produktkatalog og SEO","Drift og forbedringer"],color:"#247856"},
  {id:"music",emoji:"🎵",name:"Musikkartist",pitch:"Egen scene for musikken, fans og merch.",features:["Artistprofil og utgivelser","Merch og drops","Konsert- og kontaktinformasjon"],color:"#8241a7"},
  {id:"art",emoji:"🎨",name:"Kunstner",pitch:"Vis frem og selg kunsten din.",features:["Digitalt galleri","Kunsttrykk og originalverk","Kunstnerhistorie"],color:"#c46a45"},
  {id:"collective",emoji:"👕",name:"Klesmerke",pitch:"Fra første idé til kolleksjon.",features:["Shopify og kolleksjoner","Print-on-demand","Kampanjer og lookbook"],color:"#c63572"},
  {id:"services",emoji:"🔧",name:"Håndverker",pitch:"Få flere relevante forespørsler.",features:["Tjenester og referanser","Booking og befaring","Lokal synlighet"],color:"#c96a16"},
  {id:"studio",emoji:"✨",name:"Frilanser",pitch:"Presenter kompetansen din profesjonelt.",features:["Portefølje","Tjenestepakker","Kontakt og booking"],color:"#947113"},
  {id:"photo",emoji:"📷",name:"Fotograf",pitch:"Portefølje som får bildene frem.",features:["Bildegalleri","Booking og pakker","Salg av print"],color:"#367b82"},
  {id:"games",emoji:"🎮",name:"Spillutvikler",pitch:"Vis frem spillet ditt.",features:["Spillpresentasjon og trailer","Nyheter og presskit","Butikklenker"],color:"#555cc3"},
  {id:"actor",emoji:"🎭",name:"Skuespiller",pitch:"En profesjonell profil for roller og oppdrag.",features:["Showreel og portretter","CV og erfaring","Castingkontakt"],color:"#ad547f"},
  {id:"football",emoji:"⚽",name:"Fotballag",pitch:"Samle laget, supportere og sponsorer.",features:["Terminliste og nyheter","Lag og trenere","Sponsorer og dugnad"],color:"#2d8066"},
  {id:"sewing",emoji:"🧵",name:"Syklubb",pitch:"Et digitalt møtested for skaperglede.",features:["Aktiviteter og kurs","Påmelding","Galleri og nyheter"],color:"#bf698f"},
  {id:"association",emoji:"🤝",name:"Organisasjon",pitch:"Gjør det enklere å nå medlemmer.",features:["Informasjon og kalender","Påmelding og frivillighet","Nyheter og kontakt"],color:"#537790"},
];
export default function IndustryPage() {
  const [selected,setSelected] = useState(0);
  const s = sectors[selected];
  const demo = "https://vedoy-multisite-experience-vedoy.vercel.app/?tema="+encodeURIComponent(s.id);
  return <main className="by">
    <header className="top"><a href="/" aria-label="Vedøy Studio forside" className="logo">V<span>Vedøy Studio</span></a><a href="/#kontakt" className="subtle">Kontakt oss ↗</a></header>
    <section className="hero">
      <div className="tag">ÉN PARTNER · MANGE MULIGHETER</div>
      <h1>Se nettsiden for <em>ditt yrke.</em></h1>
      <p>Du får det du trenger – ikke noe mer. Velg yrket ditt og se hvordan Vedøy Studio kan hjelpe deg med en nettside som passer akkurat din virksomhet.</p>
      <a href="#velg" className="action">Utforsk eksempler ↓</a>
    </section>
    <section id="velg" className="browser" style={{["--accent" as string]:s.color}}>
      <nav className="choices" aria-label="Velg yrke">{sectors.map((item,i)=><button key={item.id} onClick={()=>setSelected(i)} aria-pressed={i===selected} className={i===selected?"active":""}><span>{item.emoji}</span><small>{item.name}</small></button>)}</nav>
      <div className="content" key={s.id}>
        <div><span className="label">{s.emoji} FOR {s.name.toUpperCase()}</span><h2>{s.pitch}</h2><p>Vi finner en løsning som passer behovet ditt, enten du trenger en enkel presentasjon eller en mer komplett digital løsning.</p><ul>{s.features.map(f=><li key={f}>✓ {f}</li>)}</ul><div className="buttons"><a className="action" href={demo} target="_blank" rel="noopener noreferrer">Se eksempel ↗</a><a className="ghost" href="/#kontakt">Be om tilbud →</a></div><small>Eksemplene er demonstrasjoner. Ingen bestilling eller betaling gjennomføres her.</small></div>
        <div className="preview"><div className="browserbar"><b>● ● ●</b><span>Nettsideeksempel</span></div><div className="mock"><div className="em">{s.emoji}</div><h3>{s.name}</h3><p>{s.pitch}</p><span>Din idé. Vår teknologi.</span></div></div>
      </div>
    </section>
    <section className="ending"><h2>Du trenger ikke betale for funksjoner du ikke bruker.</h2><p>Vedøy Studio kan hjelpe med design, nettsider, nettbutikker, booking, hosting, integrasjoner og videre utvikling. Vi kartlegger behovet før vi foreslår en løsning.</p><a className="action" href="/#kontakt">Kontakt Vedøy Studio ↗</a></section>
    <footer>Utviklet av <a href="https://vedoystudio.no">Vedøy Studio</a> · Eksempler for ulike bransjer</footer>
    <style>{`
      .by{--accent:#247856;color:#172e24;background:#f6f7f3;min-height:100vh;font-family:system-ui,-apple-system,sans-serif;padding-bottom:50px}.by *{box-sizing:border-box}.by a{text-decoration:none;color:inherit}.by button{font:inherit;cursor:pointer}.by .top{max-width:1160px;margin:auto;display:flex;justify-content:space-between;align-items:center;padding:24px}.by .logo{font-weight:850;display:flex;align-items:center;gap:10px}.by .logo:first-letter{font-weight:900}.by .logo span{font-size:20px}.by .subtle{color:#25664c;font-weight:700}.by .hero{max-width:1160px;margin:auto;padding:68px 24px 60px}.by .tag,.by .label{font-size:13px;color:#277953;font-weight:850;letter-spacing:.08em}.by h1{font-size:clamp(42px,7vw,88px);letter-spacing:-.07em;line-height:1.05;max-width:900px;margin:14px 0}.by h1 em{color:#237756;font-style:normal}.by .hero p{font-size:clamp(18px,2vw,23px);line-height:1.55;color:#607368;max-width:730px}.by .action{background:#237756;color:white;display:inline-block;padding:14px 20px;border-radius:16px;font-weight:800;margin-top:15px}.by .browser{max-width:1160px;margin:auto;padding:18px 20px 24px;background:white;border:1px solid #dfebe0;border-radius:32px;box-shadow:0 20px 55px #1539270c}.by .choices{display:flex;overflow-x:auto;gap:7px;padding:4px 2px 20px;scrollbar-width:thin;scroll-snap-type:x proximity}.by .choices button{flex:0 0 85px;border:0;background:#f1f5f0;color:#58685e;border-radius:17px;padding:11px 6px;display:flex;flex-direction:column;align-items:center;gap:5px;scroll-snap-align:center}.by .choices button span{font-size:27px}.by .choices button small{font-size:11px;font-weight:750}.by .choices button.active{background:color-mix(in srgb,var(--accent) 17%,white);color:var(--accent)}.by .content{display:grid;grid-template-columns:1fr .9fr;gap:35px;padding:30px 12px;animation:enter .35s ease}.by .content h2{font-size:clamp(33px,4.7vw,55px);letter-spacing:-.06em;line-height:1.07;margin:16px 0}.by .content p{color:#63756a;font-size:18px;line-height:1.6}.by .content ul{list-style:none;padding:0;font-weight:720;line-height:2.1}.by .buttons{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.by .buttons .action{background:var(--accent)}.by .ghost{border:1px solid #d2dfd4;border-radius:15px;padding:13px 19px;font-weight:800}.by .content small{display:block;color:#728176;margin-top:20px}.by .preview{border-radius:26px;padding:18px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 18%,white),#f5f6ed);min-height:360px}.by .browserbar{display:flex;justify-content:space-between;color:#5e7463;font-size:12px}.by .mock{background:white;border-radius:20px;margin:40px 14px;padding:35px 24px;box-shadow:0 15px 45px #193b2a15}.by .mock .em{font-size:48px}.by .mock h3{font-size:30px;margin:8px 0}.by .mock span{color:var(--accent);font-weight:800}.by .ending{max-width:1160px;margin:60px auto;padding:45px 24px;background:#e6f1e7;border-radius:28px}.by .ending h2{font-size:clamp(30px,4vw,48px);line-height:1.08;letter-spacing:-.05em;max-width:780px}.by .ending p{max-width:760px;font-size:18px;color:#506f5d}.by footer{max-width:1160px;margin:auto;padding:15px 24px;color:#718177}.by footer a{text-decoration:underline}@keyframes enter{from{opacity:.3;transform:translateY(10px)}to{opacity:1;transform:none}}@media(max-width:800px){.by .content{grid-template-columns:1fr}.by .hero{padding:42px 20px}.by .browser{margin:0 12px}.by .content{padding:16px 6px}.by .ending{margin:35px 12px}.by .preview{min-height:280px}}@media(prefers-reduced-motion:reduce){.by *{animation:none!important;transition:none!important}}
    `}</style>
  </main>;
}
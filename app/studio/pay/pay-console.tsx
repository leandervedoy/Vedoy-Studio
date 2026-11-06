"use client";
import { useState } from "react";
import type { PayDesign,PayOverview } from "@/lib/vedoy-pay/server";

const COLORS:Record<string,[string,string]>={
  obsidian:["#151d24","#526b7e"],fjord:["#122e4f","#4c96b0"],
  pine:["#10372e","#479975"],sand:["#8e7957","#d6c39c"],
  plum:["#33213a","#90688f"],rose:["#743f49","#d1a2a8"]
};
const PATTERNS=["solid","waves","grid","diagonal","orbit"];
const names:Record<string,string>={solid:"Ensfarget",waves:"Bølger",grid:"Rutenett",diagonal:"Diagonalt",orbit:"Sirkler"};
const defaults:PayDesign={color:"fjord",pattern:"waves",label:"Vedoy Pay"};
const points=(n:number)=>new Intl.NumberFormat("nb-NO").format(n);

export function PayConsole({initial}:{initial:PayOverview}) {
  const [saved,setSaved]=useState<PayDesign|null>(initial.design);
  const [draft,setDraft]=useState<PayDesign>(initial.design??defaults);
  const [tab,setTab]=useState<"card"|"account"|"loyalty"|"partners">("card");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [failure,setFailure]=useState(false);
  const dirty=JSON.stringify(draft)!==JSON.stringify(saved);
  const shades=COLORS[draft.color]??COLORS.fjord;
  async function persist(method:"PUT"|"DELETE") {
    if(busy||!initial.configured)return;
    setBusy(true);setMessage("");setFailure(false);
    try {
      const res=await fetch("/api/vedoy-pay",method==="PUT"?
        {method,headers:{"Content-Type":"application/json"},body:JSON.stringify(draft)}:{method});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Kunne ikke behandle forespørselen.");
      if(method==="PUT"){
        setSaved(data.design);
        setDraft(data.design);
        setMessage("Kortutkastet er lagret på din Vedøy-konto.");
      }else{
        setSaved(null);setDraft(defaults);
        setMessage("Kortutkastet er slettet.");
      }
    }catch(e){setFailure(true);setMessage(e instanceof Error?e.message:"Ukjent feil.");}
    finally{setBusy(false);}
  }
  return <main className="pay">
    <header className="pay-heading">
      <p className="pay-eyebrow">VEDOY STUDIO / BETALING & LOJALITET</p>
      <h1>Vedoy <span>Pay.</span></h1>
      <div className="pay-intro">
        <p>Design kort, se tilkoblingsstatus og følg lojalitetspoengene dine i én oversikt.</p>
        <strong>FORHÅNDSVISNING · INGEN REELLE BETALINGER</strong>
      </div>
    </header>
    {!initial.configured&&<aside className="pay-notice" role="status">
      Databasen er ikke konfigurert. Kortdesign kan forhåndsvises, men ikke lagres. Ingen saldo er simulert.
    </aside>}
    <nav aria-label="Vedoy Pay-funksjoner" className="pay-tabs">
      {([{id:"card",label:"Kortdesigner"},{id:"account",label:"Konto og kort"},
        {id:"loyalty",label:"Lojalitet"},{id:"partners",label:"Wallester og Aera"}] as const).map(t=>
        <button type="button" key={t.id} className={tab===t.id?"active":""}
          aria-pressed={tab===t.id} onClick={()=>setTab(t.id)}>{t.label}</button>)}
    </nav>
    {tab==="card"&&<div className="pay-grid">
      <section className="pay-panel">
        <small>KORTDESIGN / FORHÅNDSVISNING</small>
        <h2>Et kort som er ditt.</h2>
        <p>Dette er et designutkast. Ingen betalingskort opprettes.</p>
        <div className={"pay-card pay-pattern-"+draft.pattern}
          style={{background:"linear-gradient(130deg,"+shades[0]+","+shades[1]+")"}}>
          <div className="pay-card-top"><strong>V / PAY</strong><span>KONSEPT</span></div>
          <div className="pay-chip" aria-hidden="true">◈</div>
          <div className="pay-card-bottom"><strong>{draft.label}</strong><span>VEDOY STUDIO</span></div>
        </div>
        <p className="pay-footnote">Illustrasjon uten kortnummer, chipfunksjon eller betalingsnettverkslogo.</p>
      </section>
      <section className="pay-panel">
        <small>TILPASS DITT DESIGN</small><h2>Velg uttrykk</h2>
        <label>Farge</label><div className="pay-swatches">
          {Object.entries(COLORS).map(([color,s])=><button type="button" key={color}
            aria-label={color} aria-pressed={draft.color===color}
            className={draft.color===color?"active":""}
            style={{background:s[0]}} onClick={()=>setDraft(d=>({...d,color}))}/>)}
        </div>
        <label htmlFor="pay-pattern">Mønster</label>
        <select id="pay-pattern" value={draft.pattern}
          onChange={e=>setDraft(d=>({...d,pattern:e.target.value}))}>
          {PATTERNS.map(pattern=><option value={pattern} key={pattern}>{names[pattern]}</option>)}
        </select>
        <label htmlFor="pay-label">Tekst på kortet</label>
        <input id="pay-label" value={draft.label} maxLength={24}
          onChange={e=>setDraft(d=>({...d,label:e.target.value}))}/>
        <p className="pay-footnote">Bruk et kort navn, ikke kortnummer eller personopplysninger.</p>
        <div className="pay-actions">
          <button type="button" className="pay-primary" disabled={!initial.configured||!dirty||busy}
            onClick={()=>void persist("PUT")}>{busy?"Lagrer …":"Lagre utkast"}</button>
          <button type="button" className="pay-secondary" disabled={!saved||busy}
            onClick={()=>void persist("DELETE")}>Slett utkast</button>
        </div>
        {message&&<p role="status" className={failure?"pay-error":"pay-success"}>{message}</p>}
        <p className="pay-footnote">Utstedelse krever separat avtale og godkjenning fra Wallester eller annen kortutsteder.</p>
      </section>
    </div>}
    {tab==="account"&&<div className="pay-grid">
      <section className="pay-panel"><small>BETALINGSKONTO</small><h2>Bankkonto og saldo</h2>
        <div className="pay-empty">—</div>
        <p>Ingen verifisert konto er tilkoblet. Vedoy Pay oppretter ikke bankkonto eller IBAN på egen hånd.</p>
        <p className="pay-note">Fremtidig kontotilknytning krever lisensiert partner, identitetskontroll og tillatt API-tilgang.</p>
      </section>
      <section className="pay-panel"><small>UTSTEDTE BETALINGSKORT</small><h2>Mine kort</h2>
        <div className="pay-empty">—</div>
        <p>Ingen utstedte kort er bekreftet. Kortdesignutkast regnes ikke som betalingskort.</p>
        <p className="pay-note">En verifisert kortutsteder må bekrefte kortstatus og eierskap før data vises.</p>
      </section>
    </div>}
    {tab==="loyalty"&&<div className="pay-grid">
      <section className="pay-panel"><small>LOJALITET</small><h2>Bekreftede poeng</h2>
        <div className="pay-empty">{initial.loyalty.confirmedPoints===null?"—":points(initial.loyalty.confirmedPoints)}</div>
        <p>{initial.loyalty.confirmedPoints===null?"Ingen verifiserte lojalitetsdata er tilgjengelige.":"Poeng fra Vedoy Pays separate, serverstyrte lojalitetslogg."}</p>
        <p className="pay-note">Dette er ikke penger eller en Vedoy Coins-saldo.</p>
      </section>
      <section className="pay-panel"><small>HISTORIKK</small><h2>Registrerte hendelser</h2>
        <div className="pay-empty">{initial.loyalty.events===null?"—":points(initial.loyalty.events)}</div>
        <p>Poeng kan bare registreres fra verifiserte hendelser. Refusjoner skal gi motpostering.</p>
        <p className="pay-note">Rewards, Sent og Collective beholder eksisterende saldoer inntil en kontrollert migrering.</p>
      </section>
    </div>}
    {tab==="partners"&&<div className="pay-grid">{initial.partners.map(p=>
      <section key={p.provider} className="pay-panel">
        <small>EKSTERN INTEGRASJON</small>
        <h2>{p.provider==="wallester"?"Wallester":"Aera"}</h2>
        <p>{p.provider==="wallester"?
          "Kortutstedelse, virtuelle/fysiske kort, kortadministrasjon.":
          "White-label lommebok, kort- og kontotilknytning og betalingsopplevelse."}</p>
        <div className="pay-status"><span>Brukertilknytning</span><strong>
          {p.status==="verified"?"Verifisert":p.status==="pending"?"Avventer":
            p.status==="suspended"?"Stanset":"Ikke tilkoblet"}</strong></div>
        <div className="pay-status"><span>Partneroppsett</span><strong>
          {p.available?"Konfigurert – krever endelig verifisering":"Ikke konfigurert/godkjent"}</strong></div>
        <p className="pay-note">Ingen konto, kort eller penger opprettes fra dette grensesnittet.</p>
      </section>)}</div>}
    <footer className="pay-footer">VEDOY PAY · Utviklet av Vedøy Studio · Beskyttelsesrammeverk: Vedoy Shield</footer>
  </main>;
}

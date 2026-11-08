"use client";
import Link from "next/link";
import { useState } from "react";
import { applySandboxAction,newSandbox } from "@/lib/vedoy-pay/sandbox.mjs";
import type { SandboxAction,SandboxState } from "@/lib/vedoy-pay/sandbox.mjs";
const money=(ore:number)=>new Intl.NumberFormat("nb-NO",{style:"currency",currency:"NOK"}).format(ore/100);
const fmt=(n:number)=>new Intl.NumberFormat("nb-NO").format(n);
const colors:Record<string,string>={fjord:"#144d70",pine:"#135443",obsidian:"#1b2733",sand:"#9e835f",plum:"#583d6b",rose:"#884d61"};
export function PaySandbox() {
  const [state,setState]=useState<SandboxState>(newSandbox);
  const [design,setDesign]=useState({color:"fjord",pattern:"waves",label:"Vedoy Pay"});
  const [amount,setAmount]=useState(199);
  const [coins,setCoins]=useState(150);
  const [scenario,setScenario]=useState<"approved"|"declined"|"3ds">("3ds");
  const [chosen,setChosen]=useState("");
  const [message,setMessage]=useState("");
  const [error,setError]=useState(false);
  const active=state.cards.filter(c=>c.status==="active");
  const selected=active.find(c=>c.id===chosen)?.id||active[0]?.id||"";
  function run(action:SandboxAction) {
    try {
      const next=applySandboxAction(state,action);
      setState(next);setError(false);setMessage("Simulert handling gjennomført.");
      if(action.type==="ISSUE_CARD")setChosen(next.cards.at(-1)?.id||"");
      if(action.type==="RESET")setChosen("");
    }catch(e){setError(true);setMessage(e instanceof Error?e.message:"Testen ble avvist.");}
  }
  function send(fields:Record<string,unknown>) {
    run({...fields,idempotencyKey:"sim_"+crypto.randomUUID().replaceAll("-","")} as SandboxAction);
  }
  return <main className="pay pay-sandbox">
    <aside className="sandbox-warning"><strong>SANDBOX / DEMO</strong><span>Ingen ekte kort, bankkontoer, betalinger eller penger</span></aside>
    <header className="pay-heading"><p className="pay-eyebrow">VEDOY STUDIO / ISOLERT TESTMILJØ</p>
      <h1>Vedoy <span>Pay Sandbox.</span></h1>
      <div className="pay-intro"><p>Prøv kort, lommebok, betalinger, 3D Secure og Coins uten Wallester- eller Aera-avtale.</p>
        <Link href="/studio/pay">Tilbake til Vedoy Pay</Link></div>
    </header>
    {message&&<p role="status" className={error?"pay-error":"pay-success"}>{message}</p>}
    <section className="sandbox-stats">
      <div><small>Testkonto</small><strong>{state.accountOpened?"Aktiv":"Ikke opprettet"}</strong></div>
      <div><small>Testsaldo</small><strong>{state.accountOpened?money(state.balanceOre):"—"}</strong></div>
      <div><small>Demo-Coins</small><strong>{state.accountOpened?fmt(state.coins):"—"}</strong></div>
      <div><small>Testkort</small><strong>{state.cards.length}</strong></div>
    </section>
    <div className="pay-grid">
      <section className="pay-panel"><small>1 / LOMMEBOK</small><h2>Opprett testkonto</h2>
        <p>Start en falsk lommebok og legg til verdiløse testkroner.</p>
        <div className="pay-actions">
          <button type="button" className="pay-primary" disabled={state.accountOpened}
            onClick={()=>send({type:"OPEN_ACCOUNT"})}>Opprett testkonto</button>
          <button type="button" className="pay-secondary" disabled={!state.accountOpened||!!state.pending3ds}
            onClick={()=>send({type:"FUND_WALLET",amountOre:500000})}>+ 5 000 testkr</button>
        </div><p className="pay-footnote">Ingen bankkonto, IBAN eller innskudd opprettes.</p>
      </section>
      <section className="pay-panel"><small>2 / KORTDESIGN</small><h2>Lag testkort</h2>
        <div className="sandbox-card" style={{background:colors[design.color]}}>
          <b>V / PAY</b><span>SANDBOX</span><strong>{design.label}</strong><small>IKKE ET BETALINGSKORT</small>
        </div>
        <label htmlFor="sb-color">Farge</label>
        <select id="sb-color" value={design.color} onChange={e=>setDesign(d=>({...d,color:e.target.value}))}>
          {Object.keys(colors).map(k=><option key={k} value={k}>{k}</option>)}
        </select>
        <label htmlFor="sb-pattern">Mønster</label>
        <select id="sb-pattern" value={design.pattern} onChange={e=>setDesign(d=>({...d,pattern:e.target.value}))}>
          {["solid","waves","grid","diagonal","orbit"].map(k=><option key={k}>{k}</option>)}
        </select>
        <label htmlFor="sb-label">Kortetikett</label>
        <input id="sb-label" maxLength={24} value={design.label} onChange={e=>setDesign(d=>({...d,label:e.target.value}))}/>
        <div className="pay-actions">
          <button type="button" className="pay-primary" disabled={!state.accountOpened||state.cards.length>=4||!!state.pending3ds}
            onClick={()=>send({type:"ISSUE_CARD",cardType:"virtual",design})}>Virtuelt testkort</button>
          <button type="button" className="pay-secondary" disabled={!state.accountOpened||state.cards.length>=4||!!state.pending3ds}
            onClick={()=>send({type:"ISSUE_CARD",cardType:"physical",design})}>Simuler fysisk kort</button>
        </div>
        {state.cards.length>0&&<div className="sandbox-cards">
          {state.cards.map(c=><p key={c.id}><strong>{c.design.label}</strong> · {c.type==="virtual"?"Virtuelt":"Fysisk ordre"} · {c.id}</p>)}
        </div>}
      </section>
      <section className="pay-panel"><small>3 / BETALING OG 3DS</small><h2>Simuler betaling</h2>
        <label htmlFor="sb-card">Virtuelt testkort</label>
        <select id="sb-card" value={selected} onChange={e=>setChosen(e.target.value)} disabled={!!state.pending3ds||!active.length}>
          {!active.length?<option value="">Ingen testkort</option>:active.map(c=><option key={c.id} value={c.id}>{c.design.label} – {c.id}</option>)}
        </select>
        <label htmlFor="sb-amount">Beløp (testkr)</label>
        <input id="sb-amount" type="number" min="1" max="25000" value={amount}
          onChange={e=>setAmount(Number(e.target.value))} disabled={!!state.pending3ds}/>
        <label htmlFor="sb-scenario">Scenario</label>
        <select id="sb-scenario" value={scenario} disabled={!!state.pending3ds}
          onChange={e=>setScenario(e.target.value as typeof scenario)}>
          <option value="3ds">Simulert 3D Secure</option>
          <option value="approved">Godkjent</option><option value="declined">Avvist</option>
        </select>
        <div className="pay-actions"><button className="pay-primary" type="button"
          disabled={!selected||!!state.pending3ds}
          onClick={()=>send({type:"PAY",cardId:selected,amountOre:Math.round(amount*100),scenario})}>Test betaling</button></div>
        {state.pending3ds&&<div className="sandbox-challenge">
          <strong>Kun test-3DS · ikke ekte BankID</strong>
          <p>Simulert godkjenning av {money(state.pending3ds.amountOre)}.</p>
          <div className="pay-actions">
            <button className="pay-primary" type="button" onClick={()=>send({type:"COMPLETE_3DS",approved:true})}>Godkjenn</button>
            <button className="pay-secondary" type="button" onClick={()=>send({type:"COMPLETE_3DS",approved:false})}>Avvis</button>
          </div>
        </div>}
      </section>
      <section className="pay-panel"><small>4 / SENT DEMO-COINS</small><h2>Overfør testpoeng</h2>
        <p>Dette er ikke ekte Vedoy Coins eller en overføring til Sent.</p>
        <label htmlFor="sb-coins">Antall Coins</label>
        <input id="sb-coins" type="number" min="1" max="10000" value={coins}
          onChange={e=>setCoins(Number(e.target.value))} disabled={!!state.pending3ds}/>
        <div className="pay-actions">
          <button type="button" className="pay-secondary" disabled={!state.accountOpened||!!state.pending3ds}
            onClick={()=>send({type:"ADD_COINS",amount:coins})}>Legg til demo-Coins</button>
          <button type="button" className="pay-primary" disabled={!state.accountOpened||state.coins<coins||!!state.pending3ds}
            onClick={()=>send({type:"SEND_COINS",amount:coins})}>Send til Testmottaker</button>
        </div><p>Testmottaker: <strong>{fmt(state.recipientCoins)} demo-Coins</strong></p>
      </section>
    </div>
    <section className="pay-panel sandbox-history">
      <div className="sandbox-history-head"><h2>Testhistorikk</h2>
        <button className="pay-secondary" type="button" onClick={()=>run({type:"RESET"})}>Nullstill alt</button>
      </div>
      {state.events.length?<ol>{state.events.map(e=><li key={e.id}><strong>{e.label}</strong>
        <span>{e.amountOre!==undefined?money(e.amountOre):e.coins!==undefined?String(e.coins)+" demo-Coins":"Sandbox"} · {e.status||"simulert"}</span></li>)}</ol>:
        <p>Ingen testhendelser registrert.</p>}
    </section>
    <p className="pay-footnote">Isolert simulering i nettleserminnet. Oppdatering av siden nullstiller testdata. Ingen API-er for ekte kort, Coins eller penger kalles.</p>
  </main>;
}

"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
// Lightweight inline symbols keep this module compatible with the Studio dependency set.
type IconProps = { size?: number };
const SymbolIcon = ({ size=16, glyph }: IconProps & { glyph:string }) => <span aria-hidden="true" style={{fontSize:size,lineHeight:1,display:"inline-block"}}>{glyph}</span>;
const Check = ({size}:IconProps) => <SymbolIcon size={size} glyph="✓"/>;
const ArrowRight = ({size}:IconProps) => <SymbolIcon size={size} glyph="→"/>;
const CheckCircle2 = ({size}:IconProps) => <SymbolIcon size={size} glyph="✓"/>;
const RotateCcw = ({size}:IconProps) => <SymbolIcon size={size} glyph="↻"/>;
const ShieldCheck = ({size}:IconProps) => <SymbolIcon size={size} glyph="◆"/>;
const X = ({size}:IconProps) => <SymbolIcon size={size} glyph="×"/>;
const Sparkles = ({size}:IconProps) => <SymbolIcon size={size} glyph="✦"/>;
import { money, type CatalogContent, type CatalogPrice } from "@/lib/vedoy-catalog";

declare global {
  interface Window {
    turnstile?: { render: (target: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void }) => string; remove: (id: string) => void };
  }
}
type Recommendation = { main: string; addon?: string };
const questions = [
  { label: "Trenger bedriften en moderne, oppdatert nettside?", detail: "Vi kan levere design, drift og hosting.", choices: ["Ja, vi trenger en ny nettside", "Nei, nettsiden fungerer fint"] },
  { label: "Hvor mange jobber i bedriften?", detail: "Dette hjelper oss å anbefale riktig kapasitet.", choices: ["Kun meg", "2–5 personer", "Over 5 ansatte"] },
  { label: "Hvor mye teknisk hjelp trenger dere hver måned?", detail: "Inkluder feilsøking, skjermdeling og teknisk rådgivning.", choices: ["Sjelden eller aldri", "Omtrent 30 minutter", "1–2 timer og prioritert hjelp"] }
];
function recommend(answers: number[]): Recommendation {
  const needsSite = answers[0] === 0, teamSize = answers[1] || 0, need = answers[2] || 0;
  if (needsSite) return { main: "nettside-drift", addon: (need === 2 || (teamSize === 2 && need > 0)) ? "totalpartner" : undefined };
  if (need === 2 || (teamSize === 2 && need > 0)) return { main: "totalpartner" };
  if (need === 1 || (teamSize > 0 && need > 0)) return { main: "sikkerhet" };
  return { main: "gratis" };
}
const periodLabel = (period: CatalogPrice["billingPeriod"]) => period === "month" ? "/ mnd" : period === "hour" ? "/ time" : "engangsbeløp";
const vatLabel = (vat: CatalogPrice["vatMode"]) => vat === "incl" ? "inkl. mva" : vat === "excl" ? "eks. mva" : "";
export function PricingExperience({ prices, hero, turnstileSiteKey }: { prices: CatalogPrice[]; hero?: CatalogContent; turnstileSiteKey: string }) {
  const studio = prices.filter(p=>p.category === "studio");
  const assist = prices.filter(p=>p.category === "assist");
  const growth = prices.filter(p=>p.category === "growth");
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState<number[]>([]);
  const [result,setResult]=useState<Recommendation|null>(null);
  const [selection,setSelection]=useState<Recommendation|null>(null);
  const [token,setToken]=useState("");
  const [status,setStatus]=useState<"idle"|"submitting"|"success"|"error">("idle");
  const [message,setMessage]=useState("");
  const [form,setForm]=useState({ companyName:"",contactPerson:"",email:"",phone:"",consent:false,honeypot:"" });
  const challengeRef=useRef<HTMLDivElement>(null);
  const widgetRef=useRef<string|null>(null);
  const priced= (code:string)=>prices.find(p=>p.code===code);
  const selected = selection ? priced(selection.main) : null;
  const addon = selection?.addon ? priced(selection.addon) : null;
  const recMain=result ? priced(result.main) : null;
  const recAddon=result?.addon ? priced(result.addon) : null;
  const total = (a: CatalogPrice | undefined | null, b: CatalogPrice | undefined | null) => (a?.amountOre||0)+(b?.amountOre||0);
  useEffect(()=>{
    if(!selection || !turnstileSiteKey) return;
    const interval=window.setInterval(()=>{
      if(!window.turnstile || !challengeRef.current || widgetRef.current) return;
      try {
        widgetRef.current=window.turnstile.render(challengeRef.current,{sitekey:turnstileSiteKey,callback:setToken,"expired-callback":()=>setToken("")});
        window.clearInterval(interval);
      } catch { /* widget script is still loading */ }
    },300);
    return ()=>{ window.clearInterval(interval); if(widgetRef.current && window.turnstile){window.turnstile.remove(widgetRef.current);widgetRef.current=null;} };
  },[selection,turnstileSiteKey]);
  useEffect(()=>{
    if(!selection)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")close();};
    document.addEventListener("keydown",onKey);
    return ()=>document.removeEventListener("keydown",onKey);
  },[selection]);
  function close(){setSelection(null);setStatus("idle");setMessage("");setToken("");}
  function choose(index:number) {
    const next=[...answers,index];
    setAnswers(next);
    if(step+1<questions.length)setStep(step+1);
    else setResult(recommend(next));
  }
  function restart(){setStep(0);setAnswers([]);setResult(null);}
  function open(main:string,addonCode?:string){setSelection({main,addon:addonCode});setToken("");setStatus("idle");setMessage("");}
  async function send(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!selection || !token || !form.consent || status==="submitting")return;
    setStatus("submitting");setMessage("");
    try {
      const response=await fetch("/api/pricing/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,planCode:selection.main,addonCode:selection.addon,answers,turnstileToken:token})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error || "Forespørselen kunne ikke lagres.");
      setStatus("success");setMessage("Takk! Forespørselen er lagret. Vi tar kontakt.");
    }catch(error){setStatus("error");setMessage(error instanceof Error ? error.message : "Det oppstod en feil.");setToken("");}
  }
  return <>
    {turnstileSiteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" /> : null}
    <section className="vp-hero"><span className="vp-eyebrow"><i/> {hero?.eyebrow || "VEDØY STUDIO · TYDELIGE PRISER"}</span>
      <h1>{hero?.heading || "Digitale tjenester med faste priser."}</h1>
      <p>{hero?.body || "Velg riktig nivå for bedriften og få full oversikt før du bestiller."}</p>
      <div className="vp-hero-links"><a href="#kalkulator" className="vp-primary">Finn riktig løsning <ArrowRight size={17}/></a><a href="#abonnementer" className="vp-secondary">Se abonnementene</a></div>
    </section>
    <section id="kalkulator" className="vp-quiz-wrap"><div className="vp-quiz">
      <div className="vp-quiz-top"><span><Sparkles size={15}/> BEHOVSKALKULATOR</span><small>{result ? "Anbefaling" : `Spørsmål ${step+1} av ${questions.length}`}</small></div>
      {!result ? <>
        <div className="vp-progress">{questions.map((_,i)=><span key={i} className={i<=step?"active":""}/>)}</div>
        <h2>{questions[step].label}</h2><p>{questions[step].detail}</p>
        <div className="vp-options">{questions[step].choices.map((text,i)=><button type="button" key={text} onClick={()=>choose(i)}><span className="vp-radio"/>{text}<ArrowRight size={16}/></button>)}</div>
      </> : <>
        <span className="vp-result-tag"><CheckCircle2 size={16}/> VÅR ANBEFALING</span>
        <h2>{recMain?.title || "La oss finne riktig løsning"}{recAddon ? " + " + recAddon.title : ""}</h2>
        <div className="vp-total">{money(total(recMain,recAddon))} <small>/ mnd {recMain?.vatMode === "excl" ? "eks. mva" : ""}</small></div>
        {recMain?.setupOre ? <p>Etablering: {money(recMain.setupOre)}</p> : null}
        <p>{recAddon ? "Kombiner nettside og drift med ekstra IT-beredskap." : recMain?.description || "Fortell oss hva dere trenger."}</p>
        <div className="vp-result-actions"><button type="button" className="vp-primary" disabled={!recMain} onClick={()=>open(result.main,result.addon)}>Send forespørsel <ArrowRight size={16}/></button>
        <button type="button" className="vp-secondary" onClick={restart}><RotateCcw size={16}/> Start på nytt</button></div>
      </>}
    </div></section>
    <section className="vp-section" id="abonnementer"><header><span className="vp-label">BEDRIFTSPAKKER</span><h2>Én partner. Klare rammer.</h2><p>Prisene hentes fra Vedøy Developer Portal og kan endres sentralt.</p></header>
      <div className="vp-plans">{studio.map(plan=><article key={plan.code} className={plan.featured?"vp-plan vp-plan-featured":"vp-plan"}>
        <div><span className="vp-plan-tag">{plan.featured?"ANBEFALT":"VEDØY STUDIO"}</span><h3>{plan.title}</h3><p>{plan.description}</p></div>
        <div><strong className="vp-price">{money(plan.amountOre)}</strong><span className="vp-period">{periodLabel(plan.billingPeriod)} {vatLabel(plan.vatMode)}</span>
        {plan.setupOre ? <p className="vp-setup">Etablering {money(plan.setupOre)}</p> : <p className="vp-setup">Ingen etableringskostnad</p>}
        <ul>{plan.features.map(feature=><li key={feature}><Check size={16}/>{feature}</li>)}</ul></div>
        <button type="button" className={plan.featured?"vp-primary":"vp-secondary"} onClick={()=>open(plan.code)}>Velg {plan.title} <ArrowRight size={16}/></button>
      </article>)}</div>
    </section>
    <section className="vp-section vp-dark" id="assist-priser"><header><span className="vp-label">VEDØY ASSIST</span><h2>IT-hjelp når det trengs.</h2><p>Ordinære oppdragspriser for Haugesund og Karmøy. Rabatter avhenger av abonnement.</p></header>
      <div className="vp-assist-grid">{assist.map(p=><article key={p.code}><span>{p.title}</span><strong>{money(p.amountOre)}</strong><small>{periodLabel(p.billingPeriod)} · {vatLabel(p.vatMode)}</small><p>{p.description}</p></article>)}</div>
    </section>
    {growth.length>0 ? <section className="vp-section" id="growth-priser"><header><span className="vp-label">VEDØY GROWTH</span><h2>Arbeidsområdet som vokser med deg.</h2></header><div className="vp-growth-grid">{growth.map(p=><article key={p.code}><h3>{p.title}</h3><strong>{money(p.amountOre)}</strong><span>/ mnd {vatLabel(p.vatMode)}</span><p>{p.description}</p><Link href={`/start-bedrift?plan=${encodeURIComponent(p.code.replace("growth-",""))}&source=pricing`} className="vp-secondary">Se løsning ↗</Link></article>)}</div></section> : null}
    <footer className="vp-foot"><p><ShieldCheck size={17}/> En forespørsel er ikke en bindende bestilling. Alle kostnader og vilkår avklares før oppstart.</p><Link href="/#kontakt">Kontakt Vedøy Studio ↗</Link></footer>
    {selection && <div className="vp-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}>
      <div className="vp-modal" role="dialog" aria-modal="true" aria-label="Send prisforespørsel"><button className="vp-modal-close" type="button" onClick={close} aria-label="Lukk"><X size={21}/></button>
        <span className="vp-label">FORESPØRSEL</span><h2>{selected?.title || "Vedøy Studio"}{addon ? " + "+addon.title : ""}</h2>
        <p>{selected ? money(total(selected,addon)) + " / mnd" : ""} · Vi kontakter deg før eventuell avtale.</p>
        {status==="success" ? <div className="vp-message success"><CheckCircle2 size={20}/>{message}</div> : <form onSubmit={send} className="vp-lead-form">
          <label>Bedrift<input required maxLength={160} value={form.companyName} onChange={e=>setForm({...form,companyName:e.target.value})} placeholder="Bedrift AS"/></label>
          <label>Kontaktperson<input required maxLength={120} value={form.contactPerson} onChange={e=>setForm({...form,contactPerson:e.target.value})} placeholder="Ditt navn"/></label>
          <label>E-post<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="deg@bedrift.no"/></label>
          <label>Telefon (valgfritt)<input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
          <input type="text" className="vp-hidden-field" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.honeypot} onChange={e=>setForm({...form,honeypot:e.target.value})}/>
          <label className="vp-consent"><input type="checkbox" checked={form.consent} onChange={e=>setForm({...form,consent:e.target.checked})}/><span>Jeg samtykker til at Vedøy kontakter meg om forespørselen. Se <Link href="/privacy" target="_blank">personvernerklæringen</Link>.</span></label>
          {turnstileSiteKey ? <div ref={challengeRef}/> : <p className="vp-message">Kontaktskjemaet er ikke aktivert ennå. Bruk kontaktsiden.</p>}
          {message ? <p role="alert" className={status==="error"?"vp-message error":"vp-message"}>{message}</p> : null}
          {turnstileSiteKey ? <button type="submit" className="vp-primary" disabled={!form.consent||!token||status==="submitting"}>{status==="submitting"?"Lagrer …":"Send forespørsel"} <ArrowRight size={16}/></button> : <Link className="vp-primary" href="/#kontakt">Kontakt oss om valgt pakke <ArrowRight size={16}/></Link>}
        </form>}
      </div>
    </div>}
  </>;
}

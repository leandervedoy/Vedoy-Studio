"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CatalogPrice } from "@/lib/vedoy-catalog";
import {
  MULTISITE_ADDON_CODES, MULTISITE_FEATURES, MULTISITE_SECTORS,
  calculateMultisiteQuote, multisiteMoney, type MultisiteSectorId, type MultisiteAddonCode
} from "@/lib/multisite";
import { VedoyStudioCredit } from "@/components/vedoy-studio-credit";
import "./multisite-wizard.css";

const palette = ["#247856","#203a64","#8241a7","#bb633d","#151515","#c63572"];
const budgetOptions = [
  {value:"unsure",label:"Vet ikke ennå"},
  {value:"low",label:"Lavt – viktigst å komme i gang"},
  {value:"mid",label:"Middels – kvalitet og vekst"},
  {value:"high",label:"Større løsning – mange behov"}
] as const;

export default function MultisiteWizard({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [step, setStep] = useState(0);
  const [sector, setSector] = useState<MultisiteSectorId>("services");
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [brandColor, setBrandColor] = useState("#247856");
  const [logoUrl, setLogoUrl] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop"|"mobile">("desktop");
  const [websiteStatus, setWebsiteStatus] = useState<"new"|"replace"|"improve">("new");
  const [budget, setBudget] = useState<"unsure"|"low"|"mid"|"high">("unsure");
  const [featureIds, setFeatureIds] = useState<string[]>([]);
  const [addonCode, setAddonCode] = useState<MultisiteAddonCode>("");
  const [catalog, setCatalog] = useState<CatalogPrice[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [source, setSource] = useState("");
  const [person, setPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle"|"submitting"|"success"|"error">("idle");
  const [message, setMessage] = useState("");
  const wizardPanel = useRef<HTMLElement|null>(null);
  const hasNavigated = useRef(false);
  const challenge = useRef<HTMLDivElement>(null);
  const widget = useRef<string|null>(null);
  const logoRef = useRef<string|null>(null);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const campaign = qs.get("source") || qs.get("utm_campaign") || "";
    setSource(/^[a-zA-Z0-9._-]{0,80}$/.test(campaign) ? campaign : "");
    const selected = qs.get("tema");
    if (MULTISITE_SECTORS.some(s => s.id === selected)) setSector(selected as MultisiteSectorId);
    let canceled = false;
    fetch("/api/multisite/catalog", {cache:"no-store"})
      .then(async response => {
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.prices)) throw new Error(result.error || "Priser er utilgjengelige.");
        return result.prices as CatalogPrice[];
      })
      .then(prices => { if (!canceled) setCatalog(prices); })
      .catch(error => { if (!canceled) setCatalogError(error instanceof Error ? error.message : "Priser er utilgjengelige."); });
    return () => { canceled = true; };
  }, []);

  useEffect(() => {
    if (step !== 3 || !turnstileSiteKey || status === "success") return;
    const timer = window.setInterval(() => {
      if (!window.turnstile || !challenge.current || widget.current) return;
      try {
        widget.current = window.turnstile.render(challenge.current, {
          sitekey: turnstileSiteKey,
          callback: setToken,
          "expired-callback": () => setToken("")
        });
        window.clearInterval(timer);
      } catch { /* script is still loading */ }
    }, 250);
    return () => {
      window.clearInterval(timer);
      if (widget.current && window.turnstile) {
        window.turnstile.remove(widget.current);
        widget.current = null;
      }
    };
  }, [step, turnstileSiteKey, status]);

  useEffect(() => () => { if (logoRef.current) URL.revokeObjectURL(logoRef.current); }, []);

  // Keep the next question visible and keyboard navigation predictable on mobile.
  useEffect(() => {
    if (!hasNavigated.current) { hasNavigated.current = true; return; }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    wizardPanel.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [step]);

  const industry = MULTISITE_SECTORS.find(s => s.id === sector) || MULTISITE_SECTORS[0];
  const quote = useMemo(() => {
    try { return catalog.length ? calculateMultisiteQuote(catalog, featureIds, addonCode) : null; }
    catch { return null; }
  }, [catalog, featureIds, addonCode]);

  const logoChanged = (file?: File) => {
    if (logoRef.current) URL.revokeObjectURL(logoRef.current);
    logoRef.current = null;
    setLogoUrl("");
    if (!file || !["image/png","image/jpeg","image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      if (file) setMessage("Logo må være PNG, JPEG eller WebP, maks 2 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    logoRef.current = url;
    setLogoUrl(url);
    setMessage("");
  };
  const toggle = (id: string) => setFeatureIds(current =>
    current.includes(id) ? current.filter(x => x !== id) : [...current, id]
  );
  const demoUrl = "https://vedoy-multisite-experience-vedoy.vercel.app/?tema=" + encodeURIComponent(sector);
  const canContinue = step !== 1 || businessName.trim().length >= 2;

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quote || !consent || !turnstileSiteKey || !token || status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/multisite/leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector, featureIds, addonCode, businessName: businessName.trim(),
          contactPerson: person.trim(), email: email.trim(), phone: phone.trim(),
          tagline: tagline.trim(), brandColor, budget, websiteStatus, source,
          priceVersions: quote.versions, consent, marketingConsent, honeypot: "",
          turnstileToken: token
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kunne ikke lagre forespørselen.");
      setStatus("success");
      setMessage("Takk! Forespørselen er lagret i Vedøy Studio. Vi tar kontakt.");
    } catch (error) {
      setStatus("error");
      setToken("");
      setMessage(error instanceof Error ? error.message : "Kunne ikke lagre forespørselen.");
    }
  }

  return <main className="ms-page" style={{["--ms-accent" as string]: brandColor}}>
    {turnstileSiteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive"/> : null}
    <header className="ms-header">
      <Link href="/" className="ms-brand">V <strong>Vedøy Studio</strong></Link>
      <Link href="/yrker">Se alle bransjer ↗</Link>
    </header>
    <section className="ms-intro">
      <span>VEDØY MULTISITE · PERSONLIG NETTSIDEFORSLAG</span>
      <h1>Din idé. <em>Din nettside.</em></h1>
      <p>Fortell oss litt om virksomheten din. Velg funksjonene du faktisk trenger, se en tilpasset forhåndsvisning og få et uforpliktende prisforslag.</p>
    </section>
    <div className="ms-layout">
      <section className="ms-panel" ref={wizardPanel} aria-label="Nettsideveiviser">
        <div className="ms-progress" aria-live="polite"><b>Steg {step+1} av 4</b><span>{["Bransje","Din merkevare","Funksjoner","Tilbud"][step]}</span></div>
        <div className="ms-track" role="progressbar" aria-valuenow={step+1} aria-valuemin={1} aria-valuemax={4} aria-label="Fremdrift i nettsideveiviseren">{[0,1,2,3].map(i => <span key={i} className={i<=step?"active":""}/>)}</div>
        {step<3 ? <a className="ms-mobile-preview-link" href="#multisite-preview">Se forhåndsvisningen ↓</a> : null}
        <div className="ms-step-animate" key={step}>

        {step===0 ? <>
          <h2>Hva slags virksomhet har du?</h2><p>Vi velger en relevant Multisite-demo ut fra bransjen.</p>
          <div className="ms-sectors">{MULTISITE_SECTORS.map(s =>
            <button key={s.id} type="button" className={s.id===sector?"selected":""} aria-pressed={s.id===sector} onClick={()=>setSector(s.id)}>
              <span>{s.icon}</span>{s.name}
            </button>)}</div>
        </> : null}

        {step===1 ? <>
          <h2>Gi nettsiden din egen identitet</h2>
          <p>Opplysningene brukes i forhåndsvisningen. Logoen forblir i nettleseren og sendes ikke inn.</p>
          <label className="ms-field">Navn på bedriften eller organisasjonen
            <input maxLength={120} value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="F.eks. Haugesund Blomster"/>
          </label>
          <label className="ms-field">Kort slagord eller beskrivelse (valgfritt)
            <input maxLength={180} value={tagline} onChange={e=>setTagline(e.target.value)} placeholder="Lokale opplevelser, gjort enkelt"/>
          </label>
          <label className="ms-field">Logo (PNG, JPEG eller WebP, maks 2 MB)
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>logoChanged(e.target.files?.[0])}/>
          </label>
          <p className="ms-mini">Velg profilfarge</p>
          <div className="ms-colors">{palette.map(color=><button key={color} type="button" onClick={()=>setBrandColor(color)}
            aria-label={"Velg farge "+color} aria-pressed={brandColor===color}
            className={color===brandColor?"selected":""} style={{background:color}}/>)}
            <label className="ms-custom-color">Egen <input aria-label="Egendefinert profilfarge" type="color" value={brandColor} onChange={e=>setBrandColor(e.target.value)}/></label>
          </div>
          <label className="ms-field">Har dere en nettside allerede?
            <select value={websiteStatus} onChange={e=>setWebsiteStatus(e.target.value as typeof websiteStatus)}>
              <option value="new">Nei, vi starter fra bunnen</option><option value="replace">Ja, vi ønsker en ny nettside</option><option value="improve">Ja, vi vil forbedre den</option>
            </select>
          </label>
        </> : null}

        {step===2 ? <>
          <h2>Hva trenger nettsiden din?</h2><p>Velg så mange funksjoner du ønsker. Uten fast katalogpris merkes de tydelig som «Pris etter avtale».</p>
          <div className="ms-features">{MULTISITE_FEATURES.map(f=><label key={f.id} className={featureIds.includes(f.id)?"active":""}>
            <input type="checkbox" checked={featureIds.includes(f.id)} onChange={()=>toggle(f.id)}/>
            <span>{f.icon}</span><span><strong>{f.title}</strong><small>{f.description}</small></span>
          </label>)}</div>
          <label className="ms-field">Ønsket budsjettnivå
            <select value={budget} onChange={e=>setBudget(e.target.value as typeof budget)}>
              {budgetOptions.map(b=><option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </label>
          <label className="ms-field">Valgfritt ekstra Vedøy-abonnement
            <select value={addonCode} onChange={e=>setAddonCode(e.target.value as MultisiteAddonCode)}>
              <option value="">Ingen ekstra abonnement</option>
              {MULTISITE_ADDON_CODES.map(code=><option value={code} key={code}>{catalog.find(p=>p.code===code)?.title || code}</option>)}
            </select>
          </label>
        </> : null}

        {step===3 ? <>
          <h2>Din anbefaling og pris</h2>
          {catalogError ? <p role="alert" className="ms-error">{catalogError}</p> : null}
          {!quote ? <p role="alert" className="ms-error">Kan ikke beregne pris uten den oppdaterte katalogen. Ingen forespørsel kan sendes før prislisten er tilgjengelig.</p> :
            <div className="ms-quote">
              {quote.lines.map(line=><div key={line.code} className="ms-quote-row">
                <div><strong>{line.title}</strong><small>Versjon {line.version} · {line.vatMode==="excl"?"eks. mva":line.vatMode==="incl"?"inkl. mva":"mva ikke aktuelt"}</small></div>
                <strong>{multisiteMoney(line.amountOre)} {line.billingPeriod==="month"?"/mnd":""}</strong>
              </div>)}
              {quote.custom.map(item=><div key={item.id} className="ms-quote-row"><span>{item.title}</span><strong>Pris etter avtale</strong></div>)}
              <div className="ms-total"><div><span>Kjente månedskostnader</span><strong>{multisiteMoney(quote.monthlyOre)}/mnd</strong></div>
                <div><span>Etablering</span><strong>{multisiteMoney(quote.setupOre)}</strong></div>
                {quote.oneTimeOre ? <div><span>Engangstjenester</span><strong>{multisiteMoney(quote.oneTimeOre)}</strong></div> : null}
              </div>
              <p>{quote.requiresIndividualOffer?"Totalt tilbud må avklares: noen valgte funksjoner har ingen fast katalogpris. ":""}{quote.vatMode==="mixed"?"Prislinjene har ulike MVA-betingelser. ":""}Kostnader for tredjepart, domene og særskilt utvikling kan komme i tillegg. Dette er ikke en bindende bestilling.</p>
            </div>}
          {status==="success" ? <div role="status" className="ms-done"><h3>Forespørselen er mottatt ✓</h3><p>{message}</p><Link href="/">Til Vedøy Studio</Link></div> :
            <form className="ms-contact" onSubmit={send}>
              <h3>Be om et konkret tilbud</h3>
              <label className="ms-field">Kontaktperson<input required minLength={2} maxLength={120} value={person} onChange={e=>setPerson(e.target.value)}/></label>
              <label className="ms-field">E-post<input required type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></label>
              <label className="ms-field">Telefon (valgfritt)<input type="tel" maxLength={40} value={phone} onChange={e=>setPhone(e.target.value)}/></label>
              <label className="ms-check"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>Jeg ønsker at Vedøy Studio kontakter meg om denne forespørselen, og har lest <Link href="/privacy" target="_blank">personvernerklæringen</Link>.</span></label>
              <label className="ms-check"><input type="checkbox" checked={marketingConsent} onChange={e=>setMarketingConsent(e.target.checked)}/><span>Jeg ønsker også frivillig å motta relevante tilbud og nyheter. (Ikke påkrevd.)</span></label>
              <div className="ms-hidden" aria-hidden="true"><label>La dette stå tomt<input tabIndex={-1} autoComplete="off" name="honeypot"/></label></div>
              {turnstileSiteKey ? <div ref={challenge} aria-label="Botkontroll"/> : <p role="alert" className="ms-error">Direkte innsending er midlertidig deaktivert. Du kan fortsatt <Link href="/contact">kontakte Vedøy Studio her</Link> for et tilbud.</p>}
              <button className="ms-primary" type="submit" disabled={!quote || !consent || !token || !turnstileSiteKey || status==="submitting"}>{status==="submitting"?"Sender…":"Send uforpliktende forespørsel →"}</button>
              {message && status==="error" ? <p role="alert" className="ms-error">{message}</p> : null}
            </form>}
        </> : null}

        {message && step===1 ? <p role="alert" className="ms-error">{message}</p> : null}
        </div>
        <nav className="ms-steps" aria-label="Navigasjon i veiviseren">
          <button type="button" disabled={step===0 || status==="submitting"} onClick={()=>setStep(v=>v-1)}>← Tilbake</button>
          {step<3 ? <button className="ms-primary" type="button" disabled={!canContinue} onClick={()=>setStep(v=>v+1)}>Neste steg →</button> : null}
        </nav>
      </section>
      <aside className="ms-preview" id="multisite-preview" aria-label="Forhåndsvisning av din nettside">
        <div className="ms-preview-top"><span>LIVE FORHÅNDSVISNING</span><div className="ms-preview-controls" role="group" aria-label="Vis forhåndsvisningen som"><button type="button" aria-pressed={previewMode==="desktop"} onClick={()=>setPreviewMode("desktop")}>PC</button><button type="button" aria-pressed={previewMode==="mobile"} onClick={()=>setPreviewMode("mobile")}>Mobil</button></div></div>
        <div className={previewMode==="mobile"?"ms-browser ms-browser--mobile":"ms-browser"}>
          <div className="ms-browser-top"><i>● ● ●</i><span>{businessName.trim() || "dinbedrift"}.no · DEMO</span></div>
          <div className="ms-site">
            <nav><div className="ms-site-logo">{logoUrl?<img src={logoUrl} alt="Valgt lokal logo"/>:<span>{businessName.slice(0,1).toUpperCase() || industry.icon}</span>}
              <strong>{businessName.trim() || "Din bedrift"}</strong></div><span>Om oss　 Tjenester　 Kontakt</span></nav>
            <div className="ms-site-hero" key={sector}><span>{industry.icon} {industry.name}</span>
              <h2>{tagline.trim() || industry.heading}</h2>
              <p>{industry.description}</p><span className="ms-site-button">Kontakt oss →</span>
            </div>
            <div className="ms-site-cards" key={featureIds.join("|")}>{(featureIds.length ? featureIds.slice(0,3).map(id=>MULTISITE_FEATURES.find(f=>f.id===id)).filter(Boolean) : MULTISITE_FEATURES.slice(0,3)).map(f=>
              <div key={f!.id}><span>{f!.icon}</span><strong>{f!.title}</strong><small>Eksempel på tjeneste</small></div>)}</div>
            <footer>Din idé · Utviklet av Vedøy Studio</footer>
          </div>
        </div>
        <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="ms-demo-link">Åpne interaktiv {industry.name.toLowerCase()}-demo ↗</a>
        <p className="ms-small">Forhåndsvisningen viser valgte farger, navn og funksjoner. Den separate bransjedemoen illustrerer funksjonalitet og tar ikke automatisk med dine lokale endringer.</p>
      </aside>
    </div>
    <footer className="ms-footer"><div><strong>Vedøy Multisite</strong><span>En tryggere vei fra idé til nettside · <Link href="/privacy">Personvern</Link></span></div><VedoyStudioCredit compact /></footer>
  </main>;
}

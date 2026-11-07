"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { STAFF_AREAS, type StaffArticle, type StaffTool } from "@/lib/staff-knowledge";
import { studioEconomics, linkEconomics, pbxEconomics } from "@/lib/staff-calculators";

const nok = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 });
function money(value: number) { return `${nok.format(Math.round(value))} kr`; }
function Slider({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void;
}) {
  return <label className="staff-slider"><span>{label}<strong>{nok.format(value)}{unit}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} /><span className="staff-slider__range"><small>{nok.format(min)}{unit}</small><small>{nok.format(max)}{unit}</small></span></label>;
}

function Results({ entries, note }: { entries: ReadonlyArray<{ label: string; value: string; highlight?: boolean }>; note: string }) {
  return <div className="staff-calculator__results"><div className="staff-results-grid">{entries.map((entry) => <div key={entry.label} className={entry.highlight ? "staff-results-card staff-results-card--main" : "staff-results-card"}><span>{entry.label}</span><strong>{entry.value}</strong></div>)}</div><p className="staff-calculator__note">{note}</p></div>;
}

function ProfitCalculator() {
  const [projects, setProjects] = useState(2);
  const [subscribers, setSubscribers] = useState(8);
  const [hours, setHours] = useState(14);
  const [setup, setSetup] = useState(12900);
  const [retainer, setRetainer] = useState(790);
  const { revenue, providerAndTime, net } = studioEconomics({projects, subscribers, hours, setup, retainer});
  return <CalculatorShell title="Økonomilaboratorium" subtitle="Test lønnsomheten for én måned med kundeleverte 3D-modeller." tag="STUDIO / PROFITT">
    <div className="staff-slider-grid">
      <Slider label="Nye installasjoner / måned" value={projects} min={0} max={10} onChange={setProjects} />
      <Slider label="Aktive abonnementer" value={subscribers} min={0} max={60} onChange={setSubscribers} />
      <Slider label="Timer per installasjon" value={hours} min={3} max={50} onChange={setHours} unit=" t" />
      <Slider label="Oppstartspris" value={setup} min={2900} max={30000} step={500} onChange={setSetup} unit=" kr" />
      <Slider label="Månedspris / abonnement" value={retainer} min={190} max={2000} step={50} onChange={setRetainer} unit=" kr" />
    </div>
    <Results entries={[{label:"Omsetning eks. mva.",value:money(revenue)},{label:"Direktekostnader og verdsatt tid",value:money(providerAndTime)},{label:"Økonomisk overskudd etter faste kostnader",value:money(net),highlight:true}]} note="Antakelser: 1 500 kr direkte kostnad per installasjon, 150 kr per abonnement, 0,5 supporttimer per abonnement, 350 kr/time og 2 000 kr faste månedskostnader. Ekskluderer salgstid, skatt og ekstra modellarbeid." />
  </CalculatorShell>;
}

function LinkCalculator() {
  const [users, setUsers] = useState(40);
  const [price, setPrice] = useState(149);
  const [numberCost, setNumberCost] = useState(25);
  const [minutes, setMinutes] = useState(20);
  const [sms, setSms] = useState(10);
  const {revenue, providerAndTime, net} = linkEconomics({users, price, numberCost, minutes, sms});
  return <CalculatorShell title="Nummerøkonomi" subtitle="Beregn månedlig bidrag fra ekstra nummerabonnementer." tag="LINK / TESTMODELL">
    <div className="staff-slider-grid">
      <Slider label="Aktive betalende kunder" value={users} min={0} max={200} onChange={setUsers} />
      <Slider label="Pris per kunde / måned" value={price} min={49} max={399} step={10} onChange={setPrice} unit=" kr" />
      <Slider label="Nummerleie per kunde" value={numberCost} min={5} max={100} step={5} onChange={setNumberCost} unit=" kr" />
      <Slider label="Utgående minutter per kunde" value={minutes} min={0} max={200} step={5} onChange={setMinutes} unit=" min" />
      <Slider label="SMS per kunde" value={sms} min={0} max={150} step={5} onChange={setSms} unit=" SMS" />
    </div>
    <Results entries={[{label:"Omsetning eks. mva.",value:money(revenue)},{label:"Operatørkostnader + verdsatt support",value:money(providerAndTime)},{label:"Økonomisk bidrag etter faste kostnader",value:money(net),highlight:true}]} note="Fiktive satser: 0,18 kr/min, 0,55 kr/SMS, 0,1 supporttime/kunde × 350 kr/time, 500 kr faste kostnader. IKKE reelle Twilio-/Telnyx-priser. Lokale avgifter, betaling, portering og internasjonale priser er ikke med." />
  </CalculatorShell>;
}

function PbxCalculator() {
  const [companies, setCompanies] = useState(6);
  const [seats, setSeats] = useState(8);
  const [base, setBase] = useState(599);
  const [seatPrice, setSeatPrice] = useState(159);
  const [minutes, setMinutes] = useState(60);
  const {revenue, providerAndTime, net} = pbxEconomics({companies, seats, base, seatPrice, minutes});
  return <CalculatorShell title="PBX-kapasitetsmodell" subtitle="Se om et sentralbordabonnement tåler kundens bruk og supportbehov." tag="PBX / TESTMODELL">
    <div className="staff-slider-grid">
      <Slider label="Betalende bedrifter" value={companies} min={0} max={30} onChange={setCompanies} />
      <Slider label="Ansatte per bedrift" value={seats} min={1} max={60} onChange={setSeats} />
      <Slider label="Fastpris per bedrift" value={base} min={199} max={1999} step={100} onChange={setBase} unit=" kr" />
      <Slider label="Pris per ansatt" value={seatPrice} min={49} max={399} step={10} onChange={setSeatPrice} unit=" kr" />
      <Slider label="Minutter per ansatt" value={minutes} min={0} max={300} step={10} onChange={setMinutes} unit=" min" />
    </div>
    <Results entries={[{label:"Månedlig omsetning",value:money(revenue)},{label:"Operatørkostnader + verdsatt support",value:money(providerAndTime)},{label:"Økonomisk bidrag etter faste kostnader",value:money(net),highlight:true}]} note="Fiktive satser: 25 kr/bruker i operatørkostnad, 0,18 kr/min, 1,5 supporttime/bedrift × 350 kr og 1 500 kr faste kostnader. Oppsett, skatt, avgifter og spesialfunksjoner er ikke inkludert." />
  </CalculatorShell>;
}

function PbxRouting() {
  const [open, setOpen] = useState(true);
  const [choice, setChoice] = useState("sales");
  const [busy, setBusy] = useState(false);
  const destination = !open ? "Stengt → åpningstidsbeskjed → telefonsvarer" : busy ? "Kø full → ventebeskjed → backup / telefonsvarer" : choice === "sales" ? "Salg → salgsgruppe → ledig ansatt" : choice === "support" ? "Support → supportkø → ledig rådgiver" : "Administrasjon → resepsjon / sentralbord";
  return <CalculatorShell title="IVR-laboratorium" subtitle="Simuler en innkommende telefonsamtale uten å kontakte ekte numre." tag="PBX / SANDBOX">
    <div className="staff-route-controls"><label><span>Bedriften er</span><select value={open ? "open" : "closed"} onChange={(e) => setOpen(e.target.value === "open")}><option value="open">Innenfor åpningstid</option><option value="closed">Utenfor åpningstid</option></select></label><label><span>Innringeren velger</span><select value={choice} onChange={(e) => setChoice(e.target.value)}><option value="sales">1 · Salg</option><option value="support">2 · Support</option><option value="other">3 · Administrasjon</option></select></label><label><span>Tilgjengelig kapasitet</span><select value={busy ? "busy" : "free"} onChange={(e) => setBusy(e.target.value === "busy")}><option value="free">Ledig ansatt</option><option value="busy">Ingen ledig ansatt</option></select></label></div>
    <div className="staff-callflow" aria-live="polite"><span>◉ Innkommende anrop</span><span className="staff-callflow__line">↓</span><span>{open ? "◷ Åpent nå" : "◷ Stengt"}</span><span className="staff-callflow__line">↓</span><strong>{destination}</strong></div><p className="staff-calculator__note">Dette er kun en lokal visuell simulering. Ingen SIP-oppkobling, faktiske anrop eller endring av PBX-konfigurasjon skjer.</p>
  </CalculatorShell>;
}

function CalculatorShell({ title, subtitle, tag, children }: { title: string; subtitle: string; tag: string; children: React.ReactNode }) {
  return <section id="interactive-tool" className="staff-calculator" aria-labelledby="interactive-tool-heading"><div className="staff-calculator__head"><span className="staff-overline">{tag}</span><h2 id="interactive-tool-heading">{title}</h2><p>{subtitle}</p></div>{children}</section>;
}

function Tool({ name }: { name: StaffTool }) {
  if (name === "studio-profit") return <ProfitCalculator />;
  if (name === "link-economics") return <LinkCalculator />;
  if (name === "pbx-economics") return <PbxCalculator />;
  return <PbxRouting />;
}

export function StaffArticleView({ article }: { article: StaffArticle }) {
  const [checked, setChecked] = useState<number[]>([]);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`vedoy-staff-checklist-${article.slug}`) || "[]");
      if (Array.isArray(saved)) setChecked(saved.filter((value: unknown) => typeof value === "number"));
      const read = JSON.parse(localStorage.getItem("vedoy-staff-articles-v1") || "{}");
      setCompleted(Array.isArray(read.completed) && read.completed.includes(article.slug));
    } catch { /* optional local state */ }
    setReady(true);
  }, [article.slug]);
  function toggleCheck(index: number) {
    const next = checked.includes(index) ? checked.filter((entry) => entry !== index) : [...checked, index];
    setChecked(next);
    try { localStorage.setItem(`vedoy-staff-checklist-${article.slug}`, JSON.stringify(next)); } catch { /* optional local state */ }
  }
  function markRead() {
    const value = !completed;
    setCompleted(value);
    try {
      const state = JSON.parse(localStorage.getItem("vedoy-staff-articles-v1") || "{}");
      const old = Array.isArray(state.completed) ? state.completed.filter((slug: unknown) => typeof slug === "string") : [];
      const next = value ? [...new Set([...old, article.slug])] : old.filter((slug: string) => slug !== article.slug);
      localStorage.setItem("vedoy-staff-articles-v1", JSON.stringify({ completed: next }));
    } catch { /* optional local state */ }
  }
  const itemsDone = ready ? checked.length : 0;
  const progress = useMemo(() => article.checklist.length ? Math.min(100, Math.round(itemsDone * 100 / article.checklist.length)) : 0, [itemsDone, article.checklist.length]);
  return <div className={`staff-portal staff-reader staff-reader--${article.area}`}>
    <div className="staff-breadcrumbs"><Link href="/studio">Studio</Link><span>/</span><Link href="/studio/staff">Ansattportal</Link><span>/</span><Link href={`/studio/staff/${article.area}`}>{STAFF_AREAS[article.area].short}</Link><span>/</span><strong>Artikkel</strong></div>
    <div className="staff-reader__layout"><main className="staff-reader__main">
      <div className="staff-reader__intro"><span className="staff-overline">{STAFF_AREAS[article.area].name.toUpperCase()} / {article.category.toUpperCase()}</span><h1>{article.title}</h1><p>{article.intro}</p><div className="staff-reader__meta"><span>◷ {article.minutes} min lesetid</span><span>Oppdatert {article.updated}</span><span>{article.badge}</span></div></div>
      {article.sections.map((section) => <section id={section.id} className="staff-reader__section" key={section.id}><h2>{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}
      {article.tool && <Tool name={article.tool} />}
      <section id="checklist" className="staff-reader__section staff-checklist"><div className="staff-checklist__head"><div><span className="staff-overline">ØVELSE / KONTROLLPUNKTER</span><h2>Før du går videre</h2></div><strong>{progress}%</strong></div><div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Fullført sjekkliste" className="staff-progress"><span style={{width:`${progress}%`}} /></div><p>Kryss av når oppgaven er gjennomgått. Dette lagres på enheten din.</p><div className="staff-checklist__items">{article.checklist.map((line, index) => <label key={line} className={checked.includes(index) ? "is-checked" : ""}><input type="checkbox" checked={checked.includes(index)} onChange={() => toggleCheck(index)} /><span>{line}</span></label>)}</div></section>
      <section id="knowledge-check" className="staff-reader__section staff-quiz"><span className="staff-overline">KUNNSKAPSTEST</span><h2>Test forståelsen</h2><p>{article.quiz.question}</p><div className="staff-quiz__options">{article.quiz.answers.map((answer, index) => <button key={answer} type="button" aria-pressed={quizAnswer === index} className={quizAnswer === index ? "is-selected" : ""} onClick={() => setQuizAnswer(index)}><span>{String.fromCharCode(65+index)}</span>{answer}</button>)}</div>{quizAnswer !== null && <div className={`staff-quiz__feedback ${quizAnswer === article.quiz.correct ? "is-correct" : "is-wrong"}`} role="status"><strong>{quizAnswer === article.quiz.correct ? "✓ Riktig!" : "Ikke helt – prøv igjen."}</strong><p>{article.quiz.correct === quizAnswer ? article.quiz.explanation : "Se gjennom artikkelen og prøv et annet svar."}</p></div>}</section>
      {article.sources && <section className="staff-reader__sources"><h2>Videre lesning</h2>{article.sources.map((s) => <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">{s.label} ↗</a>)}</section>}
      <div className="staff-reader__finish"><div><strong>{completed ? "Artikkelen er markert som lest" : "Ferdig med artikkelen?"}</strong><p>Marker som lest for å holde oversikt på denne enheten.</p></div><button type="button" onClick={markRead}>{completed ? "✓ Markert som lest" : "Marker som lest"}</button></div>
    </main><aside className="staff-reader__rail" aria-label="Artikkelinnhold"><div><span className="staff-overline">I DENNE ARTIKKELEN</span>{article.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title.replace(/^\d+\s*\/\s*/, "")}</a>)}{article.tool && <a href="#interactive-tool">Interaktivt verktøy</a>}<a href="#checklist">Sjekkliste</a><a href="#knowledge-check">Kunnskapstest</a><hr/><Link href={`/studio/staff/${article.area}`}>← Tilbake til {STAFF_AREAS[article.area].name}</Link></div></aside></div>
  </div>;
}

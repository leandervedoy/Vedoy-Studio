"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { ServiceRenderType, StudioService } from "@/lib/services";

type Draft = {
  slug: string; title: string; cardText: string; eyebrow: string; lead: string;
  introduction: string; deliverables: string; focus: string; process: string; nextStep: string;
  renderType: ServiceRenderType; published: boolean; sortOrder: string;
};
type BuilderStep = "setup" | "content" | "publish";
type Filter = "all" | "published" | "draft";

const blank: Draft = { slug: "", title: "", cardText: "", eyebrow: "", lead: "", introduction: "", deliverables: "", focus: "", process: "", nextStep: "", renderType: "general", published: false, sortOrder: "0" };
const builderSteps: { id: BuilderStep; label: string; hint: string }[] = [
  { id: "setup", label: "Grunnlag", hint: "Navn og type" },
  { id: "content", label: "Innhold", hint: "Det kunden ser" },
  { id: "publish", label: "Publiser", hint: "Kontroller og gå live" }
];
const renderLabels: Record<ServiceRenderType, string> = { general: "Standard", website: "Nettside", webapp: "Webapp", store: "Nettbutikk", hosting: "Hosting", clothing: "Profilprodukter", ecommerce: "Ecommerce" };

function toDraft(service: StudioService): Draft {
  return { slug: service.slug, title: service.title, cardText: service.cardText, eyebrow: service.eyebrow, lead: service.lead, introduction: service.introduction, deliverables: service.deliverables.join("\n"), focus: service.focus.join("\n"), process: service.process.join("\n"), nextStep: service.nextStep, renderType: service.renderType ?? "general", published: service.published ?? true, sortOrder: String(service.sortOrder ?? 0) };
}

function payload(draft: Draft) {
  return { ...draft, sortOrder: Number(draft.sortOrder), deliverables: draft.deliverables.split("\n"), focus: draft.focus.split("\n"), process: draft.process.split("\n") };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ServiceManager({ initialServices, startNew = false }: { initialServices: StudioService[]; startNew?: boolean }) {
  const [services, setServices] = useState(initialServices);
  const [editing, setEditing] = useState<StudioService | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(blank);
  const [step, setStep] = useState<BuilderStep>("setup");
  const [filter, setFilter] = useState<Filter>("all");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const sorted = useMemo(() => [...services].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)), [services]);
  const visible = useMemo(() => sorted.filter((service) => filter === "all" || filter === "published" ? service.published : !service.published), [filter, sorted]);
  const currentStepIndex = builderSteps.findIndex((item) => item.id === step);

  useEffect(() => {
    if (!editing) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setEditing(null); };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); };
  }, [editing]);

  function openNew() {
    const nextOrder = Math.max(0, ...services.map((service) => service.sortOrder ?? 0)) + 1;
    setDraft({ ...blank, sortOrder: String(nextOrder) });
    setStep("setup"); setMessage(""); setEditing("new");
  }

  useEffect(() => {
    if (startNew) openNew();
  // The server only provides this flag for /studio/services?new=1.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startNew]);

  function openEdit(service: StudioService) { setDraft(toDraft(service)); setStep("setup"); setMessage(""); setEditing(service); }
  function field<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((current) => ({ ...current, [key]: value })); }
  function changeTitle(value: string) { setDraft((current) => ({ ...current, title: value, slug: editing === "new" && (!current.slug || current.slug === slugify(current.title)) ? slugify(value) : current.slug })); }

  async function save(event: FormEvent) {
    event.preventDefault(); if (!editing || saving) return;
    setSaving(true); setMessage("");
    const isNew = editing === "new";
    try {
      const response = await fetch(isNew ? "/api/services" : `/api/services/${editing.id}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(draft)) });
      const result = await response.json() as { service?: StudioService; error?: string };
      if (!response.ok || !result.service) throw new Error(result.error || "Kunne ikke lagre.");
      setServices((current) => isNew ? [...current, result.service!] : current.map((service) => service.id === result.service!.id ? result.service! : service));
      setEditing(null);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kunne ikke lagre."); }
    finally { setSaving(false); }
  }

  async function remove(service: StudioService) {
    if (!service.id || !window.confirm(`Slette «${service.title}»? Siden fjernes fra nettsiden.`)) return;
    const response = await fetch(`/api/services/${service.id}`, { method: "DELETE" });
    if (response.ok) setServices((current) => current.filter((item) => item.id !== service.id));
    else { const result = await response.json().catch(() => ({})) as { error?: string }; window.alert(result.error || "Kunne ikke slette tjenesten."); }
  }

  return <section className="service-builder">
    <header className="service-builder__header"><div><p className="editorial-kicker">TJENESTEBYGGER</p><h2>Bygg en tydelig<br /><em>tjenesteside.</em></h2><p>Opprett og oppdater tjenestene i samme arbeidsflate som en enkel nettsidebygger.</p></div><button className="service-builder__create" type="button" onClick={openNew}><span>+</span> Ny tjeneste</button></header>
    <div className="service-builder__toolbar"><div role="tablist" aria-label="Filtrer tjenester">{(["all", "published", "draft"] as Filter[]).map((item) => <button key={item} type="button" className={filter === item ? "is-active" : undefined} onClick={() => setFilter(item)}>{item === "all" ? `Alle (${services.length})` : item === "published" ? `Publisert (${services.filter((service) => service.published).length})` : `Kladder (${services.filter((service) => !service.published).length})`}</button>)}</div><small>Nummerering opprettes automatisk.</small></div>
    <div className="service-builder__grid">{visible.map((service) => <article key={service.id ?? service.slug} className={`service-builder-card service-builder-card--${service.renderType ?? "general"}`}>
      <div className="service-builder-card__visual"><span>{service.number}</span><small>{renderLabels[service.renderType ?? "general"]}</small><b>{service.published ? "LIVE" : "KLADD"}</b></div><div className="service-builder-card__content"><small>{service.eyebrow}</small><h3>{service.title}</h3><p>{service.cardText}</p><footer><Link href={`/tjenester/${service.slug}`} target="_blank">Se side ↗</Link><button type="button" onClick={() => openEdit(service)}>Rediger</button><button type="button" className="is-danger" onClick={() => remove(service)} aria-label={`Slett ${service.title}`}>×</button></footer></div>
    </article>)}</div>
    {!visible.length ? <div className="service-builder__empty"><span>◇</span><strong>Ingen tjenester her ennå.</strong><button type="button" onClick={openNew}>Opprett en tjeneste</button></div> : null}
    {editing ? <div className="service-builder-modal" role="dialog" aria-modal="true" aria-label={editing === "new" ? "Opprett ny tjeneste" : `Rediger ${editing.title}`}><button className="service-builder-modal__backdrop" onClick={() => setEditing(null)} aria-label="Lukk byggeren" /><form onSubmit={save}>
      <header><div><small>{editing === "new" ? "NY TJENESTE" : "REDIGER TJENESTE"}</small><h2>{draft.title || "Ny tjeneste"}</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Lukk">×</button></header>
      <div className="service-builder-modal__layout"><aside><p>BYGG STEGVIS</p>{builderSteps.map((item, index) => <button key={item.id} type="button" className={step === item.id ? "is-active" : undefined} onClick={() => setStep(item.id)}><span>0{index + 1}</span><strong>{item.label}</strong><small>{item.hint}</small></button>)}<div className="service-builder-modal__preview"><small>FORHÅNDSVISNING</small><strong>{draft.title || "Tjenestenavn"}</strong><span>{draft.cardText || "Kort forklaring av tjenesten."}</span></div></aside>
        <main><div className="service-builder-modal__eyebrow"><span>STEG 0{currentStepIndex + 1}</span><small>{builderSteps[currentStepIndex].hint}</small></div>
          {step === "setup" ? <div className="service-builder-fields"><h3>Start med det viktigste.</h3><p>Dette bestemmer kortet og URL-en på Vedøy Studio.</p><label>Tjenestenavn<input value={draft.title} onChange={(event) => changeTitle(event.target.value)} placeholder="For eksempel: Fotografering" required autoFocus /></label><label>Nettsideadresse <small>Opprettes automatisk fra navnet, men kan justeres.</small><div className="service-builder-url"><span>/tjenester/</span><input value={draft.slug} onChange={(event) => field("slug", event.target.value)} placeholder="fotografering" required /></div></label><label>Kategori<select value={draft.renderType} onChange={(event) => field("renderType", event.target.value as ServiceRenderType)}>{Object.entries(renderLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Merkeord / kategori<input value={draft.eyebrow} onChange={(event) => field("eyebrow", event.target.value)} placeholder="FOTO · INNHOLD · LANSERING" required /></label><label className="wide">Kort forklaring<textarea rows={3} value={draft.cardText} onChange={(event) => field("cardText", event.target.value)} placeholder="Hva får kunden ut av denne tjenesten?" required /></label></div> : null}
          {step === "content" ? <div className="service-builder-fields"><h3>Fyll siden med innhold.</h3><p>Skriv enkelt først. Punktene gjør det lett å skanne siden senere.</p><label className="wide">Hovedbudskap<textarea rows={2} value={draft.lead} onChange={(event) => field("lead", event.target.value)} placeholder="En kort setning som forklarer verdien." required /></label><label className="wide">Introduksjon<textarea rows={5} value={draft.introduction} onChange={(event) => field("introduction", event.target.value)} placeholder="Forklar tjenesten, hvem den passer for og hvordan samarbeidet fungerer." required /></label><label>Dette kan inngå <small>Én linje per punkt</small><textarea rows={7} value={draft.deliverables} onChange={(event) => field("deliverables", event.target.value)} placeholder={"Behovskartlegging\nDesign og innhold\nLansering"} required /></label><label>Teknologi og fokus <small>Én linje per punkt</small><textarea rows={7} value={draft.focus} onChange={(event) => field("focus", event.target.value)} placeholder={"Mobilvennlig\nSEO\nAnalyse"} /></label><label className="wide">Slik jobber vi <small>Én linje per steg</small><textarea rows={5} value={draft.process} onChange={(event) => field("process", event.target.value)} placeholder={"Vi avklarer behovet\nDu får et tydelig forslag\nVi bygger og tester"} required /></label><label className="wide">Neste steg<textarea rows={3} value={draft.nextStep} onChange={(event) => field("nextStep", event.target.value)} placeholder="Hva bør kunden sende eller gjøre nå?" /></label></div> : null}
          {step === "publish" ? <div className="service-builder-publish"><div><span>{draft.published ? "KLAR FOR KUNDER" : "LAGRES SOM KLADD"}</span><h3>{draft.title || "Gi tjenesten et navn"}</h3><p>{draft.cardText || "Legg inn en kort forklaring før du publiserer."}</p></div><label className="service-builder-toggle"><input type="checkbox" checked={draft.published} onChange={(event) => field("published", event.target.checked)} /><span><b>Publiser på Vedøy Studio</b><small>{draft.published ? "Tjenesten blir synlig for besøkende når du lagrer." : "Bare administratorer ser tjenesten før den publiseres."}</small></span></label><div className="service-builder-publish__check"><span>✓ Tjenestenummer velges automatisk</span><span>✓ Rekkefølge: {draft.sortOrder || "automatisk"}</span><span>✓ URL: /tjenester/{draft.slug || "…"}</span></div></div> : null}
        </main></div>{message ? <p className="service-builder-modal__error">{message}</p> : null}<footer className="service-builder-modal__footer"><button type="button" className="button button--ghost" onClick={() => currentStepIndex === 0 ? setEditing(null) : setStep(builderSteps[currentStepIndex - 1].id)}>{currentStepIndex === 0 ? "Avbryt" : "← Tilbake"}</button>{currentStepIndex < builderSteps.length - 1 ? <button type="button" className="button button--dark" onClick={() => setStep(builderSteps[currentStepIndex + 1].id)}>Neste steg →</button> : <button className="button button--dark" disabled={saving}>{saving ? "Lagrer …" : draft.published ? "Lagre og publiser" : "Lagre kladd"}</button>}</footer>
    </form></div> : null}
  </section>;
}

"use client";

import { useEffect, useState } from "react";

type Template = { name: string; type: string; accent: string; blocks: string[]; headline: string; intro: string };
type BuilderDraft = { siteName: string; headline: string; intro: string; cta: string; sections: string[] };

const templates: Template[] = [
  { name: "Nordic Service", type: "Tjenestebedrift", accent: "#dfb934", blocks: ["Hero", "Tjenester", "Booking", "Omtaler"], headline: "En roligere vei til god hjelp.", intro: "Tydelig hjelp fra folk som forstår hverdagen din." },
  { name: "Quiet Commerce", type: "Nettbutikk", accent: "#8b5cf6", blocks: ["Kolleksjon", "Produkter", "Historie", "Nyhetsbrev"], headline: "Produkter med noe å fortelle.", intro: "En gjennomtenkt butikk for mennesker, produkter og vekst." },
  { name: "Local Studio", type: "Kreativ bedrift", accent: "#2563eb", blocks: ["Arbeider", "Om", "Prosess", "Kontakt"], headline: "Arbeid som tåler å bli sett.", intro: "Vis frem prosessen, menneskene og det dere skaper." }
];

const emptyDraft: BuilderDraft = { siteName: "Min nye nettside", headline: "En bedre digital start.", intro: "En tydelig nettside som gjør det enklere å forstå, velge og ta kontakt.", cta: "Ta kontakt", sections: ["Tjenester", "Om oss", "Kontakt"] };

export function BuilderWorkspace() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [draft, setDraft] = useState<BuilderDraft>(emptyDraft);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("vedoy-builder-draft-v1");
    if (raw) try { setDraft({ ...emptyDraft, ...JSON.parse(raw) as Partial<BuilderDraft> }); setTemplate(templates[0]); } catch { window.localStorage.removeItem("vedoy-builder-draft-v1"); }
  }, []);

  function start(templateChoice?: Template) {
    setTemplate(templateChoice ?? templates[0]);
    if (templateChoice) setDraft({ siteName: templateChoice.name, headline: templateChoice.headline, intro: templateChoice.intro, cta: "Ta kontakt", sections: templateChoice.blocks.slice(1, 4) });
    setSaved(false);
  }

  function update(field: keyof BuilderDraft, value: string) { setDraft((current) => ({ ...current, [field]: value })); setSaved(false); }
  function toggleSection(section: string) { setDraft((current) => ({ ...current, sections: current.sections.includes(section) ? current.sections.filter((item) => item !== section) : [...current.sections, section] })); setSaved(false); }
  function saveDraft() { window.localStorage.setItem("vedoy-builder-draft-v1", JSON.stringify(draft)); setSaved(true); }

  if (!template) return <section className="builder-workspace"><div className="builder-workspace__intro"><div><span className="builder-label">STARTPUNKT</span><h2>Velg en retning for nettsiden.</h2><p>Malene gir deg et ryddig utgangspunkt. Alt innhold kan endres før publisering.</p></div><span className="builder-workspace__step">01 / 02</span></div><div className="builder-template-grid">{templates.map((item) => <article key={item.name}><div className="builder-template-preview" style={{ "--builder-accent": item.accent } as React.CSSProperties}><header><i /><i /><i /></header><section><b>{item.type}</b><h3>{item.headline}</h3><p>{item.intro}</p><span>{item.blocks[0]}</span></section><footer>{item.blocks.map((block) => <i key={block}>{block}</i>)}</footer></div><div className="builder-template-card"><small>{item.type}</small><h3>{item.name}</h3><p>{item.blocks.join(" · ")}</p><button type="button" className="button button--ghost button--wide" onClick={() => start(item)}>Bruk denne malen <span>↗</span></button></div></article>)}</div><button type="button" className="builder-empty-start" onClick={() => start()}>Start med tom side <span>→</span></button></section>;

  return <section className="builder-workspace builder-workspace--editor"><header className="builder-editor-header"><div><button type="button" className="builder-back" onClick={() => setTemplate(null)}>← Maler</button><span className="builder-label">VEDØY BUILDER / KLADD</span><h2>{draft.siteName}</h2></div><div className="builder-editor-actions"><span className={saved ? "builder-saved" : "builder-local"}><i />{saved ? "Lagret lokalt" : "Ikke publisert"}</span><button type="button" className="button button--ghost" onClick={saveDraft}>Lagre kladd</button><button type="button" className="button button--dark" disabled>Publiser via Hosting</button></div></header><div className="builder-editor-grid"><aside className="builder-editor-panel"><div className="builder-panel-heading"><div><small>INNHOLD</small><h3>Rediger siden</h3></div><span>02 / 02</span></div><label>Navn på nettside<input value={draft.siteName} onChange={(event) => update("siteName", event.target.value)} /></label><label>Overskrift<textarea rows={3} value={draft.headline} onChange={(event) => update("headline", event.target.value)} /></label><label>Introduksjon<textarea rows={4} value={draft.intro} onChange={(event) => update("intro", event.target.value)} /></label><label>Hovedknapp<input value={draft.cta} onChange={(event) => update("cta", event.target.value)} /></label><div className="builder-sections"><div className="builder-panel-heading"><div><small>SEKSJONER</small><h3>Hva skal vises?</h3></div></div>{(template.blocks.slice(1).concat(["FAQ", "Nyhetsbrev"])).map((section) => <label key={section} className="builder-section-toggle"><input type="checkbox" checked={draft.sections.includes(section)} onChange={() => toggleSection(section)} /><span>{section}</span><i>↗</i></label>)}</div><p className="builder-editor-note">Dette er en lokal forhåndsvisning. Database, domene og publisering kobles til Vedøy Hosting senere.</p></aside><div className="builder-preview"><div className="builder-preview__bar"><span><i /><i /><i /></span><small>FORHÅNDSVISNING · {template.name}</small><span>100%</span></div><div className="builder-preview__site"><nav><strong>{draft.siteName}</strong><div>{draft.sections.slice(0, 3).map((section) => <span key={section}>{section}</span>)}</div><button type="button">{draft.cta}</button></nav><section className="builder-preview__hero"><small>{template.type}</small><h1>{draft.headline}</h1><p>{draft.intro}</p><button type="button">{draft.cta} <span>↗</span></button></section><div className="builder-preview__blocks">{draft.sections.map((section, index) => <article key={section}><small>0{index + 1}</small><h3>{section}</h3><p>En tydelig seksjon som kan bygges ut med ditt innhold.</p></article>)}</div></div></div></div></section>;
}

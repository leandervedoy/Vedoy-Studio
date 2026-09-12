"use client";

import { FormEvent, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { BuilderPage, PageBlockType } from "@/lib/page-builder";

type ApiError = { error?: string };
const blockLabels: Record<PageBlockType, string> = { hero: "Hero", features: "Funksjoner", pricing: "Priser", contact: "Kontakt" };
const builderAgents = {
  vedi: { name: "Vedi · helhet", instructions: "prioriter tydelighet, tillit og et realistisk neste steg" },
  design: { name: "Designredaktør", instructions: "prioriter hierarki, rytme, tilgjengelighet og en sterk visuell retning" },
  growth: { name: "Vekststrateg", instructions: "prioriter målgruppe, konvertering, konkrete fordeler og tydelige CTA-er" },
  technical: { name: "Teknisk arkitekt", instructions: "prioriter funksjon, skalerbarhet, sikkerhet og innhold som kan bygges ordentlig" }
} as const;
type BuilderAgent = { name: string; instructions: string };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const data = await response.json().catch(() => ({})) as T & ApiError;
  if (!response.ok) throw new Error(data.error || "Noe gikk galt.");
  return data;
}

export function PageBuilderApp({ initialPages }: { initialPages: BuilderPage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [selectedId, setSelectedId] = useState(initialPages[0]?.id || "");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [prompt, setPrompt] = useState("");
  const [brief, setBrief] = useState({ business: "", audience: "", goal: "", style: "Vedøy Studio / mørk og tydelig" });
  const [allowPublish, setAllowPublish] = useState(false);
  const [agentKey, setAgentKey] = useState<keyof typeof builderAgents | "custom">("vedi");
  const [customAgent, setCustomAgent] = useState<BuilderAgent>({ name: "Min agent", instructions: "" });
  const [notice, setNotice] = useState("");
  const [version, setVersion] = useState(0);
  const selected = pages.find((page) => page.id === selectedId);
  const agent = agentKey === "custom" ? customAgent : builderAgents[agentKey];
  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/builder/chat",
    prepareSendMessagesRequest: ({ messages }) => ({ body: { messages, pageId: selectedId, allowPublish, agent } })
  }), [selectedId, allowPublish, agent]);
  const { messages, sendMessage, status, error } = useChat({ transport });

  async function refreshPages(selectId = selectedId) {
    const data = await api<{ pages: BuilderPage[] }>("/api/builder/pages");
    setPages(data.pages);
    setSelectedId(selectId || data.pages[0]?.id || "");
    setVersion((value) => value + 1);
  }

  async function createPage(event: FormEvent) {
    event.preventDefault();
    setNotice("");
    try {
      const data = await api<{ page: BuilderPage }>("/api/builder/pages", { method: "POST", body: JSON.stringify({ title, slug }) });
      setTitle(""); setSlug(""); setNotice("Utkast opprettet. Legg til en blokk eller be AI-en begynne.");
      await refreshPages(data.page.id);
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Kunne ikke opprette siden."); }
  }

  async function addBlock(type: PageBlockType) {
    if (!selected) return;
    setNotice("");
    try {
      await api("/api/builder/blocks", { method: "POST", body: JSON.stringify({ pageId: selected.id, type }) });
      setNotice(`${blockLabels[type]} er lagt til som utkast.`);
      await refreshPages(selected.id);
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Kunne ikke legge til blokk."); }
  }

  async function togglePublish() {
    if (!selected) return;
    const visibility = selected.visibility === "published" ? "draft" : "published";
    try {
      await api(`/api/builder/pages/${selected.id}`, { method: "PATCH", body: JSON.stringify({ visibility }) });
      setNotice(visibility === "published" ? "Siden er publisert." : "Siden er flyttet tilbake til utkast.");
      await refreshPages(selected.id);
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Kunne ikke endre publisering."); }
  }

  async function submitPrompt(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim() || !selected) return;
    setNotice("");
    const nextPrompt = prompt;
    setPrompt("");
    try {
      await sendMessage({ text: nextPrompt });
      await refreshPages(selected.id);
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "AI-forespørselen kunne ikke sendes."); }
  }

  async function generateFromBrief(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const { business, audience, goal, style } = brief;
    if (!business.trim() || !goal.trim()) {
      setNotice("Skriv minst hva virksomheten er og hva siden skal oppnå.");
      return;
    }
    const generatedPrompt = `Lag en komplett landingsside for ${business}. Målgruppe: ${audience || "ikke spesifisert"}. Mål: ${goal}. Visuell retning: ${style}. Opprett hero, funksjoner, priser og kontakt med norsk, konkret tekst. Dette er et utkast, så ikke publiser.`;
    setNotice("Co-Pilot setter sammen et strukturert utkast …");
    try {
      await sendMessage({ text: generatedPrompt });
      await refreshPages(selected.id);
      setNotice("Utkastet er oppdatert. Se forhåndsvisningen og finjuster videre.");
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Kunne ikke generere utkastet."); }
  }

  return <main className="builder-workbench">
    <aside className="builder-sidebar">
      <a href="/studio" className="builder-brand">VEDØY <span>BUILDER</span></a>
      <p className="builder-kicker">SIDER</p>
      <div className="builder-page-list">{pages.map((page) => <button key={page.id} onClick={() => setSelectedId(page.id)} className={page.id === selectedId ? "active" : ""}><strong>{page.title}</strong><small>/{page.slug} · {page.visibility === "published" ? "Live" : "Utkast"}</small></button>)}</div>
      <form className="builder-create" onSubmit={createPage}>
        <p>Ny side</p><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Sidetittel" required /><input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="url-navn (valgfritt)" /><button type="submit">+ Opprett utkast</button>
      </form>
    </aside>
      <section className="builder-editor">
      <header className="builder-editor-header"><div><p className="builder-kicker">VEDØY BYGGER GRUNNMUREN</p><h1>{selected ? selected.title : "Opprett første side"}</h1></div>{selected && <div className="builder-actions"><a href={`/${selected.slug}?preview=1`} target="_blank" rel="noreferrer">Åpne preview ↗</a><button onClick={togglePublish} className={selected.visibility === "published" ? "is-live" : ""}>{selected.visibility === "published" ? "● Live" : "Publiser side"}</button></div>}</header>
      {selected ? <><section className="builder-brief"><div><p className="builder-kicker">AI-GENERATOR</p><h2>Fra idé til landingsside.</h2><p>Beskriv virksomheten kort. Velg en agent som styrer hvordan utkastet blir tenkt og skrevet.</p><div className="builder-agent-picker"><label>Byggeragent<select value={agentKey} onChange={(event) => setAgentKey(event.target.value as keyof typeof builderAgents | "custom")}><option value="vedi">{builderAgents.vedi.name}</option><option value="design">{builderAgents.design.name}</option><option value="growth">{builderAgents.growth.name}</option><option value="technical">{builderAgents.technical.name}</option><option value="custom">+ Min egen agent</option></select></label>{agentKey === "custom" && <><input value={customAgent.name} onChange={(event) => setCustomAgent({ ...customAgent, name: event.target.value })} placeholder="Agentnavn" /><textarea value={customAgent.instructions} onChange={(event) => setCustomAgent({ ...customAgent, instructions: event.target.value })} placeholder="Hva skal agenten prioritere?" rows={3} /></>}</div></div><form onSubmit={generateFromBrief}><input value={brief.business} onChange={(event) => setBrief({ ...brief, business: event.target.value })} placeholder="Virksomhet eller konsept" required /><input value={brief.audience} onChange={(event) => setBrief({ ...brief, audience: event.target.value })} placeholder="Hvem siden er for" /><input value={brief.goal} onChange={(event) => setBrief({ ...brief, goal: event.target.value })} placeholder="Hva siden skal oppnå" required /><select value={brief.style} onChange={(event) => setBrief({ ...brief, style: event.target.value })}><option>Vedøy Studio / mørk og tydelig</option><option>Minimal og editorial</option><option>Varm og lokal</option><option>Teknologisk og fremoverlent</option></select><button type="submit" disabled={status !== "ready"}>Lag nettstedutkast ↗</button></form></section><section className="builder-block-controls"><div><p className="builder-kicker">BYGGEKLOSSER</p><h2>Legg til en seksjon</h2></div><div>{(Object.keys(blockLabels) as PageBlockType[]).map((type) => <button key={type} onClick={() => addBlock(type)}>+ {blockLabels[type]}</button>)}</div></section>
      <section className="builder-copilot"><div className="builder-copilot-title"><div><p className="builder-kicker">AI CO-PILOT</p><h2>Finjuster utkastet.</h2></div><span>{status === "streaming" || status === "submitted" ? "Arbeider …" : "Klar"}</span></div><p>Eksempel: «Lag en hero for en lokal frisør, med tydelig bestillingsknapp» eller «Oppdater overskriften i første blokk til …».</p><form onSubmit={submitPrompt}><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Hva vil du bygge eller endre?" rows={4} /><label><input type="checkbox" checked={allowPublish} onChange={(event) => setAllowPublish(event.target.checked)} /> Tillat publisering hvis jeg ber AI-en publisere</label><button type="submit" disabled={status !== "ready"}>Send til Co-Pilot ↗</button></form>{error && <p className="builder-error">{error.message}</p>}<div className="builder-chat">{messages.slice(-4).map((message) => <article key={message.id} className={message.role}>{message.parts.map((part, index) => <p key={index}>{part.type === "text" ? part.text : part.type.startsWith("tool-") ? "✓ Verktøy brukt: " + part.type.replace("tool-", "") : null}</p>)}</article>)}</div></section></> : <section className="builder-start"><h2>Start med en side.</h2><p>Opprett et utkast til venstre. Deretter lager du seksjoner manuelt eller med Co-Pilot.</p></section>}
      {notice && <p className="builder-notice">{notice}</p>}
    </section>
    <aside className="builder-preview"><div className="builder-preview-bar"><span>LIVE PREVIEW</span>{selected && <code>/{selected.slug}</code>}</div>{selected ? <iframe key={`${selected.id}-${version}`} title={`Forhåndsvisning av ${selected.title}`} src={`/${selected.slug}?preview=1&v=${version}`} /> : <div className="builder-preview-empty">Preview kommer her.</div>}</aside>
  </main>;
}

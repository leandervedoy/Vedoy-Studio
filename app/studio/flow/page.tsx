"use client";

import { useEffect, useMemo, useState } from "react";

type Module = {
  id: string;
  title: string;
  category: string;
  purpose: string;
  industries: string[];
  suggestedFor: string[];
};

const catalog: Module[] = [
  { id: "tasks", title: "Oppgaver og prosjektstyring", category: "Prosjekter", purpose: "Samle oppgaver, eiere, statuser og frister.", industries: ["all"], suggestedFor: ["Alle bedrifter"] },
  { id: "github", title: "GitHub-synkronisering", category: "Utvikling", purpose: "Koble saker, pull requests og prosjektstatus.", industries: ["software"], suggestedFor: ["Programvare og IT"] },
  { id: "quality", title: "Kvalitet og CI/CD", category: "Utvikling", purpose: "Følg tester, deploy og godkjenninger.", industries: ["software"], suggestedFor: ["Programvare og IT"] },
  { id: "onboarding", title: "Kundeonboarding", category: "Kunder", purpose: "Bruk sjekklister og milepæler ved oppstart.", industries: ["consulting", "retail"], suggestedFor: ["Konsulenttjenester", "Handel"] },
  { id: "approvals", title: "Godkjenningsflyt", category: "Drift", purpose: "Krev menneskelig godkjenning før sensitive endringer.", industries: ["all"], suggestedFor: ["Alle bedrifter"] },
  { id: "reports", title: "Rapporter og varsler", category: "Drift", purpose: "Lag faste rapporter uten generativ KI.", industries: ["all"], suggestedFor: ["Alle bedrifter"] },
  { id: "inventory", title: "Lager og bestillinger", category: "Handel", purpose: "Følg ordre, lagerstatus og oppgaver.", industries: ["retail"], suggestedFor: ["Handel"] },
  { id: "crm", title: "Salg og kunderelasjoner", category: "Kunder", purpose: "Koble kundearbeid til prosjekter og oppfølging.", industries: ["consulting", "retail"], suggestedFor: ["Konsulenttjenester", "Handel"] }
];

const storageKey = "vedoy-growth-flow-module-preferences-v1";
type Industry = "software" | "consulting" | "retail" | "other";
const industries: Record<Industry, string> = {
  software: "Programvare og IT",
  consulting: "Konsulent og tjenester",
  retail: "Handel og nettbutikk",
  other: "Annen virksomhet"
};
const defaults = ["tasks", "approvals", "reports"];

export default function FlowPage() {
  const [industry, setIndustry] = useState<Industry>("other");
  const [enabled, setEnabled] = useState<string[]>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { industry?: Industry; enabled?: string[] };
        if (parsed.industry && Object.hasOwn(industries, parsed.industry)) setIndustry(parsed.industry);
        if (Array.isArray(parsed.enabled)) setEnabled(parsed.enabled.filter(id => catalog.some(module => module.id === id)));
      }
    } catch { /* local preferences may be unavailable */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify({ industry, enabled })); } catch { /* preferences remain usable in this tab */ }
  }, [industry, enabled, loaded]);

  const recommended = useMemo(() => catalog.filter(module => module.industries.includes("all") || module.industries.includes(industry)), [industry]);
  const active = new Set(enabled);

  function toggle(id: string) {
    setEnabled(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
      <header>
        <small style={{ letterSpacing: ".15em" }}>VEDOY FLOW · MODULKATALOG</small>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: "8px 0" }}>Din virksomhet. Din arbeidsflyt.</h1>
        <p>Velg modulene som passer arbeidsdagen. Forslagene nedenfor er regelbaserte og behandler ingen bedriftsdata med KI.</p>
      </header>
      <section style={{ padding: 24, border: "1px solid var(--studio-border, #ddd)", borderRadius: 16 }}>
        <label htmlFor="flow-industry" style={{ display: "block", marginBottom: 10, fontWeight: 600 }}>Hva slags virksomhet arbeider du i?</label>
        <select id="flow-industry" value={industry} onChange={event => setIndustry(event.target.value as Industry)} style={{ padding: 12, borderRadius: 8, maxWidth: 360, width: "100%" }}>
          {Object.entries(industries).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
        <p style={{ marginTop: 12 }}>Anbefalt for {industries[industry]}: {recommended.map(module => module.title).join(", ")}.</p>
      </section>
      <section aria-labelledby="modules-title">
        <h2 id="modules-title">Velg moduler <small style={{ fontWeight: 400 }}>({enabled.length} valgt)</small></h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 14 }}>
          {catalog.map(module => (
            <article key={module.id} style={{ border: "1px solid var(--studio-border, #ddd)", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <small>{module.category}</small>
                {recommended.some(item => item.id === module.id) && <small>✦ Foreslått</small>}
              </div>
              <h3 style={{ margin: "12px 0 6px" }}>{module.title}</h3>
              <p style={{ minHeight: 52 }}>{module.purpose}</p>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={active.has(module.id)} onChange={() => toggle(module.id)} />
                {active.has(module.id) ? "Valgt i forhåndsvisning" : "Velg modul"}
              </label>
            </article>
          ))}
        </div>
      </section>
      <section style={{ padding: 24, border: "1px solid var(--studio-border, #ddd)", borderRadius: 16 }}>
        <h2>Flow AI</h2>
        <p>KI er av som standard. Når KI senere kobles til, må en administrator godkjenne bruk, datatilgang og konkrete endringer separat.</p>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" checked={aiConsent} onChange={event => setAiConsent(event.target.checked)} />
          Vis interesse for KI-anbefalinger (kun denne økten)
        </label>
        {aiConsent && <p role="status">KI er fortsatt ikke aktivert. Ingen opplysninger sendes til en KI-leverandør.</p>}
      </section>
      <p style={{ fontSize: 13, opacity: .8 }}>Forhåndsvisning: Moduler er ikke installert eller aktivert i backend. Utvalget lagres bare lokalt i nettleseren og påvirker ikke andre ansatte.</p>
    </div>
  );
}

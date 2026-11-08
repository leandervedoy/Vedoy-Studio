"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase";

type Membership = {
  organization_id: string;
  role: "employee" | "trustee" | "safety_rep" | "manager" | "owner";
  display_name: string;
};

type TrustCase = {
  id: string;
  lane: "trustee" | "safety" | "whistleblowing" | "workplace";
  title: string;
  status: string;
  severity: string;
  confidential: boolean;
  created_at: string;
};

type Incident = {
  id: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  created_at: string;
};

const lanes = [
  { id: "trustee", title: "Tillitsvalgt", text: "Fortrolig hjelp om arbeid, avtaler og rettigheter." },
  { id: "safety", title: "Verneombud", text: "Arbeidsmiljø, HMS, belastning og sikkerhet." },
  { id: "whistleblowing", title: "Varsling", text: "Alvorlige forhold med streng tilgangskontroll." },
  { id: "workplace", title: "Arbeidsplass", text: "Andre saker som trenger oppfølging." }
] as const;

export default function TrustPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [cases, setCases] = useState<TrustCase[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [message, setMessage] = useState("");
  const [lane, setLane] = useState<TrustCase["lane"]>("trustee");
  const [caseTitle, setCaseTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentCategory, setIncidentCategory] = useState("hms");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setSessionReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!userId) {
      setMembership(null);
      setCases([]);
      setIncidents([]);
      return;
    }
    void loadWorkspace();
  }, [userId]);

  async function loadWorkspace() {
    const { data: memberships } = await supabase
      .from("trust_memberships")
      .select("organization_id,role,display_name")
      .limit(1);

    const current = (memberships?.[0] as Membership | undefined) ?? null;
    setMembership(current);
    if (!current) return;

    const [{ data: caseRows }, { data: incidentRows }] = await Promise.all([
      supabase
        .from("trust_cases")
        .select("id,lane,title,status,severity,confidential,created_at")
        .eq("organization_id", current.organization_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("trust_incidents")
        .select("id,title,category,severity,status,created_at")
        .eq("organization_id", current.organization_id)
        .order("created_at", { ascending: false })
    ]);

    setCases((caseRows as TrustCase[] | null) ?? []);
    setIncidents((incidentRows as Incident[] | null) ?? []);
  }

  async function sendMagicLink(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    setMessage(error ? error.message : "Sjekk e-posten din. Innloggingslenken er sendt.");
  }

  async function createCase(event: FormEvent) {
    event.preventDefault();
    if (!membership || !userId) return;
    const { error } = await supabase.from("trust_cases").insert({
      organization_id: membership.organization_id,
      reporter_id: userId,
      lane,
      title: caseTitle,
      description: caseDescription,
      confidential: true
    });
    if (error) return setMessage(error.message);
    setCaseTitle("");
    setCaseDescription("");
    setMessage("Saken er opprettet.");
    await loadWorkspace();
  }

  async function createIncident(event: FormEvent) {
    event.preventDefault();
    if (!membership || !userId) return;
    const { error } = await supabase.from("trust_incidents").insert({
      organization_id: membership.organization_id,
      reporter_id: userId,
      title: incidentTitle,
      description: incidentDescription,
      category: incidentCategory
    });
    if (error) return setMessage(error.message);
    setIncidentTitle("");
    setIncidentDescription("");
    setMessage("Avviket er registrert.");
    await loadWorkspace();
  }

  if (!sessionReady) return <main className="center"><div className="loader">Vedøy Trust</div></main>;

  if (!userId) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <span className="brand">VEDØY <b>TRUST</b></span>
          <h1>Trygg hjelp på jobb.</h1>
          <p>Kontakt tillitsvalgt eller verneombud, meld HMS-avvik og finn viktige rettigheter på ett sted.</p>
          <form onSubmit={sendMagicLink}>
            <label>E-post på jobb<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="navn@bedrift.no" /></label>
            <button>Send trygg innloggingslenke</button>
          </form>
          {message && <p className="note">{message}</p>}
          <small>Vedøy-standard: enkelt språk, minst mulig data og tydelig tilgang.</small>
        </section>
      </main>
    );
  }

  if (!membership) {
    return (
      <main className="center">
        <section className="empty-card">
          <span className="brand">VEDØY <b>TRUST</b></span>
          <h1>Du er logget inn.</h1>
          <p>Brukeren din er ikke koblet til en arbeidsplass ennå. En eier eller administrator må invitere deg.</p>
          <button onClick={() => supabase.auth.signOut()}>Logg ut</button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside>
        <span className="brand">VEDØY <b>TRUST</b></span>
        <nav>
          <a href="#home">Oversikt</a>
          <a href="#case">Ny sak</a>
          <a href="#hms">HMS og avvik</a>
          <a href="#rights">Rettigheter</a>
        </nav>
        <div className="role"><small>DIN ROLLE</small><strong>{membership.role}</strong></div>
        <button className="ghost" onClick={() => supabase.auth.signOut()}>Logg ut</button>
      </aside>

      <section className="content" id="home">
        <header>
          <div><small>VEDØY WORKPLACE</small><h1>Hei {membership.display_name || "der"} 👋</h1></div>
          <span className="privacy">🔒 Fortrolige saker er tilgangsbegrenset</span>
        </header>

        <section className="hero">
          <div>
            <small>HVA TRENGER DU?</small>
            <h2>Riktig hjelp uten å lete.</h2>
            <p>Velg hvem saken gjelder. Trust bruker klare roller i stedet for å sende alt til ledelsen.</p>
          </div>
          <div className="lane-grid">
            {lanes.map((item) => (
              <button key={item.id} onClick={() => { setLane(item.id); location.hash = "case"; }}>
                <strong>{item.title}</strong><span>{item.text}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="grid-2">
          <article className="panel">
            <div className="panel-title"><div><small>MINE SAKER</small><h3>Oppfølging</h3></div><span>{cases.length}</span></div>
            <div className="list">
              {cases.slice(0, 5).map((item) => (
                <div key={item.id}><div><strong>{item.title}</strong><small>{item.lane} · {item.status}</small></div><em>{item.confidential ? "🔒" : "•"}</em></div>
              ))}
              {!cases.length && <p className="muted">Ingen saker ennå.</p>}
            </div>
          </article>
          <article className="panel" id="rights">
            <small>RETTIGHETER</small><h3>Forstå før du handler.</h3>
            <ul>
              <li>Hva gjør en tillitsvalgt?</li>
              <li>Når kontakter jeg verneombud?</li>
              <li>Hvordan fungerer varsling?</li>
              <li>Hva skjer etter at jeg melder et avvik?</li>
            </ul>
            <p className="muted">Vedøy Trust skal forklare prosessen, ikke late som den erstatter fagforening, advokat eller myndighet.</p>
          </article>
        </section>

        <section className="panel form-panel" id="case">
          <small>NY FORTROLIG SAK</small><h3>Fortell hva du trenger hjelp med</h3>
          <form onSubmit={createCase}>
            <div className="chips">
              {lanes.map((item) => <button type="button" className={lane === item.id ? "active" : ""} onClick={() => setLane(item.id)} key={item.id}>{item.title}</button>)}
            </div>
            <label>Tittel<input required minLength={3} maxLength={180} value={caseTitle} onChange={(e) => setCaseTitle(e.target.value)} placeholder="Kort og konkret" /></label>
            <label>Hva har skjedd?<textarea required minLength={3} maxLength={10000} value={caseDescription} onChange={(e) => setCaseDescription(e.target.value)} placeholder="Skriv bare det som er relevant." /></label>
            <button className="primary">Opprett fortrolig sak</button>
          </form>
        </section>

        <section className="grid-2" id="hms">
          <article className="panel form-panel">
            <small>HMS / AVVIK</small><h3>Meld fra mens du husker det</h3>
            <form onSubmit={createIncident}>
              <label>Kategori<select value={incidentCategory} onChange={(e) => setIncidentCategory(e.target.value)}>
                <option value="hms">HMS</option><option value="near_miss">Nestenulykke</option><option value="injury">Skade</option><option value="psychosocial">Psykososialt</option><option value="equipment">Utstyr</option><option value="other">Annet</option>
              </select></label>
              <label>Tittel<input required value={incidentTitle} onChange={(e) => setIncidentTitle(e.target.value)} /></label>
              <label>Beskrivelse<textarea required value={incidentDescription} onChange={(e) => setIncidentDescription(e.target.value)} /></label>
              <button className="primary">Registrer avvik</button>
            </form>
          </article>
          <article className="panel">
            <div className="panel-title"><div><small>STATUS</small><h3>Registrerte avvik</h3></div><span>{incidents.length}</span></div>
            <div className="list">
              {incidents.slice(0, 6).map((item) => <div key={item.id}><div><strong>{item.title}</strong><small>{item.category} · {item.status}</small></div><em>{item.severity}</em></div>)}
              {!incidents.length && <p className="muted">Ingen synlige avvik.</p>}
            </div>
          </article>
        </section>

        {message && <div className="toast">{message}</div>}
        <footer>Vedøy Trust · laget av Vedøy · trygghet før kompleksitet</footer>
      </section>
    </main>
  );
}

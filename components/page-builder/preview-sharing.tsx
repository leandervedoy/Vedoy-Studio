"use client";
import { useEffect, useState } from "react";

type Grant = { email: string; grantedAt: string; expiresAt: string };

export function PreviewSharing({ pageId, visibility }: { pageId: string; visibility: "draft" | "published" }) {
  const [email, setEmail] = useState("");
  const [days, setDays] = useState(7);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/builder/preview-access?pageId=${encodeURIComponent(pageId)}`, { cache: "no-store" })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Kunne ikke laste tilganger.")))
      .then(data => { if (active) setGrants(data.grants || []); })
      .catch(() => { if (active) setMessage("Kunne ikke lese delte tilganger. Er databasemigreringen kjørt?"); });
    return () => { active = false; };
  }, [pageId]);

  async function send(method: "POST" | "DELETE", recipient: string) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/builder/preview-access", {
        method, headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageId, email: recipient, days })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Tilgang kunne ikke endres.");
      setMessage(method === "POST" ? "Kunden kan nå teste utkastet etter innlogging." : "Tilgangen er fjernet.");
      const refresh = await fetch(`/api/builder/preview-access?pageId=${encodeURIComponent(pageId)}`, { cache: "no-store" });
      if (refresh.ok) setGrants((await refresh.json()).grants || []);
      if (method === "POST") setEmail("");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Ukjent feil.");
    } finally { setBusy(false); }
  }

  if (visibility !== "draft") return null;
  return <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, marginTop: 18 }}>
    <strong>Del privat utkast med kunde</strong>
    <p style={{ fontSize: 13 }}>Kun inviterte kontoer kan teste denne siden under /studio/previews. Opptil 30 dager.</p>
    <form onSubmit={event => { event.preventDefault(); void send("POST", email); }} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <input type="email" aria-label="Kundens e-post" required placeholder="kunde@bedrift.no" value={email} onChange={event => setEmail(event.target.value)} />
      <label>Gyldig i <select value={days} onChange={event => setDays(Number(event.target.value))}>
        <option value={1}>1 dag</option><option value={7}>7 dager</option><option value={14}>14 dager</option><option value={30}>30 dager</option>
      </select></label>
      <button type="submit" disabled={busy}>{busy ? "Lagrer …" : "Gi tilgang"}</button>
    </form>
    {message ? <p role="status">{message}</p> : null}
    {grants.length > 0 ? <ul>{grants.map(grant => <li key={grant.email} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <span>{grant.email} · til {new Date(grant.expiresAt).toLocaleDateString("nb-NO")}</span>
      <button type="button" disabled={busy} onClick={() => { void send("DELETE", grant.email); }}>Fjern</button>
    </li>)}</ul> : null}
  </section>;
}

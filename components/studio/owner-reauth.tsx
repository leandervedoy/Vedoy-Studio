"use client";

import { useState } from "react";
import { managerLoginPath } from "@/lib/vedoy-owner-access.mjs";

export function OwnerReauth() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function reauthenticate() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      if (!response.ok) throw new Error("Kunne ikke oppdatere sesjonen. Prøv igjen.");
      window.location.replace(managerLoginPath);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kunne ikke oppdatere sesjonen.");
      setBusy(false);
    }
  }
  return (
    <section className="vm vm-panel" style={{ maxWidth: 620, margin: "50px auto", padding: 32 }}>
      <span className="vm-muted">SIKKERHET · VEDØY LOGIN</span>
      <h1 style={{ fontSize: 30, margin: "14px 0" }}>Oppdater eierinnloggingen</h1>
      <p>Du har en eldre Studio-økt. For å åpne Vedøy Manager må eierkontoen bekreftes på nytt gjennom Vedøy Login.</p>
      <button className="vm-action" type="button" disabled={busy} onClick={() => void reauthenticate()}>
        {busy ? "Åpner innlogging …" : "Logg inn på nytt"}
      </button>
      {error && <p role="alert" className="vm-notice">{error}</p>}
    </section>
  );
}

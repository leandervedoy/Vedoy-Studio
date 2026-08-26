"use client";

import { useState } from "react";
import type { GrowthPreferences } from "@/lib/types";

export function GrowthSettings({ initialPreferences, emailConfigured }: { initialPreferences: GrowthPreferences; emailConfigured: boolean }) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key: keyof Omit<GrowthPreferences, "userEmail">) => setPreferences((current) => ({ ...current, [key]: !current[key] }));
  async function save() {
    setSaving(true); setMessage("");
    const response = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(preferences) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) { setPreferences(data.preferences); setMessage("Lagret"); } else setMessage(data.error || "Kunne ikke lagre.");
    setSaving(false);
  }
  return <section><div className="panel-heading"><div><small>VARSLER OG E-POST</small><h2>Hvordan vil du varsles?</h2></div><span className={emailConfigured ? "status-chip status-chip--confirmed" : "status-chip status-chip--pending"}>{emailConfigured ? "E-post klar" : "E-post ikke konfigurert"}</span></div><p className="settings-copy">Varsler i Growth virker nå. E-postinnstillinger lagres, men utsending krever en Resend-nøkkel og verifisert avsender.</p><div className="toggle-list settings-toggles"><label><span><strong>Varsler i Growth</strong><small>Nye henvendelser, bookinger og driftsmeldinger.</small></span><input type="checkbox" checked={preferences.inAppNotifications} onChange={() => update("inAppNotifications")} /></label><label><span><strong>Booking på e-post</strong><small>Bekreftelser og endringer når e-post er koblet til.</small></span><input type="checkbox" checked={preferences.emailBooking} onChange={() => update("emailBooking")} disabled={!emailConfigured} /></label><label><span><strong>Driftsmeldinger på e-post</strong><small>Feil, integrasjoner og viktige statusendringer.</small></span><input type="checkbox" checked={preferences.emailSystem} onChange={() => update("emailSystem")} disabled={!emailConfigured} /></label><label><span><strong>Daglig oppsummering</strong><small>En kort oversikt over neste steg og nye henvendelser.</small></span><input type="checkbox" checked={preferences.dailyDigest} onChange={() => update("dailyDigest")} disabled={!emailConfigured} /></label></div><div className="settings-actions"><button type="button" className="button button--dark" onClick={save} disabled={saving}>{saving ? "Lagrer …" : "Lagre varselinnstillinger"}</button><small aria-live="polite">{message}</small></div></section>;
}

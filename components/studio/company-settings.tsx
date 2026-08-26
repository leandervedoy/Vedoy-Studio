"use client";

import { useState } from "react";
import type { GrowthCompanyProfile } from "@/lib/types";

export function CompanySettings({ initialProfile }: { initialProfile: GrowthCompanyProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key: keyof GrowthCompanyProfile, value: string) => setProfile((current) => ({ ...current, [key]: value }));
  async function save() {
    setSaving(true); setMessage("");
    const response = await fetch("/api/company-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) { setProfile(data.profile); setMessage("Lagret"); } else setMessage(data.error || "Kunne ikke lagre.");
    setSaving(false);
  }
  return <section><div className="panel-heading"><div><small>VIRKSOMHET</small><h2>Grunninformasjon</h2></div></div><div className="settings-form-grid"><label><span>Virksomhetsnavn</span><input value={profile.name} onChange={(event) => update("name", event.target.value)} /></label><label><span>Organisasjonsnummer</span><input value={profile.organizationNumber} onChange={(event) => update("organizationNumber", event.target.value)} /></label><label><span>Sted</span><input value={profile.location} onChange={(event) => update("location", event.target.value)} /></label><label><span>Tidssone</span><select value={profile.timezone} onChange={(event) => update("timezone", event.target.value)}><option value="Europe/Oslo">Europe/Oslo</option></select></label><label className="full"><span>Kort beskrivelse</span><textarea rows={4} value={profile.description} onChange={(event) => update("description", event.target.value)} /></label></div><div className="settings-actions"><button className="button button--dark" type="button" onClick={save} disabled={saving}>{saving ? "Lagrer …" : "Lagre endringer"}</button><small aria-live="polite">{message}</small></div></section>;
}

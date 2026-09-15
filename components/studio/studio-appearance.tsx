"use client";

import { useState } from "react";

const defaults = { accent: "#b7ff26", surface: "#151a15", compact: false };

export function StudioAppearance() {
  const [settings, setSettings] = useState(defaults);
  const [message, setMessage] = useState("");
  function save() {
    localStorage.setItem("vedoy-studio-appearance", JSON.stringify(settings));
    window.dispatchEvent(new Event("vedoy-studio-appearance"));
    setMessage("Utseendet er lagret for denne virksomheten på denne enheten.");
  }
  return <section><div className="panel-heading"><div><small>MERKEVARE OG UTSEENDE</small><h2>Tilpass Studio</h2></div><span className="status-chip">BEDRIFTSTIL</span></div><p>Velg en aksentfarge og tetthet som passer arbeidsdagen. Struktur og funksjoner beholdes, slik at alle i teamet finner frem.</p><div className="settings-form-grid"><label><span>Aksentfarge</span><input type="color" value={settings.accent} onChange={(event) => setSettings({ ...settings, accent: event.target.value })} /></label><label><span>Panelbakgrunn</span><input type="color" value={settings.surface} onChange={(event) => setSettings({ ...settings, surface: event.target.value })} /></label><label className="full"><span><input type="checkbox" checked={settings.compact} onChange={(event) => setSettings({ ...settings, compact: event.target.checked })} /> Kompakt arbeidsflate</span></label></div><div className="settings-actions"><button className="button button--dark" type="button" onClick={save}>Lagre utseende</button><small aria-live="polite">{message}</small></div></section>;
}

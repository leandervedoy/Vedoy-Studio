"use client";
import { useEffect, useState } from "react";
import { aiFetch, aiBrowser } from "@/lib/vedoy-ai/browser";
import type { Locale } from "@/lib/vedoy-ai/types";

type Billing = { available: boolean; active: boolean; aiAvailable: boolean; amount?: number; currency?: string; interval?: string; intervalCount?: number };
export function AccountTools({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const [billing, setBilling] = useState<Billing | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { aiFetch<Billing>("/billing").then(setBilling).catch(() => setError(en ? "Could not load subscription status." : "Kunne ikke hente abonnementsstatus.")); }, [en]);
  async function checkout() {
    setBusy(true); setError("");
    try { const result = await aiFetch<{ url: string }>("/billing", { method: "POST" }); window.location.assign(result.url); }
    catch { setError(en ? "Billing is unavailable. Please try again later." : "Betaling er utilgjengelig. Prøv igjen senere."); setBusy(false); }
  }
  async function exportData() {
    setBusy(true); setError("");
    try {
      const data = await aiFetch("/export");
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a"); link.href = url; link.download = "vedoy-ai-export.json"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setError(en ? "Export failed." : "Eksporten mislyktes."); }
    finally { setBusy(false); }
  }
  return <section className="vai-settings" aria-label={en ? "Account" : "Konto"}>
    <h2>{en ? "Your account" : "Din konto"}</h2>
    {billing && <p>{billing.active ? (en ? "Active subscription · 50 messages per day" : "Aktivt abonnement · 50 meldinger per dag") : billing.available ? (en ? "Subscribe to use AI chat." : "Start abonnement for å bruke AI-samtaler.") : !billing.aiAvailable ? (en ? "AI chat is not available yet. You can manage your assistants." : "AI-samtaler er ikke tilgjengelige ennå. Du kan administrere assistentene dine.") : (en ? "Pilot · up to 50 messages per day" : "Pilot · opptil 50 meldinger per dag")}</p>}
    {billing?.available && <><p>{billing.amount != null && new Intl.NumberFormat(en ? "en-GB" : "nb-NO", { style: "currency", currency: billing.currency || "NOK" }).format(billing.amount / 100)} / {billing.intervalCount} {billing.interval}</p><button type="button" className="vai-primary" disabled={busy} onClick={checkout}>{billing.active ? (en ? "Manage subscription" : "Administrer abonnement") : (en ? "Subscribe" : "Start abonnement")}</button></>}
    <button type="button" className="vai-secondary" disabled={busy} onClick={exportData}>{en ? "Export my data" : "Eksporter mine data"}</button>
    <button type="button" className="vai-secondary" onClick={() => aiBrowser()?.auth.signOut()}>{en ? "Sign out" : "Logg ut"}</button>
    <p><a href="/privacy">{en ? "Privacy" : "Personvern"}</a> · <a href="/terms">{en ? "Terms" : "Vilkår"}</a> · <a href="/contact">{en ? "Support" : "Kundestøtte"}</a></p>
    {error && <p role="alert">{error}</p>}
  </section>;
}

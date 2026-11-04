"use client";

import { FormEvent, useEffect, useState } from "react";
import { track } from "@vercel/analytics";

const needs = [
  "Nettside", "Nettbutikk", "Webapp", "Vedøy Growth", "IT-hjelp",
  "Hosting og domene", "Shopify-app eller integrasjon",
  "Design og profil", "Profilprodukter", "Trykk og print",
  "Musiker og artist", "Kunstner og merch", "Prosjektprat",
] as const;

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [need, setNeed] = useState<string>("Nettside");
  const [attribution, setAttribution] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selected = params.get("need");
    if (selected && needs.some((item) => item === selected)) setNeed(selected);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "source"];
    setAttribution(Object.fromEntries(keys.map((key) => [key, params.get(key) || ""]).filter(([, value]) => value)));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setMessage("");
    const form = event.currentTarget;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setState("error");
        setMessage(result.error || "Kunne ikke sende forespørselen. Prøv igjen.");
        return;
      }
      form.reset();
      setState("sent");
      setMessage("Takk! Forespørselen er registrert. Vi tar kontakt for å avklare behov og avtale et passende tidspunkt.");
      try { track("studio_lead_submitted", { service: need, source: attribution.source || "direct" }); } catch { /* analytics must never block a lead */ }
    } catch {
      setState("error");
      setMessage("Det oppstod en nettverksfeil. Forespørselen kan ikke bekreftes. Prøv igjen eller kontakt oss på e-post.");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return <form className="contact-form" onSubmit={submit}>
    <label>Navn *<input name="name" required autoComplete="name" maxLength={100} /></label>
    <label>Bedrift<input name="company" autoComplete="organization" maxLength={120} /></label>
    <label>E-post *<input name="email" type="email" required autoComplete="email" maxLength={254} /></label>
    <label>Telefon (valgfritt)<input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
    <label className="full">Hva trenger du?
      <select name="need" value={need} onChange={(event) => setNeed(event.target.value)}>
        {needs.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
    <label className="full">Fortell kort hva du ønsker å få til
      <textarea name="message" rows={3} maxLength={3000} placeholder="For eksempel: Vi ønsker en mobilvennlig nettside med tydelige tjenester og kontaktskjema." />
    </label>
    {Object.entries(attribution).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
    <input type="hidden" name="landing_page" value={typeof window === "undefined" ? "" : window.location.pathname} />
    <label className="form-honeypot" aria-hidden="true">Nettside<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <button className="editorial-button" type="submit" disabled={state === "sending"}>
      {state === "sending" ? "Sender …" : "Be om uforpliktende tilbud →"}
    </button>
    <small>Ingen betaling eller avtale ved innsending. <a href="/privacy">Personvern</a> · <a href="/terms">Vilkår</a></small>
    {message ? <p className={"form-feedback form-feedback--" + state} role="status" aria-live="polite">{message}</p> : null}
  </form>;
}

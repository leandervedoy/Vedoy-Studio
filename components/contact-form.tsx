"use client";

import { FormEvent, useEffect, useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [attribution, setAttribution] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    setAttribution(Object.fromEntries(keys.map((key) => [key, params.get(key) || ""]).filter(([, value]) => value)));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = event.currentTarget;
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setState("error");
      setMessage(result.error || "Noe gikk galt.");
      return;
    }
    form.reset();
    setState("sent");
    setMessage("Takk! Forespørselen er lagret. Vi tar kontakt så snart vi kan.");
  }

  return <form className="contact-form" onSubmit={submit}>
    <label>Navn *<input name="name" required maxLength={100} /></label><label>Bedrift<input name="company" maxLength={120} /></label>
    <label>E-post *<input name="email" type="email" required maxLength={254} /></label><label>Telefon<input name="phone" maxLength={40} /></label>
    <label className="full">Hva trenger du?<select name="need"><option>Nettside</option><option>Webapp</option><option>Nettbutikk</option><option>Shopify-app eller integrasjon</option><option>Hosting og domene</option><option>Design og profil</option><option>Profilprodukter</option><option>Trykk og print</option><option>Musiker og artist</option><option>Kunstner og merch</option></select></label>
    <label className="full">Fortell litt om prosjektet<textarea name="message" rows={4} maxLength={3000} /></label>
    {Object.entries(attribution).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
    <input type="hidden" name="landing_page" value={typeof window === "undefined" ? "" : window.location.pathname} />
    <label className="form-honeypot" aria-hidden="true">Nettside<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <button className="editorial-button" type="submit" disabled={state === "sending"}>{state === "sending" ? "Lagrer …" : "Send forespørsel →"}</button>
    <small>Lagres sikkert i Studio. <a href="/privacy">Personvern</a> · <a href="/terms">Vilkår</a></small>
    {message ? <p className={`form-feedback form-feedback--${state}`} role="status">{message}</p> : null}
  </form>;
}

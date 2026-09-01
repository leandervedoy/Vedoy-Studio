"use client";

import { useMemo, useState } from "react";
import { calculateHostingPrice, ramOptions, regionOptions, storageOptions, type DomainMode, type HostingSelection } from "@/lib/hosting-catalog";
import type { DomainSearchResult } from "@/lib/types";

type Props = {
  initialDomain?: string;
  initialDomainMode?: "new" | "existing";
  domainProviderReady: boolean;
};

const nok = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 });

export function HostingConfigurator({ initialDomain = "", initialDomainMode = "existing", domainProviderReady }: Props) {
  const startingDomainMode: DomainMode = initialDomain ? initialDomainMode : "none";
  const [selection, setSelection] = useState<HostingSelection>({ serverCount: 1, ramGb: 8, storageGb: 160, region: "hel1", backups: true, domainMode: startingDomainMode, domain: initialDomain });
  const [domainInput, setDomainInput] = useState(initialDomain);
  const [domainQuote, setDomainQuote] = useState<DomainSearchResult | null>(null);
  const [domainMessage, setDomainMessage] = useState("");
  const [checkingDomain, setCheckingDomain] = useState(false);
  const [requestState, setRequestState] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [customer, setCustomer] = useState({ name: "", company: "", email: "", phone: "", details: "" });
  const price = useMemo(() => calculateHostingPrice(selection), [selection]);

  function update<K extends keyof HostingSelection>(key: K, value: HostingSelection[K]) {
    setSelection((current) => ({ ...current, [key]: value }));
  }

  function updateCustomer(key: keyof typeof customer, value: string) {
    setCustomer((current) => ({ ...current, [key]: value }));
  }

  function chooseDomainMode(mode: DomainMode) {
    setDomainQuote(null);
    setDomainMessage("");
    setSelection((current) => ({ ...current, domainMode: mode, domain: mode === "none" ? undefined : domainInput }));
  }

  async function checkDomain() {
    setCheckingDomain(true);
    setDomainMessage("");
    setDomainQuote(null);
    try {
      const response = await fetch(`/api/domains/search?query=${encodeURIComponent(domainInput)}`);
      const data = await response.json() as { results?: DomainSearchResult[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Kunne ikke kontrollere domenet.");
      const exact = data.results?.find((result) => result.domain === domainInput.trim().toLowerCase()) ?? data.results?.[0];
      if (!exact) throw new Error("Fant ingen domenestatus.");
      setDomainQuote(exact);
      setDomainInput(exact.domain);
      update("domain", exact.domain);
      setDomainMessage(exact.available ? `${exact.domain} ser ledig ut for ${nok.format(exact.annualPriceNok)} første år. Vi kjøper det ikke automatisk.` : `${exact.domain} er opptatt. Prøv et annet navn.`);
    } catch (reason) {
      setDomainMessage(reason instanceof Error ? reason.message : "Kunne ikke kontrollere domenet.");
    } finally {
      setCheckingDomain(false);
    }
  }

  async function submitRequest() {
    setError("");
    if (!accepted) return setError("Du må godkjenne vilkårene før du fortsetter.");
    if (customer.name.trim().length < 2) return setError("Skriv inn navn på kontaktpersonen.");
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) return setError("E-postadressen ser ikke riktig ut.");
    if (selection.domainMode !== "none" && !selection.domain?.trim()) return setError("Skriv inn domenet som skal flyttes, kobles til eller vurderes.");
    setRequestState("loading");
    try {
      const response = await fetch("/api/hosting-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...selection, ...customer, accepted: true })
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Forespørselen kunne ikke lagres.");
      setRequestState("sent");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Forespørselen kunne ikke lagres.");
      setRequestState("idle");
    }
  }

  return (
    <section className="hosting-configurator" id="konfigurer-hosting">
      <div className="hosting-configurator__heading">
        <p className="editorial-kicker lime">KONFIGURER LØSNINGEN</p>
        <h2>Bygg riktig<br /><em>kapasitet.</em></h2>
        <p>Dette er en uforpliktende forespørsel. Hosting og domene blir aldri kjøpt eller registrert automatisk fra dette skjemaet. Vi går gjennom behov, pris og levering med deg først.</p>
      </div>

      <div className="hosting-configurator__panel">
        <fieldset className="config-block">
          <legend>01 · Servere</legend>
          <div className="server-count-control"><button type="button" onClick={() => update("serverCount", Math.max(1, selection.serverCount - 1))} aria-label="Færre servere">−</button><strong>{selection.serverCount}</strong><span>{selection.serverCount === 1 ? "server" : "servere"}</span><button type="button" onClick={() => update("serverCount", Math.min(5, selection.serverCount + 1))} aria-label="Flere servere">+</button></div>
        </fieldset>

        <fieldset className="config-block">
          <legend>02 · RAM per server</legend>
          <div className="config-options">{ramOptions.map((option) => <button type="button" className={selection.ramGb === option.value ? "is-selected" : ""} onClick={() => update("ramGb", option.value)} key={option.value}><strong>{option.label}</strong><span>{option.use}</span><small>{nok.format(option.monthlyNok)} / mnd.</small></button>)}</div>
        </fieldset>

        <fieldset className="config-block">
          <legend>03 · Lagring per server</legend>
          <div className="config-options config-options--compact">{storageOptions.map((option) => <button type="button" className={selection.storageGb === option.value ? "is-selected" : ""} onClick={() => update("storageGb", option.value)} key={option.value}><strong>{option.label}</strong><small>{option.monthlyNok ? `+ ${nok.format(option.monthlyNok)} / mnd.` : "Inkludert"}</small></button>)}</div>
        </fieldset>

        <fieldset className="config-block">
          <legend>04 · Region og drift</legend>
          <div className="config-options config-options--compact">{regionOptions.map((option) => <button type="button" className={selection.region === option.value ? "is-selected" : ""} onClick={() => update("region", option.value)} key={option.value}><strong>{option.label}</strong><small>{option.detail}</small></button>)}</div>
          <label className="config-check"><input type="checkbox" checked={selection.backups} onChange={(event) => update("backups", event.target.checked)} /><span><strong>Daglig backup</strong><small>+ {nok.format(149)} per server / mnd.</small></span></label>
        </fieldset>

        <fieldset className="config-block">
          <legend>05 · Domene</legend>
          <div className="domain-mode-options">
            <label><input type="radio" name="domainMode" checked={selection.domainMode === "none"} onChange={() => chooseDomainMode("none")} /><span>Uten domene nå</span></label>
            <label><input type="radio" name="domainMode" checked={selection.domainMode === "existing"} onChange={() => chooseDomainMode("existing")} /><span>Jeg har et domene</span></label>
            <label><input type="radio" name="domainMode" checked={selection.domainMode === "new"} onChange={() => chooseDomainMode("new")} /><span>Vurder nytt domene</span></label>
          </div>
          {selection.domainMode !== "none" ? <div className="domain-config-row"><input value={domainInput} onChange={(event) => { setDomainInput(event.target.value); update("domain", event.target.value); setDomainQuote(null); }} placeholder="bedriften.no" aria-label="Domenenavn" />{selection.domainMode === "new" ? <button type="button" onClick={checkDomain} disabled={checkingDomain}>{checkingDomain ? "Sjekker …" : "Sjekk domene"}</button> : null}</div> : null}
          {domainMessage ? <p className={domainQuote?.available ? "config-success" : "config-message"} role="status">{domainMessage}</p> : null}
          <p className="config-message">{domainProviderReady ? "Domenestatus kan forhåndssjekkes. En eventuell registrering krever alltid manuell bekreftelse og separat avtale." : "Domenesøk er ikke koblet til registrar ennå. Vi kan fortsatt lagre ønsket og kontrollere det manuelt."}</p>
        </fieldset>

        <fieldset className="config-block config-block--customer">
          <legend>06 · Kontakt</legend>
          <div className="config-customer-grid">
            <label>Navn *<input value={customer.name} onChange={(event) => updateCustomer("name", event.target.value)} autoComplete="name" /></label>
            <label>Bedrift<input value={customer.company} onChange={(event) => updateCustomer("company", event.target.value)} autoComplete="organization" /></label>
            <label>E-post *<input type="email" value={customer.email} onChange={(event) => updateCustomer("email", event.target.value)} autoComplete="email" /></label>
            <label>Telefon<input value={customer.phone} onChange={(event) => updateCustomer("phone", event.target.value)} autoComplete="tel" /></label>
            <label className="config-customer-grid__full">Behov eller spørsmål<textarea value={customer.details} onChange={(event) => updateCustomer("details", event.target.value)} rows={4} placeholder="Fortell kort hva du skal hoste eller flytte." /></label>
          </div>
        </fieldset>

        <aside className="config-summary">
          <div><span>Estimert månedlig</span><strong>{nok.format(price.monthlyNok)}</strong><small>eks. mva. · kun prisanslag</small></div>
          <dl><div><dt>{selection.serverCount} × {selection.ramGb} GB RAM</dt><dd>{nok.format(price.perServerNok * selection.serverCount)}</dd></div><div><dt>Etablering, estimat</dt><dd>{nok.format(price.setupNok)}</dd></div>{selection.domainMode === "new" && domainQuote?.available ? <div><dt>{domainQuote.domain} · første år</dt><dd>{nok.format(domainQuote.annualPriceNok)}</dd></div> : null}</dl>
          <p className="hosting-manual-notice"><strong>Viktig:</strong> Dette sender en forespørsel til Vedøy. Det trekkes ingen betaling, og ingen hosting eller domene kjøpes automatisk.</p>
          <label className="config-terms"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>Jeg ber om et tilbud og godkjenner <a href="/terms" target="_blank" rel="noreferrer">bestillingsvilkårene</a> og <a href="/privacy" target="_blank" rel="noreferrer">personvernet</a>.</span></label>
          {error ? <p className="config-error" role="alert">{error}</p> : null}
          {requestState === "sent" ? <p className="hosting-request-success" role="status"><strong>Forespørselen er lagret.</strong><br />Vi kontakter deg med avklaring og eventuelt tilbud. Ingenting er kjøpt eller registrert automatisk.</p> : <button type="button" className="config-checkout" onClick={submitRequest} disabled={requestState === "loading"}>{requestState === "loading" ? "Lagrer forespørsel …" : "Send bestillingsforespørsel →"}</button>}
          <small>Betaling kan eventuelt avtales senere. Kortinformasjon samles ikke inn her.</small>
        </aside>
      </div>
    </section>
  );
}

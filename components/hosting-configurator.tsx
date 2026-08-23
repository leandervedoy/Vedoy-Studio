"use client";

import { useMemo, useState } from "react";
import { calculateHostingPrice, ramOptions, regionOptions, storageOptions, type DomainMode, type HostingSelection } from "@/lib/hosting-catalog";
import type { DomainSearchResult } from "@/lib/types";

type Props = {
  initialDomain?: string;
  initialDomainMode?: "new" | "existing";
  stripeMode: "live" | "test" | "unavailable";
  domainProviderReady: boolean;
};

const nok = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 });

export function HostingConfigurator({ initialDomain = "", initialDomainMode = "existing", stripeMode, domainProviderReady }: Props) {
  const startingDomainMode: DomainMode = initialDomain ? initialDomainMode : "none";
  const [selection, setSelection] = useState<HostingSelection>({ serverCount: 1, ramGb: 8, storageGb: 160, region: "hel1", backups: true, domainMode: startingDomainMode, domain: initialDomain });
  const [domainInput, setDomainInput] = useState(initialDomain);
  const [domainQuote, setDomainQuote] = useState<DomainSearchResult | null>(null);
  const [domainMessage, setDomainMessage] = useState("");
  const [checkingDomain, setCheckingDomain] = useState(false);
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const price = useMemo(() => calculateHostingPrice(selection), [selection]);

  function update<K extends keyof HostingSelection>(key: K, value: HostingSelection[K]) {
    setSelection((current) => ({ ...current, [key]: value }));
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
      setDomainMessage(exact.available ? `${exact.domain} er ledig for ${nok.format(exact.annualPriceNok)} første år.` : `${exact.domain} er opptatt. Prøv et annet navn.`);
    } catch (reason) {
      setDomainMessage(reason instanceof Error ? reason.message : "Kunne ikke kontrollere domenet.");
    } finally {
      setCheckingDomain(false);
    }
  }

  async function checkout() {
    setError("");
    if (!accepted) return setError("Du må godkjenne vilkårene før du fortsetter.");
    if (selection.domainMode === "new" && (!domainQuote?.available || domainQuote.domain !== selection.domain)) return setError("Kontroller og velg et ledig domene først.");
    if (selection.domainMode === "existing" && !selection.domain) return setError("Skriv inn domenet som skal flyttes eller kobles til.");
    setCheckoutState("loading");
    try {
      const response = await fetch("/api/checkout/hosting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(selection) });
      const data = await response.json() as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "Betalingen kunne ikke startes.");
      window.location.assign(data.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Betalingen kunne ikke startes.");
      setCheckoutState("idle");
    }
  }

  return (
    <section className="hosting-configurator" id="konfigurer-hosting">
      <div className="hosting-configurator__heading">
        <p className="editorial-kicker lime">KONFIGURER LØSNINGEN</p>
        <h2>Bygg riktig<br /><em>kapasitet.</em></h2>
        <p>Alle priser beregnes og valideres på nytt på serveren før Stripe åpnes. Prisene under er eks. mva.</p>
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
            <label className={!domainProviderReady ? "is-disabled" : ""}><input type="radio" name="domainMode" checked={selection.domainMode === "new"} onChange={() => chooseDomainMode("new")} disabled={!domainProviderReady} /><span>Kjøp nytt domene</span></label>
          </div>
          {selection.domainMode !== "none" ? <div className="domain-config-row"><input value={domainInput} onChange={(event) => { setDomainInput(event.target.value); update("domain", event.target.value); setDomainQuote(null); }} placeholder="bedriften.no" aria-label="Domenenavn" />{selection.domainMode === "new" ? <button type="button" onClick={checkDomain} disabled={checkingDomain}>{checkingDomain ? "Sjekker …" : "Sjekk domene"}</button> : null}</div> : null}
          {domainMessage ? <p className={domainQuote?.available ? "config-success" : "config-message"} role="status">{domainMessage}</p> : null}
          {!domainProviderReady ? <p className="config-message">Nye domenekjøp åpnes når Vercel Registrar-nøkkelen er lagt til. Eksisterende domener og hosting kan fortsatt bestilles.</p> : null}
        </fieldset>

        <aside className="config-summary">
          <div><span>Månedlig</span><strong>{nok.format(price.monthlyNok)}</strong><small>eks. mva. · faktureres månedlig</small></div>
          <dl><div><dt>{selection.serverCount} × {selection.ramGb} GB RAM</dt><dd>{nok.format(price.perServerNok * selection.serverCount)}</dd></div><div><dt>Etablering</dt><dd>{nok.format(price.setupNok)}</dd></div>{selection.domainMode === "new" && domainQuote?.available ? <div><dt>{domainQuote.domain} · første år</dt><dd>{nok.format(domainQuote.annualPriceNok)}</dd></div> : null}</dl>
          <label className="config-terms"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>Jeg bestiller på vegne av en virksomhet og godkjenner <a href="/terms" target="_blank" rel="noreferrer">bestillingsvilkårene</a>, <a href="/privacy" target="_blank" rel="noreferrer">personvernet</a> og månedlig fakturering.</span></label>
          {stripeMode === "test" ? <p className="stripe-mode">TESTMODUS · Stripe-sandbox er koblet til. Ingen ekte belastning skjer før kontoen aktiveres.</p> : null}
          {stripeMode === "unavailable" ? <p className="config-error">Stripe er ikke konfigurert i dette miljøet.</p> : null}
          {error ? <p className="config-error" role="alert">{error}</p> : null}
          <button type="button" className="config-checkout" onClick={checkout} disabled={checkoutState === "loading" || stripeMode === "unavailable"}>{checkoutState === "loading" ? "Åpner Stripe …" : stripeMode === "test" ? "Åpne sikker testbetaling ↗" : "Gå til sikker betaling ↗"}</button>
          <small>Betaling håndteres av Stripe. Vi lagrer aldri kortinformasjon.</small>
        </aside>
      </div>
    </section>
  );
}

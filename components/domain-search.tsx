"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { DomainSearchResult } from "@/lib/types";
import { formatNok } from "@/lib/utils";

export function DomainSearch({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DomainSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/domains/search?query=${encodeURIComponent(query)}`);
      const data = await response.json() as { results?: DomainSearchResult[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Kunne ikke søke.");
      setResults(data.results ?? []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Noe gikk galt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "domain-search domain-search--compact" : "domain-search"}>
      <form onSubmit={submit} className="domain-search__form">
        <span aria-hidden>⌕</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Søk etter ditt neste domene"
          aria-label="Domenenavn"
          minLength={2}
          required
        />
        <button className="button button--dark" disabled={loading}>{loading ? "Søker …" : "Søk"}</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {results.length > 0 && (
        <div className="domain-results" aria-live="polite">
          {results.map((result) => (
            <article key={result.domain} className="domain-result">
              <div>
                <strong>{result.domain}</strong>
                <span className={result.available ? "availability is-available" : "availability is-taken"}>
                  {result.available ? "Ledig" : "Opptatt"}
                </span>
              </div>
              <div className="domain-result__price">
                {result.available ? <>
                  <strong>{formatNok(result.annualPriceNok)}</strong>
                  <small>/ første år</small>
                  <Link className="button button--small" href={`/tjenester/hosting-og-domene?domain=${encodeURIComponent(result.domain)}&domainMode=new#konfigurer-hosting`}>Velg</Link>
                </> : <button className="button button--small button--ghost" type="button">Se alternativer</button>}
              </div>
            </article>
          ))}
          <p className="demo-disclaimer">Tilgjengelighet og leverandørpris kontrolleres mot Vercel Registrar når søket utføres.</p>
        </div>
      )}
    </div>
  );
}

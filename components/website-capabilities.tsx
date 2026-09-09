"use client";

import { useState } from "react";

const websiteSimple = ["Tydelig struktur og navigasjon", "Responsivt design for mobil og desktop", "Kontaktskjema og tydelige knapper", "Grunnleggende SEO og Google-klargjøring", "Publisering og opplæring"];
const websiteDetailed = ["Next.js, React og TypeScript", "Ytelse, Core Web Vitals og bildeoptimalisering", "Tilgjengelighet og semantisk HTML", "SEO-metadata, sitemap og strukturert data", "CMS, API-er, booking, betaling og analyse ved behov", "Sikker drift, miljøvariabler, logging og backup"];

type ServiceCapabilitiesProps = {
  title: string;
  slug: string;
  simple: string[];
  detailed: string[];
};

export function ServiceCapabilities({ title, slug, simple, detailed }: ServiceCapabilitiesProps) {
  const [mode, setMode] = useState<"simple" | "nerd">("simple");
  const isWebsite = slug === "nettsider";
  const items = mode === "simple" ? (isWebsite ? websiteSimple : simple) : (isWebsite ? websiteDetailed : detailed);
  return <section className="website-capabilities"><div className="website-capabilities__heading"><div><p className="editorial-kicker lime">{title.toLocaleUpperCase("nb-NO")} · FUNKSJONER</p><h2>{isWebsite ? <>Forklart på<br /><em>ditt nivå.</em></> : <>Dette kan<br /><em>vi hjelpe med.</em></>}</h2></div><div><p>{isWebsite ? "Vi kan starte enkelt og bygge videre når bedriften trenger mer. Velg den versjonen som passer deg." : "Få først en rask oversikt, eller åpne den detaljerte visningen for fagområder og muligheter i leveransen."}</p><div className="website-capabilities__switch" role="tablist" aria-label={`Velg detaljnivå for ${title}`}><button type="button" className={mode === "simple" ? "is-active" : ""} onClick={() => setMode("simple")} role="tab" aria-selected={mode === "simple"}>Lett versjon</button><button type="button" className={mode === "nerd" ? "is-active" : ""} onClick={() => setMode("nerd")} role="tab" aria-selected={mode === "nerd"}>{isWebsite ? "Nerdeversjon" : "Mer detaljert"}</button></div></div></div><div className="website-capabilities__list">{items.map((item, index) => <article key={item}><small>{String(index + 1).padStart(2, "0")}</small><span>{item}</span></article>)}</div><p className="website-capabilities__note">Ikke alt trenger å være med fra start. Vi anbefaler innhold og omfang ut fra mål, budsjett og hvem som skal bruke løsningen.</p></section>;
}

"use client";

import { useState } from "react";

type DemoContent = { eyebrow: string; title: string; description: string; cards: { label: string; value: string; note: string }[]; locked?: boolean; lockReason?: string };
type DemoNavItem = { label: string; icon: string };
const studioMenu: { label: string; items: DemoNavItem[] }[] = [
  { label: "Oversikt", items: [{ label: "Dashboard", icon: "⌂" }, { label: "Team", icon: "◌" }, { label: "Bedriftsoppsett", icon: "✦" }] },
  { label: "Bygg", items: [{ label: "Tjenester", icon: "≡" }, { label: "Domener", icon: "◎" }, { label: "Hosting og prosjekter", icon: "△" }, { label: "Nettsidebygger", icon: "▦" }] },
  { label: "Drift", items: [{ label: "Henvendelser", icon: "✦" }, { label: "Vedøy Canvas", icon: "▤" }, { label: "Timeregistrering", icon: "◷" }, { label: "Booking", icon: "□" }, { label: "Kunder og CRM", icon: "◉" }, { label: "E-post", icon: "✉" }, { label: "Vedøy Assist", icon: "☺" }] },
  { label: "Voks", items: [{ label: "Statistics", icon: "↗" }, { label: "Vedøy News", icon: "▤" }, { label: "Konto og profil", icon: "◎" }, { label: "Vedi AI", icon: "✦" }, { label: "Academy", icon: "◇" }] },
  { label: "Utvikle", items: [{ label: "API og nøkler", icon: "{}" }, { label: "Databaser", icon: "◫" }, { label: "Overvåkning", icon: "⌁" }] }
];

const lockedDemoItems = new Set([
  "Bedriftsoppsett", "Tjenester", "Domener", "Nettsidebygger", "E-post",
  "Vedi AI", "API og nøkler", "Databaser", "Overvåkning"
]);

const previewCopy: Record<string, { title: string; description: string }> = {
  Team: { title: "Et team med oversikt.", description: "Inviter kollegaer, se roller og samle ansvar uten å bruke ekte persondata." },
  Bedriftsoppsett: { title: "Grunnmuren settes én gang.", description: "Her settes virksomhet, abonnement, teamgrenser og integrasjoner opp av administrator." },
  Tjenester: { title: "Bygg tilbudet på deres måte.", description: "Opprett og organiser tjenester med riktig innhold, pris og synlighet for virksomheten." },
  Domener: { title: "Samle domenene på ett sted.", description: "Se domenevalg, status og forespørsler før de håndteres hos en domeneleverandør." },
  Nettsidebygger: { title: "Fra idé til tydelig utkast.", description: "Vedøy bygger grunnmuren. Kunden kan se og gi tilbakemelding før noe publiseres." },
  Henvendelser: { title: "Ingen forespørsel forsvinner.", description: "Samle bestillinger, spørsmål og oppfølging i en enkel arbeidsflyt." },
  Timeregistrering: { title: "Tiden blir synlig.", description: "Registrer arbeid, knytt det til prosjekt og få en roligere oversikt over kapasiteten." },
  Booking: { title: "En enklere vei til møte.", description: "Vis ledige tider og hold oversikt over avtalene uten å blande dem med private kalenderdata." },
  "E-post": { title: "E-post med kontroll.", description: "Koble en bedriftsadresse når dere er klare, og hold postboksen og leverandørinnstillinger trygge." },
  "Vedøy Assist": { title: "Hjelp når teknologi blir tungt.", description: "Se hvordan KI og menneskelig IT-hjelp kan kombineres i en trygg kundereise." },
  Statistics: { title: "Se mønstre, ikke bare tall.", description: "Få en enkel oversikt over trafikk, henvendelser og arbeid som kan hjelpe dere å velge neste steg." },
  "Vedøy News": { title: "Del det som skjer.", description: "Lag utkast til oppdateringer, artikler og lanseringer. Administrator publiserer når innholdet er klart." },
  "Konto og profil": { title: "Profilen, på deres premisser.", description: "Se hvor navn, bilde, språk og personlige innstillinger ligger uten å åpne en ekte konto." },
  "Vedi AI": { title: "En KI med tydelige rammer.", description: "Vedi kan hjelpe med utkast og struktur, men får aldri fritt spillerom med kostnader eller sensitive data." },
  Academy: { title: "Lær mens dere gjør.", description: "Korte, praktiske kurs for teamet — med trygg trening før oppgaver gjøres på ordentlig." },
  "API og nøkler": { title: "Integrasjoner med ansvar.", description: "Her organiseres API-tilganger uten at nøkler, innstillinger eller tekniske hemmeligheter vises i demoen." },
  Databaser: { title: "Data med tydelige grenser.", description: "Se status og struktur uten tilgang til kundedata, tilkoblingsstrenger eller reelle tabeller." },
  Overvåkning: { title: "Oppdag problemer tidlig.", description: "Følg status for nettsider og tjenester når overvåkning er aktivert for virksomheten." }
};

const content: Record<string, DemoContent> = {
  Dashboard: {
    eyebrow: "DEMO · VEDØY STUDIO",
    title: "Én plass for neste steg.",
    description: "Se hvordan prosjekter, kunder, timer og oppfølging kan samles uten å legge inn ekte data.",
    cards: [{ label: "AKTIVE PROSJEKTER", value: "03", note: "Eksempeltall" }, { label: "ÅPNE HENVENDELSER", value: "06", note: "Eksempeltall" }, { label: "DENNE UKEN", value: "12 t", note: "Eksempeltall" }]
  },
  "Hosting og prosjekter": {
    eyebrow: "DEMO · PROSJEKTER",
    title: "Arbeidet, uten støy.",
    description: "Følg leveranser, teknisk status og neste steg fra ett rolig arbeidsområde.",
    cards: [{ label: "PÅGÅR", value: "02", note: "Nettside og app" }, { label: "KLAR FOR GJENNOMGANG", value: "01", note: "Demo-prosjekt" }, { label: "OPPETID", value: "99,9%", note: "Eksempeltall" }]
  },
  "Kunder og CRM": {
    eyebrow: "DEMO · KUNDER OG CRM",
    title: "Følg opp det som betyr noe.",
    description: "Samle kundeinnsikt, oppgaver og henvendelser uten å dele kundedata mellom virksomheter.",
    cards: [{ label: "KUNDEKORT", value: "08", note: "Eksempeltall" }, { label: "TIL OPPFØLGING", value: "03", note: "Denne uken" }, { label: "NYE LEADS", value: "02", note: "Eksempeltall" }]
  },
  "Vedøy Canvas": {
    eyebrow: "DEMO · NOTATER",
    title: "Fang idéen mens den er fersk.",
    description: "Et sted for møter, planer, neste steg og kunnskap teamet faktisk finner igjen.",
    cards: [{ label: "ARBEIDSOMRÅDER", value: "02", note: "Eksempeltall" }, { label: "FESTEDE NOTATER", value: "04", note: "Eksempeltall" }, { label: "SIST ENDRET", value: "Nå", note: "Demodata" }]
  }
};

function getContent(selected: string): DemoContent {
  const isLocked = lockedDemoItems.has(selected);
  const lockedNote = "Dette området er låst i demoen fordi det krever aktiv konto, administratorrolle eller en trygg tilkobling.";
  const savedContent = content[selected];
  if (savedContent) return { ...savedContent, locked: isLocked, lockReason: isLocked ? lockedNote : undefined };

  const preview = previewCopy[selected] ?? {
    title: `${selected}, uten risiko.`,
    description: `Her kan dere se hvordan ${selected.toLowerCase()} kan passe inn i Vedøy Studio. Dette er en forhåndsvisning med statiske eksempeltall.`
  };
  return {
    eyebrow: `DEMO · ${selected.toUpperCase()}`,
    title: preview.title,
    description: preview.description,
    cards: isLocked
      ? [{ label: "STATUS", value: "Låst", note: "Trygg forhåndsvisning" }, { label: "TILGANG", value: "Admin", note: "Kreves" }, { label: "DATA", value: "Skjult", note: "Ingen ekte data" }]
      : [{ label: "STATUS", value: "Demo", note: "Ingen data lagres" }, { label: "TILGANG", value: "Trygg", note: "Ingen innlogging" }, { label: "NESTE STEG", value: "Klar", note: "Test eksempelet" }],
    locked: isLocked,
    lockReason: isLocked ? lockedNote : undefined
  };
}

export function StudioDemoDashboard() {
  const [selected, setSelected] = useState("Dashboard");
  const [notice, setNotice] = useState("");
  const current = getContent(selected);
  return <section className="studio-demo-shell" aria-label="Vedøy Studio-demo">
    <aside className="studio-demo-sidebar">
      <div className="studio-demo-brand"><span>VØ</span><div><strong>Vedøy Studio</strong><small>DEMO</small></div></div>
      <nav aria-label="Hele Studio-menyen">
        {studioMenu.map((menuSection) => <section key={menuSection.label}>
          <small>{menuSection.label}</small>
          {menuSection.items.map((item) => <button key={item.label} className={selected === item.label ? "is-active" : ""} type="button" onClick={() => { setSelected(item.label); setNotice(""); }}>
            <i>{item.icon}</i><span>{item.label}</span>{lockedDemoItems.has(item.label) ? <b className="studio-demo-lock" aria-label="Låst i demo">⌑</b> : null}
          </button>)}
        </section>)}
      </nav>
      <div className="studio-demo-sidebar__safe"><i>✓</i><span>Kun eksempeltall<br />Ingen lagring</span></div>
    </aside>
    <div className="studio-demo-main">
      <header>
        <div className="studio-demo-search"><span>⌕</span> Søk i demodata <kbd>⌘ K</kbd></div>
        <div><span className="studio-demo-status"><i /> DEMO AKTIV</span><button className="studio-demo-login" type="button" aria-label="Falsk innlogging i demo" onClick={() => setNotice("Dette er bare en demo-knapp. Ingen innlogging eller konto opprettes her.")}><span>VD</span><b>Logg inn</b><i>⌄</i></button><button type="button" onClick={() => { setSelected("Dashboard"); setNotice("Demoen er tilbakestilt. Ingen data ble endret."); }}>Tilbakestill demo</button></div>
      </header>
      <main>
        <div className="studio-demo-data-note"><i>⌑</i><div><strong>DEMO-MODUS · FASTE EKSEMPELTALL</strong><span>Ingen innlogging, databasekobling eller lagring. Ekte Studio viser kun virksomhetens private data.</span></div></div>
        <div className="studio-demo-heading"><div><p>{current.eyebrow}</p><h2>{current.title}</h2><span>{current.description}</span></div>{current.locked ? <span className="studio-demo-locked-action">⌑ Krever aktiv konto</span> : <button type="button" onClick={() => setNotice(`${selected} er vist med trygg demodata. Ingenting blir lagret.`)}>Test demovisning <b>↗</b></button>}</div>
        <div className="studio-demo-cards">{current.cards.map((card) => <article key={card.label} className={current.locked ? "is-locked" : ""}><small>{card.label}</small><strong>{card.value}</strong><span>{card.note}</span></article>)}</div>
        <div className="studio-demo-grid"><article className="studio-demo-activity"><header><div><small>{current.locked ? "LÅST OMRÅDE" : "DEMOVISNING"}</small><h3>{current.locked ? "Slik åpnes funksjonen" : "Dette kan dere teste"}</h3></div><span>{current.locked ? "⌑ LÅST" : "DEMO"}</span></header><ul><li><i className="mint" /><div><strong>{current.locked ? "Trygg forhåndsvisning" : "Test med eksempeltall"}</strong><span>{current.locked ? "Området vises, men ingen oppgave kan startes her." : "Knappene endrer bare denne demovisningen."}</span></div><time>{current.locked ? "Låst" : "Klar"}</time></li><li><i className="blue" /><div><strong>{current.locked ? "Aktiv konto kreves" : "Ingen lagring"}</strong><span>{current.locked ? "Rolle og abonnement kontrolleres i ekte Studio." : "Demoen oppretter ikke kontoer, saker eller data."}</span></div><time>Trygt</time></li><li><i className="lime" /><div><strong>{current.locked ? "Se aktuell plan" : "Se neste steg"}</strong><span>Opprett en bedrift når dere er klare for funksjonene med egne data.</span></div><time>→</time></li></ul></article><article className="studio-demo-cta"><p>{current.locked ? "KONTROLLERT TILGANG" : "VEDØY GROWTH"}</p><h3>{current.locked ? "Dette området er trygt låst." : "Dette er bare en trygg forhåndsvisning."}</h3><span>{current.locked ? current.lockReason : "Demoen bruker statiske data og har ingen kobling til kontoer, database eller faktiske bestillinger."}</span><a href="/start-bedrift">{current.locked ? "Se aktuelle planer" : "Registrer bedrift"} <b>↗</b></a></article></div>{notice ? <p className="studio-demo-notice" role="status">{notice}</p> : null}
      </main>
    </div>
  </section>;
}

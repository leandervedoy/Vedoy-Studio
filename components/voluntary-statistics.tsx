"use client";

import { useEffect, useState } from "react";
import styles from "./voluntary-statistics.module.css";

type Selection = "yes" | "no";
type SavedChoices = { analytics: boolean; researchReports: boolean };
const KEY = "vedoy-privacy-choices-v2";
const DEFAULT: SavedChoices = { analytics: false, researchReports: false };

/**
 * Essential local preference only; nonessential statistics always default off.
 * Verified Vedoy ID users additionally sync versioned consent to Supabase.
 * No commercial sale or session-length reward is activated by this component.
 */
export function VoluntaryStatistics({
  site = "studio", group = "home"
}: { site?: "studio" | "sent"; group?: "home" | "marketing" | "sent" | "news" }) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Selection>("no");
  const [shareReports, setShareReports] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [linked, setLinked] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedChoices>;
        if (typeof parsed.analytics === "boolean" && typeof parsed.researchReports === "boolean") {
          setSelected(parsed.analytics ? "yes" : "no");
          setShareReports(Boolean(parsed.analytics && parsed.researchReports));
          setOpen(false);
        } else setOpen(true);
      } else setOpen(true);
    } catch { setOpen(true); }
    setReady(true);
    void fetch("/api/privacy/preferences", { credentials:"same-origin", cache:"no-store" })
      .then(async response => response.ok ? response.json() : null)
      .then(data => {
        if (!active || !data?.linked) return;
        setLinked(true);
        const c = data.choices;
        if (c && typeof c.analytics === "boolean" && typeof c.researchReports === "boolean") {
          const value: SavedChoices = { analytics:c.analytics, researchReports: c.analytics && c.researchReports };
          setSelected(value.analytics ? "yes" : "no");
          setShareReports(value.researchReports);
          try { window.localStorage.setItem(KEY,JSON.stringify(value)); } catch { /* optional */ }
          setOpen(false);
        }
      }).catch(() => {});
    return () => { active = false; };
  }, []);

  function saveLocal(value: SavedChoices) {
    setSelected(value.analytics ? "yes" : "no");
    setShareReports(value.researchReports);
    try { window.localStorage.setItem(KEY,JSON.stringify(value)); } catch { /* optional */ }
  }

  async function persist(value: SavedChoices) {
    setSaving(true);
    saveLocal(value);
    setNotice("");
    try {
      const response = await fetch("/api/privacy/preferences", {
        method:"POST",headers:{"content-type":"application/json"},
        credentials:"same-origin", cache:"no-store",body:JSON.stringify(value)
      });
      if (response.ok) setLinked(true);
      else if (linked) setNotice("Valget er lagret på enheten, men ikke synkronisert med Vedoy ID.");
    } catch {
      if (linked) setNotice("Valget er lagret på enheten, men ikke synkronisert med Vedoy ID.");
    } finally { setSaving(false); }
  }

  function close() {
    setConfirming(false);
    setOpen(false);
    if (!window.localStorage.getItem(KEY)) {
      saveLocal(DEFAULT);
      void persist(DEFAULT);
    }
  }

  async function decline() {
    setConfirming(false);
    await persist(DEFAULT);
    setOpen(false);
  }

  function chooseYes() {
    setSelected("yes"); // Visuelt valgt før neste eksplisitte bekreftelse.
    setConfirming(true);
  }

  async function confirmYes() {
    if (saving) return;
    const choices: SavedChoices = { analytics:true, researchReports:shareReports };
    await persist(choices);
    setConfirming(false);
    setOpen(false);
    // A single aggregated view is only sent from this explicit confirmation,
    // never on mount, refresh, or an automatic preference sync.
    try {
      const response = await fetch("/api/advertize/voluntary",{
        method:"POST",headers:{"content-type":"application/json"},
        credentials:"omit",cache:"no-store",
        body:JSON.stringify({site,group,metric:"page_view",consent:true})
      });
      if (!response.ok) setNotice("Samtykket er lagret. Den frivillige statistikken kunne ikke registreres.");
    } catch { setNotice("Samtykket er lagret. Den frivillige statistikken kunne ikke registreres."); }
  }

  if (!ready) return null;

  return <div className={styles.root}>
    {!open ? <button type="button" className={styles.trigger} onClick={() => { setOpen(true);setConfirming(false);setNotice(""); }} aria-haspopup="dialog">
      Personvernvalg <span aria-hidden="true">⚙</span>
    </button> : <section className={styles.popup} role="dialog" aria-modal="false"
      aria-labelledby="vedoy-privacy-heading" aria-describedby="vedoy-privacy-description"
      onKeyDown={event => { if (event.key === "Escape") close(); }}>
      <div className={styles.top}>
        <span className={styles.kicker}>PERSONVERN · FRIVILLIG</span>
        <button type="button" className={styles.close} onClick={close} aria-label="Lukk personvernvalg">×</button>
      </div>
      {confirming ? <>
        <h2 id="vedoy-privacy-heading">Er du sikker?</h2>
        <p id="vedoy-privacy-description">Du velger å bidra med frivillig statistikk. Vedøy registrerer én aggregert sidevisning ved bekreftelse.</p>
        <div className={styles.details}>
          <strong>Hva deles?</strong>
          <p>Besøksstatistikk på gruppenivå, som antall sidevisninger per dag. Fremtidige rapporter kan for eksempel vise hvilke kleskategorier som handles mest i ulike tidsrom i Norge, dersom kjøpsdata senere samles inn lovlig med eget formål og samtykke.</p>
          <strong>Hva deles ikke?</strong>
          <p>Navn, e-postadresse, kontaktopplysninger, betalingskort, meldinger og individuelle kjøpshistorikker deles ikke med kjøpere av rapporter.</p>
          <strong>Kommersiell bruk</strong>
          <p>{shareReports ? "Du har også valgt å tillate kommersiell deling av anonymiserte grupperapporter. Vedøy kan i fremtiden tilby eller selge slike rapporter, men ikke personopplysningene dine. Ingen slik datadeling aktiveres av dette valget alene." : "Du har IKKE tillatt kommersiell deling. Kun frivillig statistikk til Vedøy er valgt."}</p>
        </div>
        <div className={styles.actions}>
          <button type="button" disabled={saving} className={styles.accept} onClick={() => void confirmYes()}>Ja, bekreft</button>
          <button type="button" disabled={saving} className={styles.decline} onClick={() => setConfirming(false)}>Tilbake</button>
        </div>
      </> : <>
        <h2 id="vedoy-privacy-heading">Vil du bidra med data?</h2>
        <p id="vedoy-privacy-description">Hjelp oss å forstå hva som fungerer. Du bestemmer selv, og kan endre valget når som helst.</p>
        <div className={styles.choiceGrid} role="group" aria-label="Deling av frivillig statistikk">
          <button type="button" className={selected==="no" ? styles.choiceSelected : styles.choice} aria-pressed={selected==="no"} onClick={() => {setSelected("no");setShareReports(false);}}>
            <span className={styles.selectionIcon}>{selected==="no"?"✓":"○"}</span><strong>Nei takk</strong><small>Standardvalg · ingen måling</small>
          </button>
          <button type="button" className={selected==="yes" ? styles.choiceSelected : styles.choice} aria-pressed={selected==="yes"} onClick={() => setSelected("yes")}>
            <span className={styles.selectionIcon}>{selected==="yes"?"✓":"○"}</span><strong>Ja, bidra</strong><small>Kun etter bekreftelse</small>
          </button>
        </div>
        <div className={styles.details}>
          <strong>Hva får Vedøy vite?</strong>
          <p>Foreløpig bare én aggregert sidevisning når du godkjenner. Vi samler ikke inn navn eller kjøpshistorikk gjennom denne funksjonen.</p>
          <strong>Fremtidig fordel: Vedoy Coins</strong>
          <p>Planlagt: +1 Vedoy Coin for én kvalifisert besøksdag med minst 2 minutter aktiv bruk. Maks én per dag, kun ved innlogging og etter serververifisering. <b>Belønningen er ikke aktiv ennå.</b> Den skal ikke være betinget av at du deler data.</p>
          <label className={styles.reportChoice}>
            <input type="checkbox" checked={shareReports && selected==="yes"} disabled={selected!=="yes"} onChange={e => setShareReports(e.target.checked)}/>
            <span><strong>Valgfritt tillegg: kommersielle, anonymiserte rapporter</strong><small>Vedøy kan i fremtiden selge rapporter om samlede trender, ikke personopplysninger. Eget valg, avslått som standard. Ingen rapportdata samles inn eller selges gjennom dette valget nå.</small></span>
          </label>
        </div>
        <div className={styles.actions}>
          <button type="button" disabled={saving} className={selected==="yes"?styles.accept:styles.decline} onClick={selected==="yes" ? chooseYes : () => void decline()}>{selected==="yes"?"Fortsett til bekreftelse":"Lagre Nei takk"}</button>
          {selected==="yes" ? <button type="button" className={styles.decline} onClick={() => void decline()}>Avslå</button> : null}
        </div>
        <p className={styles.detail}>{linked ? "Innlogget Vedoy ID: Valgene synkroniseres med kontoen." : "Valget lagres lokalt på denne enheten. Kontosynkronisering krever verifisert Vedoy ID."}</p>
      </>}
    </section>}
    {notice ? <p role="status" className={styles.notice}>{notice}</p> : null}
  </div>;
}

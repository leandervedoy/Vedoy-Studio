"use client";
import { useEffect, useState } from "react";
import styles from "./voluntary-statistics.module.css";

type Preference = "accepted" | "declined" | null;
const STORAGE_KEY = "vedoy-statistics-consent-v1";

/**
 * Explicit opt-in only. Local storage keeps the preference on this device
 * without cookies, a user identifier, fingerprinting or automatic analytics.
 */
export function VoluntaryStatistics({
  site = "studio",
  group = "home"
}: {
  site?: "studio" | "sent";
  group?: "home" | "marketing" | "sent" | "news";
}) {
  const [preference, setPreference] = useState<Preference>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "accepted" || saved === "declined") {
        setPreference(saved);
      } else {
        setOpen(true);
      }
    } catch {
      // Storage can be unavailable in private browsing; default stays declined.
      setOpen(true);
    }
    setReady(true);
  }, []);

  function savePreference(value: Exclude<Preference, null>) {
    setPreference(value);
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch { /* Optional preference storage. */ }
  }

  function dismiss() {
    // Closing without consent is equivalent to declining.
    if (!preference) savePreference("declined");
    setOpen(false);
    setConfirming(false);
    setNotice("");
  }

  function decline() {
    savePreference("declined");
    setOpen(false);
    setNotice("");
  }

  async function accept() {
    setConfirming(false);
    // Only this explicit click sends a single aggregate page-view event.
    savePreference("accepted");
    setOpen(false);
    setNotice("");
    try {
      const response = await fetch("/api/advertize/voluntary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "omit",
        cache: "no-store",
        body: JSON.stringify({ site, group, metric: "page_view", consent: true })
      });
      if (!response.ok) setNotice("Vi kunne ikke registrere den frivillige visningen.");
    } catch {
      setNotice("Vi kunne ikke registrere den frivillige visningen.");
    }
  }

  if (!ready) return null;

  return (
    <div className={styles.root}>
      {!open ? (
        <button type="button" className={styles.trigger} onClick={() => { setNotice(""); setOpen(true); }}
          aria-label="Åpne valg for frivillig besøksstatistikk" aria-haspopup="dialog">
          Personvernvalg · {preference === "accepted" ? "Ja valgt ✓" : "Nei valgt ✓"}
        </button>
      ) : (
        <div className={styles.popup} role="dialog" aria-modal="false"
          aria-labelledby="voluntary-stats-heading" aria-describedby="voluntary-stats-description"
          onKeyDown={(event) => { if (event.key === "Escape") dismiss(); }}>
          <div className={styles.top}>
            <span className={styles.kicker}>PERSONVERN · FRIVILLIG</span>
            <button type="button" className={styles.close} onClick={dismiss} aria-label="Lukk og ikke del data">×</button>
          </div>
          <h2 id="voluntary-stats-heading">Vil du dele anonym statistikk?</h2>
          <p id="voluntary-stats-description">
            Ved å trykke «Ja» sender du én aggregert sidevisning. Ingen profil,
            bruker-ID, meldinger eller kontaktliste. Ingen måling sendes uten ditt valg.
          </p>
          <p className={styles.detail}>Valget lagres bare på denne enheten, uten informasjonskapsler.
            Du kan endre det når som helst via «Personvernvalg».</p>
          <div className={styles.actions}>
            <button type="button" className={styles.accept} onClick={() => void accept()}>Ja, bidra</button>
            <button type="button" className={styles.decline} onClick={decline}>Nei takk</button>
          </div>
          {preference !== null ? (
            <p className={styles.previous}>Tidligere valg: {preference === "accepted" ? "Ja" : "Nei"}. Et nytt «Ja» sender én ny visning.</p>
          ) : null}
        </div>
      )}
      {notice ? <p role="status" className={styles.notice}>{notice}</p> : null}
    </div>
  );
}

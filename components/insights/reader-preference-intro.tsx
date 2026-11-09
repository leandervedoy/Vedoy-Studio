"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./reader-preference-intro.module.css";

export type ReadingGoal = "learn" | "test" | "explore";
export type ReadingLevel = "beginner" | "some" | "advanced";
export type ReadingDepth = "brief" | "standard" | "deep";
export type ReaderPreferences = {
  goal: ReadingGoal;
  level: ReadingLevel;
  depth: ReadingDepth;
};
export type ReadingMode = "read" | "explore";

const STORAGE_KEY = "vedoy-insights-local-reader-preferences-v1";
export const DEFAULT_PREFERENCES: ReaderPreferences = {
  goal: "learn", level: "beginner", depth: "standard",
};

function validPreferences(value: unknown): value is ReaderPreferences {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return ["learn", "test", "explore"].includes(String(record.goal))
    && ["beginner", "some", "advanced"].includes(String(record.level))
    && ["brief", "standard", "deep"].includes(String(record.depth));
}

/** Optional local preference and separately opt-in aggregated Vedoy Statistics.
 * No visitor ID, IP, account data, individual answer or reading history is sent.
 * Nothing is transmitted on mount or preference restoration.
 */
export function ReaderPreferenceIntro({
  onBegin,
  allowInteractive = true,
  initial = DEFAULT_PREFERENCES,
}: {
  onBegin: (mode: ReadingMode, prefs: ReaderPreferences) => void;
  allowInteractive?: boolean;
  initial?: ReaderPreferences;
}) {
  const [preferences, setPreferences] = useState<ReaderPreferences>(initial);
  const [remember, setRemember] = useState(false);
  const [shareAggregate, setShareAggregate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (validPreferences(parsed)) {
          setPreferences(parsed);
          setRemember(true);
        }
      }
    } catch { /* Local preferences are optional. */ }
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    firstRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        event.preventDefault();
        onBegin("read", preferences);
        return;
      }
      if (event.key !== "Tab") return;
      const elements = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), select:not([disabled]), input:not([disabled]), a[href]') ?? [])]
        .filter((el) => el.getClientRects().length > 0);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
    // Mount-only focus handling: form choices are submitted through explicit button clicks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start(mode: ReadingMode) {
    if (saving) return;
    setSaving(true);
    setNotice("");
    try {
      if (remember) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch { /* Optional local storage may be blocked. */ }

    if (shareAggregate) {
      try {
        const response = await fetch("/api/statistics/insights", {
          method: "POST", credentials: "omit", cache: "no-store",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ consent: true, ...preferences }),
        });
        if (!response.ok) throw new Error("statistics unavailable");
      } catch {
        setNotice("Statistikk kunne ikke registreres. Prøv igjen, eller fortsett uten å dele data.");
        setSaving(false);
        return;
      }
    }
    onBegin(mode, preferences);
  }

  function clearLocal() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* optional */ }
    setRemember(false);
    setNotice("Tidligere lagrede leseinnstillinger på denne enheten er slettet.");
  }

  return (
    <div className={styles.overlay}>
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="insights-reader-title" aria-describedby="insights-reader-description">
        <span className={styles.eyebrow}>VEDOY INSIGHTS · FRIVILLIG TILPASNING</span>
        <h2 id="insights-reader-title">Gjør artikkelen til din egen ✨</h2>
        <p id="insights-reader-description">Tre raske valg gir deg en mer relevant leseopplevelse. Du kan også starte uten å dele data.</p>
        <div className={styles.grid}>
          <label htmlFor="reader-goal">Hva ønsker du?</label>
          <select id="reader-goal" ref={firstRef} value={preferences.goal} onChange={(event) => setPreferences(p => ({ ...p, goal: event.target.value as ReadingGoal }))}>
            <option value="learn">Lære og forstå</option>
            <option value="test">Teste kunnskapene mine</option>
            <option value="explore">Utforske eksempler og modeller</option>
          </select>
          <label htmlFor="reader-level">Hvor mye kan du fra før?</label>
          <select id="reader-level" value={preferences.level} onChange={(event) => setPreferences(p => ({ ...p, level: event.target.value as ReadingLevel }))}>
            <option value="beginner">Nybegynner</option>
            <option value="some">Kan litt</option>
            <option value="advanced">Viderekommen</option>
          </select>
          <label htmlFor="reader-depth">Hvor detaljert vil du lese?</label>
          <div className={styles.depth}>
            <input id="reader-depth" type="range" min="0" max="2" step="1"
              value={["brief", "standard", "deep"].indexOf(preferences.depth)}
              onChange={(event) => setPreferences(p => ({ ...p, depth: (["brief", "standard", "deep"] as const)[Number(event.target.value)] }))}/>
            <strong>{preferences.depth === "brief" ? "Kort" : preferences.depth === "standard" ? "Vanlig" : "Detaljert"}</strong>
          </div>
        </div>
        <div className={styles.privacy}>
          <p className={styles.privacyTitle}>Personvern – du bestemmer</p>
          <label className={styles.check}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}/>
            <span><strong>Husk valgene mine på denne enheten</strong><small>Lagres kun i nettleseren, og kan slettes når som helst.</small></span>
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={shareAggregate} onChange={(e) => setShareAggregate(e.target.checked)}/>
            <span><strong>Jeg vil bidra med frivillig statistikk til Vedoy Statistics</strong><small>Vi teller kun samlede kategorier: mål, forkunnskap og detaljnivå. Ingen navn, konto, enkeltbesvarelser eller leser-ID sendes. Dette valget er uavhengig av lagring på enheten.</small></span>
          </label>
          <p className={styles.note}>Data brukes til å forbedre Vedoy Insights, ikke til personlig annonsemålretting eller salg av individuelle data. Når bidraget er lagt til en aggregert teller uten bruker-ID, kan det ikke fjernes enkeltvis. Hostingplattformen kan ha ordinære sikkerhetslogger.</p>
          {remember && <button type="button" className={styles.clear} onClick={clearLocal}>Slett lagrede lesevalg</button>}
        </div>
        {notice && <p className={styles.notice} role="status">{notice}</p>}
        <div className={styles.actions}>
          {allowInteractive && <button type="button" disabled={saving} className={styles.primary} onClick={() => void start("explore")}>Utforsk interaktivt</button>}
          <button type="button" disabled={saving} className={styles.secondary} onClick={() => void start("read")}>{allowInteractive ? "Les vanlig artikkel" : "Start lesingen"}</button>
        </div>
        <button type="button" disabled={saving} className={styles.skip}
          onClick={() => onBegin("read", DEFAULT_PREFERENCES)}>Hopp over tilpasning – ingen data sendes</button>
      </div>
    </div>
  );
}

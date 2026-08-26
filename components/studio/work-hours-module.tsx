"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { WorkTimeEntry } from "@/lib/types";

function secondsFor(entry: WorkTimeEntry, now: number) {
  return Math.max(0, Math.floor(((entry.endedAt ? new Date(entry.endedAt).getTime() : now) - new Date(entry.startedAt).getTime()) / 1000));
}

function duration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours} t ${minutes} min` : `${minutes} min`;
}

export function WorkHoursModule({ initialEntries, expanded = false }: { initialEntries: WorkTimeEntry[]; expanded?: boolean }) {
  const [entries, setEntries] = useState(initialEntries);
  const [now, setNow] = useState(Date.now());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const active = entries.find((entry) => !entry.endedAt);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  const todaySeconds = useMemo(() => entries.filter((entry) => new Date(entry.startedAt).toDateString() === new Date(now).toDateString()).reduce((sum, entry) => sum + secondsFor(entry, now), 0), [entries, now]);

  async function toggle() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/hours", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: active ? "stop" : "start", note }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(data.error || "Kunne ikke oppdatere timene."); setBusy(false); return; }
    const refreshed = await fetch("/api/hours");
    const refreshedData = await refreshed.json().catch(() => ({}));
    if (refreshed.ok) setEntries(refreshedData.entries || []);
    if (!active) setNote("");
    setBusy(false);
  }

  return <article className={`studio-panel growth-hours${expanded ? " growth-hours--expanded" : ""}`}>
    <div className="panel-heading"><div><small>VEDØY GROWTH / TIMER</small><h2>Timeregistrering</h2></div>{!expanded && <Link href="/studio/hours">Se oversikt</Link>}</div>
    <div className="growth-hours__status"><i className={active ? "is-active" : ""} /><span>{active ? "Timeren kjører" : "Ingen aktiv timer"}</span></div>
    <strong className="growth-hours__total">{duration(todaySeconds)}</strong><small className="growth-hours__caption">REGISTRERT I DAG</small>
    {!active && <input className="growth-hours__note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={300} placeholder="Hva jobber du med? (valgfritt)" />}
    {active && <p className="growth-hours__current">{active.note || "Arbeidsøkt"} · {duration(secondsFor(active, now))}</p>}
    <button type="button" className={active ? "button growth-hours__stop" : "button button--dark"} onClick={toggle} disabled={busy}>{busy ? "Lagrer …" : active ? "Stopp timer" : "Start timer"}</button>
    {message && <p className="growth-hours__message" aria-live="polite">{message}</p>}
    {expanded && <div className="growth-hours__history"><h3>Siste økter</h3>{entries.length ? entries.slice(0, 20).map((entry) => <div key={entry.id}><span><strong>{entry.note || "Arbeidsøkt"}</strong><small>{new Intl.DateTimeFormat("nb-NO", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }).format(new Date(entry.startedAt))}</small></span><b>{duration(secondsFor(entry, now))}</b></div>) : <p>Ingen registrerte timer ennå.</p>}</div>}
  </article>;
}

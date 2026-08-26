"use client";

import { useMemo, useState } from "react";
import { MonthCalendar, dateKeyInTimeZone, dayTitle, formatTime, monthKey, moveMonth } from "@vedoy/booking";
import type { WorkTimeEntry } from "@/lib/types";

function secondsFor(entry: WorkTimeEntry, now: number) {
  return Math.max(0, Math.floor(((entry.endedAt ? new Date(entry.endedAt).getTime() : now) - new Date(entry.startedAt).getTime()) / 1000));
}

function duration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours} t ${minutes} min` : `${minutes} min`;
}

export function VedoyCalendar({ entries, now }: { entries: WorkTimeEntry[]; now: number }) {
  const today = dateKeyInTimeZone(new Date(now), "Europe/Oslo");
  const [month, setMonth] = useState(monthKey(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const dayEntries = useMemo(() => entries.filter((entry) => dateKeyInTimeZone(new Date(entry.startedAt), "Europe/Oslo") === selectedDate), [entries, selectedDate]);
  const markers = useMemo(() => {
    const result: Record<string, { color: string; count: number }> = {};
    for (const entry of entries) {
      const key = dateKeyInTimeZone(new Date(entry.startedAt), "Europe/Oslo");
      result[key] = { color: "#6d9274", count: (result[key]?.count ?? 0) + 1 };
    }
    return result;
  }, [entries]);
  const selectedTotal = dayEntries.reduce((sum, entry) => sum + secondsFor(entry, now), 0);

  return <section className="vedoy-calendar" aria-label="Vedøy Calendar">
    <header className="vedoy-calendar__header"><div><small>VEDØY CALENDAR</small><h2>Arbeidskalender</h2><p>Se registrerte økter dag for dag.</p></div><span className="vedoy-calendar__total">{duration(selectedTotal)}<small>{dayEntries.length ? " denne dagen" : " ingen økter"}</small></span></header>
    <div className="vedoy-calendar__body"><MonthCalendar month={month} selectedDate={selectedDate} markers={markers} locale="nb-NO" timeZone="Europe/Oslo" weekStartsOn={1} onSelectDate={setSelectedDate} onPreviousMonth={() => setMonth((value) => moveMonth(value, -1))} onNextMonth={() => setMonth((value) => moveMonth(value, 1))} onToday={() => { setMonth(monthKey(today)); setSelectedDate(today); }} /><aside className="vedoy-calendar__day"><small>VALGT DAG</small><h3>{dayTitle(selectedDate, "nb-NO")}</h3>{dayEntries.length ? dayEntries.map((entry) => <article key={entry.id}><i /><div><strong>{entry.note || "Arbeidsøkt"}</strong><span>{formatTime(entry.startedAt, "nb-NO", "Europe/Oslo")} {entry.endedAt ? "· ferdig" : "· pågår"}</span></div><b>{duration(secondsFor(entry, now))}</b></article>) : <p>Ingen registrerte timer denne dagen.</p>}</aside></div>
  </section>;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { mergeConfiguration } from "../defaults.js";
import type { BookingConfiguration, DateOverride, ScheduleAdapter, ScheduleData, TimeRange, Weekday } from "../types.js";
import { dateKeyInTimeZone, dayTitle, moveMonth, startOfMonth, weekdayLabels } from "../utils/date.js";
import { themeVariables } from "../utils/theme.js";
import { MonthCalendar, type MonthCalendarMarker } from "./MonthCalendar.js";

export interface ScheduleCalendarEditorProps {
  adapter: ScheduleAdapter;
  configuration?: BookingConfiguration;
  initialDate?: string;
  onChange?: (schedule: ScheduleData) => void;
  className?: string;
}

const weekdayOrder: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

function cloneRanges(ranges?: TimeRange[]): TimeRange[] {
  return ranges?.map((range) => ({ ...range })) ?? [];
}

export function ScheduleCalendarEditor({ adapter, configuration, initialDate, onChange, className = "" }: ScheduleCalendarEditorProps) {
  const config = useMemo(() => mergeConfiguration(configuration), [configuration]);
  const today = dateKeyInTimeZone(new Date(), config.timeZone);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(initialDate ?? today));
  const [selectedDate, setSelectedDate] = useState(initialDate ?? today);
  const [schedule, setSchedule] = useState<ScheduleData>({ weeklyHours: {}, overrides: [] });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [draft, setDraft] = useState<DateOverride>({ date: initialDate ?? today, ranges: [] });

  useEffect(() => {
    void adapter.getSchedule().then((value) => {
      setSchedule(value);
      setLoaded(true);
    });
  }, [adapter]);

  useEffect(() => {
    const existing = schedule.overrides.find((item) => item.date === selectedDate);
    setDraft(existing ? { ...existing, ranges: cloneRanges(existing.ranges) } : { date: selectedDate, ranges: [] });
    setSavedMessage("");
  }, [schedule.overrides, selectedDate]);

  const markers = useMemo<Record<string, MonthCalendarMarker>>(() => {
    return Object.fromEntries(schedule.overrides.map((override) => [override.date, {
      color: override.color ?? (override.closed ? "#dc2626" : "#2563eb"),
      label: override.label ?? (override.closed ? "Stengt" : "Tilpasset")
    }]));
  }, [schedule.overrides]);

  function updateRange(index: number, key: keyof TimeRange, value: string) {
    setDraft((current) => ({
      ...current,
      ranges: (current.ranges ?? []).map((range, rangeIndex) => rangeIndex === index ? { ...range, [key]: value } : range)
    }));
  }

  function addRange() {
    setDraft((current) => ({ ...current, closed: false, ranges: [...(current.ranges ?? []), { start: "09:00", end: "16:00" }] }));
  }

  function removeRange(index: number) {
    setDraft((current) => ({ ...current, ranges: (current.ranges ?? []).filter((_, rangeIndex) => rangeIndex !== index) }));
  }

  function changeWeeklyDay(day: Weekday, open: boolean, key?: keyof TimeRange, value?: string) {
    setSchedule((current) => {
      const currentRange = current.weeklyHours[day]?.[0] ?? { start: "09:00", end: "16:00" };
      const nextRange = key ? { ...currentRange, [key]: value ?? currentRange[key] } : currentRange;
      return {
        ...current,
        weeklyHours: { ...current.weeklyHours, [day]: open ? [nextRange] : [] }
      };
    });
  }

  async function persist(nextSchedule: ScheduleData) {
    setSaving(true);
    setSavedMessage("");
    const saved = await adapter.saveSchedule(nextSchedule);
    setSchedule(saved);
    setSaving(false);
    setSavedMessage("Lagret");
    onChange?.(saved);
  }

  async function saveDateOverride() {
    const cleanDraft: DateOverride = {
      ...draft,
      date: selectedDate,
      ranges: draft.closed ? [] : cloneRanges(draft.ranges)
    };
    const next = {
      ...schedule,
      overrides: [...schedule.overrides.filter((item) => item.date !== selectedDate), cleanDraft].sort((a, b) => a.date.localeCompare(b.date))
    };
    await persist(next);
  }

  async function removeDateOverride() {
    const next = { ...schedule, overrides: schedule.overrides.filter((item) => item.date !== selectedDate) };
    await persist(next);
  }

  if (!loaded) {
    return <section className="vb-root vb-loading-card" style={themeVariables(config.theme)}>Laster kalender…</section>;
  }

  const weekdayNames = weekdayLabels(config.locale, 1, false);

  return (
    <section className={`vb-root vb-admin-suite ${config.animations ? "vb-animate" : ""} ${className}`} style={themeVariables(config.theme)}>
      <header className="vb-hero vb-hero--admin">
        <span className="vb-eyebrow">Tilgjengelighet</span>
        <h2>Åpningstider og kalender</h2>
        <p>Klikk på datoer for å stenge, åpne eller gi dem egne tider og farger.</p>
      </header>

      <div className="vb-editor-layout">
        <main className="vb-panel">
          <MonthCalendar
            month={visibleMonth}
            selectedDate={selectedDate}
            locale={config.locale}
            timeZone={config.timeZone}
            weekStartsOn={config.weekStartsOn}
            markers={markers}
            onSelectDate={(date) => { setSelectedDate(date); setVisibleMonth(startOfMonth(date)); }}
            onPreviousMonth={() => setVisibleMonth(moveMonth(visibleMonth, -1))}
            onNextMonth={() => setVisibleMonth(moveMonth(visibleMonth, 1))}
            onToday={() => { setSelectedDate(today); setVisibleMonth(startOfMonth(today)); }}
            todayLabel={config.labels.today}
          />
        </main>

        <aside className="vb-panel vb-date-editor" key={selectedDate}>
          <div className="vb-section-heading">
            <span className="vb-step">✎</span>
            <div><h3>{dayTitle(selectedDate, config.locale)}</h3><p>Endringer gjelder bare denne datoen.</p></div>
          </div>

          <label className="vb-switch-row">
            <span><strong>Stengt hele dagen</strong><small>Ingen kan bestille denne datoen.</small></span>
            <input type="checkbox" checked={Boolean(draft.closed)} onChange={(event) => setDraft((current) => ({ ...current, closed: event.target.checked, ranges: event.target.checked ? [] : current.ranges }))} />
          </label>

          {!draft.closed && (
            <div className="vb-range-editor">
              <div className="vb-inline-heading"><h4>Egne åpningstider</h4><button type="button" className="vb-button vb-button--ghost" onClick={addRange}>+ Tidsrom</button></div>
              {(draft.ranges ?? []).map((range, index) => (
                <div className="vb-time-range" key={`${selectedDate}-${index}`}>
                  <input type="time" value={range.start} onChange={(event) => updateRange(index, "start", event.target.value)} />
                  <span>til</span>
                  <input type="time" value={range.end} onChange={(event) => updateRange(index, "end", event.target.value)} />
                  <button type="button" className="vb-icon-button vb-icon-button--danger" onClick={() => removeRange(index)} aria-label="Fjern tidsrom">×</button>
                </div>
              ))}
              {(draft.ranges ?? []).length === 0 && <p className="vb-hint">Ingen egne tider. Datoen bruker standarduken nedenfor.</p>}
            </div>
          )}

          <div className="vb-fields-grid">
            <label className="vb-field"><span>Kort etikett</span><input value={draft.label ?? ""} onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))} placeholder="F.eks. Påske" /></label>
            <label className="vb-field"><span>Fargekode</span><input type="color" value={draft.color ?? (draft.closed ? "#dc2626" : "#2563eb")} onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))} /></label>
          </div>
          <label className="vb-field"><span>Internt notat</span><textarea rows={3} value={draft.note ?? ""} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Bare synlig for administrator…" /></label>

          <div className="vb-action-row">
            <button type="button" className="vb-button vb-button--primary" onClick={() => void saveDateOverride()} disabled={saving}>{saving ? "Lagrer…" : "Lagre dato"}</button>
            <button type="button" className="vb-button vb-button--danger-ghost" onClick={() => void removeDateOverride()} disabled={!schedule.overrides.some((item) => item.date === selectedDate) || saving}>Bruk standard</button>
            {savedMessage && <span className="vb-save-state">✓ {savedMessage}</span>}
          </div>
        </aside>
      </div>

      <section className="vb-panel vb-week-editor">
        <div className="vb-inline-heading">
          <div><h3>Standarduke</h3><p>Brukes på alle datoer uten egne innstillinger.</p></div>
          <button type="button" className="vb-button vb-button--primary" onClick={() => void persist(schedule)} disabled={saving}>{saving ? "Lagrer…" : "Lagre standarduke"}</button>
        </div>
        <div className="vb-week-list">
          {weekdayOrder.map((day, index) => {
            const range = schedule.weeklyHours[day]?.[0];
            const open = Boolean(range);
            return (
              <div className="vb-week-row" key={day}>
                <label className="vb-checkbox"><input type="checkbox" checked={open} onChange={(event) => changeWeeklyDay(day, event.target.checked)} /> <strong>{weekdayNames[index]}</strong></label>
                {open ? (
                  <div className="vb-time-range vb-time-range--inline">
                    <input type="time" value={range?.start ?? "09:00"} onChange={(event) => changeWeeklyDay(day, true, "start", event.target.value)} />
                    <span>til</span>
                    <input type="time" value={range?.end ?? "16:00"} onChange={(event) => changeWeeklyDay(day, true, "end", event.target.value)} />
                  </div>
                ) : <span className="vb-muted">Stengt</span>}
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}

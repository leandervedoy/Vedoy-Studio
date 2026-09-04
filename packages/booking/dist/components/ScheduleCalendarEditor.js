"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { mergeConfiguration } from "../defaults.js";
import { dateKeyInTimeZone, dayTitle, moveMonth, startOfMonth, weekdayLabels } from "../utils/date.js";
import { themeVariables } from "../utils/theme.js";
import { MonthCalendar } from "./MonthCalendar.js";
const weekdayOrder = [1, 2, 3, 4, 5, 6, 0];
function cloneRanges(ranges) {
    return ranges?.map((range) => ({ ...range })) ?? [];
}
export function ScheduleCalendarEditor({ adapter, configuration, initialDate, onChange, className = "" }) {
    const config = useMemo(() => mergeConfiguration(configuration), [configuration]);
    const today = dateKeyInTimeZone(new Date(), config.timeZone);
    const [visibleMonth, setVisibleMonth] = useState(startOfMonth(initialDate ?? today));
    const [selectedDate, setSelectedDate] = useState(initialDate ?? today);
    const [schedule, setSchedule] = useState({ weeklyHours: {}, overrides: [] });
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState("");
    const [draft, setDraft] = useState({ date: initialDate ?? today, ranges: [] });
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
    const markers = useMemo(() => {
        return Object.fromEntries(schedule.overrides.map((override) => [override.date, {
                color: override.color ?? (override.closed ? "#dc2626" : "#2563eb"),
                label: override.label ?? (override.closed ? "Stengt" : "Tilpasset")
            }]));
    }, [schedule.overrides]);
    function updateRange(index, key, value) {
        setDraft((current) => ({
            ...current,
            ranges: (current.ranges ?? []).map((range, rangeIndex) => rangeIndex === index ? { ...range, [key]: value } : range)
        }));
    }
    function addRange() {
        setDraft((current) => ({ ...current, closed: false, ranges: [...(current.ranges ?? []), { start: "09:00", end: "16:00" }] }));
    }
    function removeRange(index) {
        setDraft((current) => ({ ...current, ranges: (current.ranges ?? []).filter((_, rangeIndex) => rangeIndex !== index) }));
    }
    function changeWeeklyDay(day, open, key, value) {
        setSchedule((current) => {
            const currentRange = current.weeklyHours[day]?.[0] ?? { start: "09:00", end: "16:00" };
            const nextRange = key ? { ...currentRange, [key]: value ?? currentRange[key] } : currentRange;
            return {
                ...current,
                weeklyHours: { ...current.weeklyHours, [day]: open ? [nextRange] : [] }
            };
        });
    }
    async function persist(nextSchedule) {
        setSaving(true);
        setSavedMessage("");
        const saved = await adapter.saveSchedule(nextSchedule);
        setSchedule(saved);
        setSaving(false);
        setSavedMessage("Lagret");
        onChange?.(saved);
    }
    async function saveDateOverride() {
        const cleanDraft = {
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
        return _jsx("section", { className: "vb-root vb-loading-card", style: themeVariables(config.theme), children: "Laster kalender\u2026" });
    }
    const weekdayNames = weekdayLabels(config.locale, 1, false);
    return (_jsxs("section", { className: `vb-root vb-admin-suite ${config.animations ? "vb-animate" : ""} ${className}`, style: themeVariables(config.theme), children: [_jsxs("header", { className: "vb-hero vb-hero--admin", children: [_jsx("span", { className: "vb-eyebrow", children: "Tilgjengelighet" }), _jsx("h2", { children: "\u00C5pningstider og kalender" }), _jsx("p", { children: "Klikk p\u00E5 datoer for \u00E5 stenge, \u00E5pne eller gi dem egne tider og farger." })] }), _jsxs("div", { className: "vb-editor-layout", children: [_jsx("main", { className: "vb-panel", children: _jsx(MonthCalendar, { month: visibleMonth, selectedDate: selectedDate, locale: config.locale, timeZone: config.timeZone, weekStartsOn: config.weekStartsOn, markers: markers, onSelectDate: (date) => { setSelectedDate(date); setVisibleMonth(startOfMonth(date)); }, onPreviousMonth: () => setVisibleMonth(moveMonth(visibleMonth, -1)), onNextMonth: () => setVisibleMonth(moveMonth(visibleMonth, 1)), onToday: () => { setSelectedDate(today); setVisibleMonth(startOfMonth(today)); }, todayLabel: config.labels.today }) }), _jsxs("aside", { className: "vb-panel vb-date-editor", children: [_jsxs("div", { className: "vb-section-heading", children: [_jsx("span", { className: "vb-step", children: "\u270E" }), _jsxs("div", { children: [_jsx("h3", { children: dayTitle(selectedDate, config.locale) }), _jsx("p", { children: "Endringer gjelder bare denne datoen." })] })] }), _jsxs("label", { className: "vb-switch-row", children: [_jsxs("span", { children: [_jsx("strong", { children: "Stengt hele dagen" }), _jsx("small", { children: "Ingen kan bestille denne datoen." })] }), _jsx("input", { type: "checkbox", checked: Boolean(draft.closed), onChange: (event) => setDraft((current) => ({ ...current, closed: event.target.checked, ranges: event.target.checked ? [] : current.ranges })) })] }), !draft.closed && (_jsxs("div", { className: "vb-range-editor", children: [_jsxs("div", { className: "vb-inline-heading", children: [_jsx("h4", { children: "Egne \u00E5pningstider" }), _jsx("button", { type: "button", className: "vb-button vb-button--ghost", onClick: addRange, children: "+ Tidsrom" })] }), (draft.ranges ?? []).map((range, index) => (_jsxs("div", { className: "vb-time-range", children: [_jsx("input", { type: "time", value: range.start, onChange: (event) => updateRange(index, "start", event.target.value) }), _jsx("span", { children: "til" }), _jsx("input", { type: "time", value: range.end, onChange: (event) => updateRange(index, "end", event.target.value) }), _jsx("button", { type: "button", className: "vb-icon-button vb-icon-button--danger", onClick: () => removeRange(index), "aria-label": "Fjern tidsrom", children: "\u00D7" })] }, `${selectedDate}-${index}`))), (draft.ranges ?? []).length === 0 && _jsx("p", { className: "vb-hint", children: "Ingen egne tider. Datoen bruker standarduken nedenfor." })] })), _jsxs("div", { className: "vb-fields-grid", children: [_jsxs("label", { className: "vb-field", children: [_jsx("span", { children: "Kort etikett" }), _jsx("input", { value: draft.label ?? "", onChange: (event) => setDraft((current) => ({ ...current, label: event.target.value })), placeholder: "F.eks. P\u00E5ske" })] }), _jsxs("label", { className: "vb-field", children: [_jsx("span", { children: "Fargekode" }), _jsx("input", { type: "color", value: draft.color ?? (draft.closed ? "#dc2626" : "#2563eb"), onChange: (event) => setDraft((current) => ({ ...current, color: event.target.value })) })] })] }), _jsxs("label", { className: "vb-field", children: [_jsx("span", { children: "Internt notat" }), _jsx("textarea", { rows: 3, value: draft.note ?? "", onChange: (event) => setDraft((current) => ({ ...current, note: event.target.value })), placeholder: "Bare synlig for administrator\u2026" })] }), _jsxs("div", { className: "vb-action-row", children: [_jsx("button", { type: "button", className: "vb-button vb-button--primary", onClick: () => void saveDateOverride(), disabled: saving, children: saving ? "Lagrer…" : "Lagre dato" }), _jsx("button", { type: "button", className: "vb-button vb-button--danger-ghost", onClick: () => void removeDateOverride(), disabled: !schedule.overrides.some((item) => item.date === selectedDate) || saving, children: "Bruk standard" }), savedMessage && _jsxs("span", { className: "vb-save-state", children: ["\u2713 ", savedMessage] })] })] }, selectedDate)] }), _jsxs("section", { className: "vb-panel vb-week-editor", children: [_jsxs("div", { className: "vb-inline-heading", children: [_jsxs("div", { children: [_jsx("h3", { children: "Standarduke" }), _jsx("p", { children: "Brukes p\u00E5 alle datoer uten egne innstillinger." })] }), _jsx("button", { type: "button", className: "vb-button vb-button--primary", onClick: () => void persist(schedule), disabled: saving, children: saving ? "Lagrer…" : "Lagre standarduke" })] }), _jsx("div", { className: "vb-week-list", children: weekdayOrder.map((day, index) => {
                            const range = schedule.weeklyHours[day]?.[0];
                            const open = Boolean(range);
                            return (_jsxs("div", { className: "vb-week-row", children: [_jsxs("label", { className: "vb-checkbox", children: [_jsx("input", { type: "checkbox", checked: open, onChange: (event) => changeWeeklyDay(day, event.target.checked) }), " ", _jsx("strong", { children: weekdayNames[index] })] }), open ? (_jsxs("div", { className: "vb-time-range vb-time-range--inline", children: [_jsx("input", { type: "time", value: range?.start ?? "09:00", onChange: (event) => changeWeeklyDay(day, true, "start", event.target.value) }), _jsx("span", { children: "til" }), _jsx("input", { type: "time", value: range?.end ?? "16:00", onChange: (event) => changeWeeklyDay(day, true, "end", event.target.value) })] })) : _jsx("span", { className: "vb-muted", children: "Stengt" })] }, day));
                        }) })] })] }));
}
//# sourceMappingURL=ScheduleCalendarEditor.js.map
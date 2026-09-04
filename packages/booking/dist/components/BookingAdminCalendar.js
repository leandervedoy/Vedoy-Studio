"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mergeConfiguration } from "../defaults.js";
import { addMinutes, calendarGrid, dateKeyInTimeZone, dayTitle, formatDateTime, moveMonth, startOfMonth, zonedLocalToUtc } from "../utils/date.js";
import { themeVariables } from "../utils/theme.js";
import { MonthCalendar } from "./MonthCalendar.js";
const statuses = ["all", "pending", "confirmed", "in-progress", "completed", "cancelled", "no-show"];
const statusLabels = {
    all: "Alle statuser",
    pending: "Avventer",
    confirmed: "Bekreftet",
    "in-progress": "Pågår",
    completed: "Fullført",
    cancelled: "Avbestilt",
    "no-show": "Ikke møtt"
};
export function BookingAdminCalendar({ adapter, services, plans = [], staff = [], configuration, initialDate, className = "" }) {
    const config = useMemo(() => mergeConfiguration(configuration), [configuration]);
    const today = dateKeyInTimeZone(new Date(), config.timeZone);
    const [visibleMonth, setVisibleMonth] = useState(startOfMonth(initialDate ?? today));
    const [selectedDate, setSelectedDate] = useState(initialDate ?? today);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [serviceId, setServiceId] = useState("all");
    const [staffId, setStaffId] = useState("all");
    const refresh = useCallback(async () => {
        setLoading(true);
        const grid = calendarGrid(visibleMonth, config.weekStartsOn);
        const from = zonedLocalToUtc(grid[0], "00:00", config.timeZone);
        const to = addMinutes(zonedLocalToUtc(grid[grid.length - 1], "00:00", config.timeZone), 24 * 60);
        const result = await adapter.list({ from, to });
        setBookings(result);
        setLoading(false);
    }, [adapter, config.timeZone, config.weekStartsOn, visibleMonth]);
    useEffect(() => { void refresh(); }, [refresh]);
    const filtered = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return bookings.filter((booking) => {
            if (status !== "all" && booking.status !== status)
                return false;
            if (serviceId !== "all" && booking.serviceId !== serviceId)
                return false;
            if (staffId !== "all" && booking.staffId !== staffId)
                return false;
            if (normalizedQuery) {
                const haystack = `${booking.customer.name} ${booking.customer.email} ${booking.customer.phone ?? ""} ${booking.notes ?? ""}`.toLowerCase();
                if (!haystack.includes(normalizedQuery))
                    return false;
            }
            return true;
        });
    }, [bookings, query, serviceId, staffId, status]);
    const bookingsByDate = useMemo(() => {
        const map = new Map();
        for (const booking of filtered) {
            const date = dateKeyInTimeZone(new Date(booking.startsAt), config.timeZone);
            const current = map.get(date) ?? [];
            current.push(booking);
            map.set(date, current.sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
        }
        return map;
    }, [config.timeZone, filtered]);
    const markers = useMemo(() => {
        const result = {};
        for (const [date, items] of bookingsByDate) {
            result[date] = { count: items.length, color: services.find((service) => service.id === items[0]?.serviceId)?.color ?? config.theme.accent };
        }
        return result;
    }, [bookingsByDate, config.theme.accent, services]);
    const selectedBookings = bookingsByDate.get(selectedDate) ?? [];
    async function updateStatus(id, nextStatus) {
        await adapter.update(id, { status: nextStatus });
        await refresh();
    }
    async function remove(id) {
        if (typeof window !== "undefined" && !window.confirm("Slette bestillingen permanent?"))
            return;
        await adapter.remove(id);
        await refresh();
    }
    return (_jsxs("section", { className: `vb-root vb-admin-suite ${config.animations ? "vb-animate" : ""} ${className}`, style: themeVariables(config.theme), children: [_jsxs("header", { className: "vb-hero vb-hero--admin", children: [_jsx("span", { className: "vb-eyebrow", children: "Bookingadministrasjon" }), _jsx("h2", { children: "Kalender og bestillinger" }), _jsx("p", { children: "En Outlook-lignende oversikt med filtre, farger og direkte statusendring." })] }), _jsxs("div", { className: "vb-filterbar", children: [_jsx("input", { className: "vb-input", value: query, onChange: (event) => setQuery(event.target.value), placeholder: "S\u00F8k etter kunde\u2026" }), _jsx("select", { value: status, onChange: (event) => setStatus(event.target.value), children: statuses.map((item) => _jsx("option", { value: item, children: statusLabels[item] }, item)) }), _jsxs("select", { value: serviceId, onChange: (event) => setServiceId(event.target.value), children: [_jsx("option", { value: "all", children: "Alle tjenester" }), services.map((service) => _jsx("option", { value: service.id, children: service.name }, service.id))] }), staff.length > 0 && _jsxs("select", { value: staffId, onChange: (event) => setStaffId(event.target.value), children: [_jsx("option", { value: "all", children: "Alle medarbeidere" }), staff.map((person) => _jsx("option", { value: person.id, children: person.name }, person.id))] })] }), _jsxs("div", { className: "vb-editor-layout vb-editor-layout--admin", children: [_jsx("main", { className: "vb-panel", children: _jsx(MonthCalendar, { month: visibleMonth, selectedDate: selectedDate, locale: config.locale, timeZone: config.timeZone, weekStartsOn: config.weekStartsOn, markers: markers, onSelectDate: (date) => { setSelectedDate(date); setVisibleMonth(startOfMonth(date)); }, onPreviousMonth: () => setVisibleMonth(moveMonth(visibleMonth, -1)), onNextMonth: () => setVisibleMonth(moveMonth(visibleMonth, 1)), onToday: () => { setSelectedDate(today); setVisibleMonth(startOfMonth(today)); }, todayLabel: config.labels.today, renderDateContent: (date) => {
                                const items = bookingsByDate.get(date) ?? [];
                                return (_jsxs("span", { className: "vb-calendar-events", children: [items.slice(0, 3).map((booking) => {
                                            const service = services.find((item) => item.id === booking.serviceId);
                                            return _jsx("span", { className: `vb-calendar-event is-${booking.status}`, style: { "--vb-event-color": service?.color ?? config.theme.accent }, children: booking.customer.name }, booking.id);
                                        }), items.length > 3 && _jsxs("small", { children: ["+", items.length - 3, " flere"] })] }));
                            } }) }), _jsxs("aside", { className: "vb-panel vb-day-agenda", children: [_jsxs("div", { className: "vb-section-heading", children: [_jsx("span", { className: "vb-step", children: selectedBookings.length }), _jsxs("div", { children: [_jsx("h3", { children: dayTitle(selectedDate, config.locale) }), _jsx("p", { children: loading ? "Laster…" : `${selectedBookings.length} bestilling${selectedBookings.length === 1 ? "" : "er"}` })] })] }), _jsxs("div", { className: "vb-agenda-list", children: [selectedBookings.map((booking) => {
                                        const service = services.find((item) => item.id === booking.serviceId);
                                        const plan = plans.find((item) => item.id === booking.planId);
                                        const person = staff.find((item) => item.id === booking.staffId);
                                        return (_jsxs("article", { className: "vb-agenda-card", style: { "--vb-event-color": service?.color ?? config.theme.accent }, children: [_jsx("span", { className: "vb-agenda-card__bar" }), _jsxs("div", { className: "vb-agenda-card__top", children: [_jsxs("div", { children: [_jsx("strong", { children: booking.customer.name }), _jsx("small", { children: formatDateTime(booking.startsAt, config.locale, config.timeZone) })] }), _jsx("select", { className: `vb-status is-${booking.status}`, value: booking.status, onChange: (event) => void updateStatus(booking.id, event.target.value), children: statuses.filter((item) => item !== "all").map((item) => _jsx("option", { value: item, children: statusLabels[item] }, item)) })] }), _jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: "Tjeneste" }), _jsx("dd", { children: service?.name ?? booking.serviceId })] }), plan && _jsxs("div", { children: [_jsx("dt", { children: "Plan" }), _jsx("dd", { children: plan.name })] }), person && _jsxs("div", { children: [_jsx("dt", { children: "Medarbeider" }), _jsx("dd", { children: person.name })] }), _jsxs("div", { children: [_jsx("dt", { children: "Kontakt" }), _jsxs("dd", { children: [booking.customer.email, booking.customer.phone ? ` · ${booking.customer.phone}` : ""] })] })] }), booking.notes && _jsx("p", { children: booking.notes }), _jsx("button", { type: "button", className: "vb-link-danger", onClick: () => void remove(booking.id), children: "Slett permanent" })] }, booking.id));
                                    }), !loading && selectedBookings.length === 0 && _jsx("div", { className: "vb-empty", children: "Ingen bestillinger denne dagen." })] })] }, selectedDate)] })] }));
}
//# sourceMappingURL=BookingAdminCalendar.js.map
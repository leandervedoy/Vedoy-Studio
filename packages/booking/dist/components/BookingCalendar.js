"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { mergeConfiguration } from "../defaults.js";
import { defaultAvailabilityProvider, bookingCountByDate } from "../utils/availability.js";
import { addDaysToKey, addMinutes, compareDateKeys, dateKeyInTimeZone, dayTitle, formatDateTime, moveMonth, startOfMonth, zonedLocalToUtc } from "../utils/date.js";
import { themeVariables } from "../utils/theme.js";
import { MonthCalendar } from "./MonthCalendar.js";
function priceLabel(price, currency, locale) {
    if (price == null)
        return "Pris etter avtale";
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}
export function BookingCalendar({ services, plans = [], staff = [], adapter, schedule, configuration, availabilityProvider = defaultAvailabilityProvider, initialDate, onBooked, className = "" }) {
    const config = useMemo(() => mergeConfiguration(configuration), [configuration]);
    const activeServices = useMemo(() => services.filter((service) => service.active !== false), [services]);
    const activePlans = useMemo(() => plans.filter((plan) => plan.active !== false), [plans]);
    const activeStaff = useMemo(() => staff.filter((person) => person.active !== false), [staff]);
    const activeLocations = useMemo(() => (config.locations ?? []).filter((location) => location.active !== false), [config.locations]);
    const today = dateKeyInTimeZone(new Date(), config.timeZone);
    const [visibleMonth, setVisibleMonth] = useState(startOfMonth(initialDate ?? today));
    const [selectedDate, setSelectedDate] = useState(initialDate ?? today);
    const [category, setCategory] = useState("all");
    const [serviceSearch, setServiceSearch] = useState("");
    const [serviceId, setServiceId] = useState(activeServices[0]?.id ?? "");
    const [planId, setPlanId] = useState("");
    const [staffId, setStaffId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [selectedSlotId, setSelectedSlotId] = useState("");
    const [slots, setSlots] = useState([]);
    const [monthBookings, setMonthBookings] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [customValues, setCustomValues] = useState({});
    const categories = useMemo(() => ["all", ...Array.from(new Set(activeServices.map((service) => service.category).filter(Boolean)))], [activeServices]);
    const filteredServices = useMemo(() => {
        const query = serviceSearch.trim().toLowerCase();
        return activeServices.filter((service) => {
            if (category !== "all" && service.category !== category)
                return false;
            if (query && !`${service.name} ${service.description ?? ""}`.toLowerCase().includes(query))
                return false;
            return true;
        });
    }, [activeServices, category, serviceSearch]);
    const selectedService = activeServices.find((service) => service.id === serviceId);
    const allowedPlans = activePlans.filter((plan) => !plan.serviceIds?.length || plan.serviceIds.includes(serviceId));
    const allowedStaff = activeStaff.filter((person) => {
        if (person.serviceIds?.length && !person.serviceIds.includes(serviceId))
            return false;
        if (selectedService?.staffIds?.length && !selectedService.staffIds.includes(person.id))
            return false;
        return true;
    });
    const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
    useEffect(() => {
        if (!activeServices.some((service) => service.id === serviceId)) {
            setServiceId(activeServices[0]?.id ?? "");
        }
    }, [activeServices, serviceId]);
    useEffect(() => {
        const firstGridDate = addDaysToKey(visibleMonth, -7);
        const lastGridDate = addDaysToKey(visibleMonth, 49);
        const from = zonedLocalToUtc(firstGridDate, "00:00", config.timeZone);
        const to = addMinutes(zonedLocalToUtc(lastGridDate, "00:00", config.timeZone), 24 * 60);
        void adapter.list({ from, to }).then(setMonthBookings);
    }, [adapter, config.timeZone, visibleMonth]);
    useEffect(() => {
        if (!selectedService) {
            setSlots([]);
            return;
        }
        let cancelled = false;
        setLoadingSlots(true);
        setSelectedSlotId("");
        const from = zonedLocalToUtc(selectedDate, "00:00", config.timeZone);
        const to = addMinutes(from, 24 * 60);
        void adapter.list({ from, to }).then(async (bookings) => {
            const nextSlots = await availabilityProvider({
                date: selectedDate,
                service: selectedService,
                staffId: staffId || undefined,
                location: locationId || selectedService.location,
                schedule,
                bookings,
                configuration: {
                    locale: config.locale,
                    timeZone: config.timeZone,
                    slotIntervalMinutes: config.slotIntervalMinutes,
                    minNoticeMinutes: config.minNoticeMinutes,
                    bookingWindowDays: config.bookingWindowDays
                }
            });
            if (!cancelled) {
                setSlots(nextSlots);
                setLoadingSlots(false);
            }
        }).catch(() => {
            if (!cancelled) {
                setSlots([]);
                setLoadingSlots(false);
            }
        });
        return () => { cancelled = true; };
    }, [adapter, availabilityProvider, config.bookingWindowDays, config.minNoticeMinutes, config.slotIntervalMinutes, config.timeZone, schedule, selectedDate, selectedService, staffId]);
    const markers = useMemo(() => {
        const result = {};
        const counts = bookingCountByDate(monthBookings, config.timeZone);
        for (const [date, count] of counts)
            result[date] = { count };
        for (const override of schedule.overrides) {
            result[override.date] = {
                ...result[override.date],
                color: override.color ?? (override.closed ? "#dc2626" : "#2563eb"),
                label: override.label ?? (override.closed ? config.labels.closed : undefined)
            };
        }
        return result;
    }, [config.labels.closed, config.timeZone, monthBookings, schedule.overrides]);
    function isDateDisabled(date) {
        if (!config.allowPastDates && compareDateKeys(date, today) < 0)
            return true;
        if (compareDateKeys(date, addDaysToKey(today, config.bookingWindowDays)) > 0)
            return true;
        const override = schedule.overrides.find((item) => item.date === date);
        return override?.closed === true;
    }
    async function submit(event) {
        event.preventDefault();
        setMessage("");
        if (!selectedService || !selectedSlot || !name.trim() || !email.trim() || (config.requirePhone && !phone.trim())) {
            setMessage("Fyll inn tjeneste, tid og nødvendige kontaktopplysninger.");
            return;
        }
        for (const field of config.customFields) {
            if (field.required && !customValues[field.id]) {
                setMessage(`Fyll inn: ${field.label}.`);
                return;
            }
        }
        try {
            setSubmitting(true);
            const booking = await adapter.create({
                serviceId: selectedService.id,
                initialStatus: config.autoConfirm ? "confirmed" : "pending",
                planId: planId || undefined,
                staffId: staffId || undefined,
                startsAt: selectedSlot.startsAt,
                endsAt: selectedSlot.endsAt,
                customer: { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined },
                notes: notes.trim() || undefined,
                customFields: customValues,
                metadata: {
                    capacity: selectedService.capacity ?? 1,
                    blockedStartsAt: addMinutes(selectedSlot.startsAt, -(selectedService.bufferBeforeMinutes ?? 0)),
                    blockedEndsAt: addMinutes(selectedSlot.endsAt, selectedService.bufferAfterMinutes ?? 0)
                }
            });
            setMessage(config.labels.bookingSuccess);
            setName("");
            setEmail("");
            setPhone("");
            setNotes("");
            setCustomValues({});
            setSelectedSlotId("");
            setMonthBookings((current) => [...current, booking]);
            onBooked?.(booking);
        }
        catch (error) {
            setMessage(error instanceof Error && error.message === "BOOKING_CONFLICT" ? "Tiden ble nettopp tatt. Velg et annet tidspunkt." : "Bestillingen kunne ikke lagres. Prøv igjen.");
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsxs("section", { className: `vb-root vb-booking vb-layout--${config.layout} ${config.animations ? "vb-animate" : ""} ${className}`, style: themeVariables(config.theme), children: [_jsxs("header", { className: "vb-hero", children: [_jsx("span", { className: "vb-eyebrow", children: "Ved\u00F8y Booking" }), _jsx("h2", { children: config.labels.title }), _jsx("p", { children: config.labels.subtitle })] }), _jsxs("div", { className: "vb-booking__layout", children: [_jsxs("aside", { className: "vb-panel vb-service-panel", children: [_jsxs("div", { className: "vb-section-heading", children: [_jsx("span", { className: "vb-step", children: "1" }), _jsxs("div", { children: [_jsx("h3", { children: config.labels.chooseService }), _jsx("p", { children: "Filtrer og velg det som passer." })] })] }), _jsx("input", { className: "vb-input", value: serviceSearch, onChange: (event) => setServiceSearch(event.target.value), placeholder: "S\u00F8k i tjenester\u2026" }), config.showCategories && categories.length > 2 && (_jsx("div", { className: "vb-chips", children: categories.map((item) => (_jsx("button", { type: "button", className: category === item ? "is-active" : "", onClick: () => setCategory(item), children: item === "all" ? "Alle" : item }, item))) })), _jsxs("div", { className: "vb-service-list", children: [filteredServices.map((service) => (_jsxs("button", { type: "button", className: `vb-service-card ${service.id === serviceId ? "is-selected" : ""}`, style: { "--vb-item-color": service.color ?? config.theme.accent }, onClick: () => { setServiceId(service.id); setPlanId(""); setStaffId(""); }, children: [_jsx("span", { className: "vb-service-card__color" }), service.icon && _jsx("span", { className: "vb-service-card__icon", children: service.icon }), _jsxs("span", { className: "vb-service-card__body", children: [_jsx("strong", { children: service.name }), _jsxs("small", { children: [service.durationMinutes, " min \u00B7 ", priceLabel(service.price, service.currency ?? config.currency, config.locale)] }), service.description && _jsx("em", { children: service.description })] }), _jsx("span", { className: "vb-check", children: "\u2713" })] }, service.id))), filteredServices.length === 0 && _jsx("div", { className: "vb-empty", children: "Ingen tjenester passer filteret." })] }), config.showPlans && allowedPlans.length > 0 && (_jsxs("div", { className: "vb-subsection", children: [_jsx("h4", { children: config.labels.choosePlan }), _jsxs("div", { className: "vb-plan-list", children: [_jsx("button", { type: "button", className: `vb-plan-chip ${planId === "" ? "is-selected" : ""}`, onClick: () => setPlanId(""), children: "Ingen plan" }), allowedPlans.map((plan) => (_jsxs("button", { type: "button", className: `vb-plan-chip ${planId === plan.id ? "is-selected" : ""}`, style: { "--vb-item-color": plan.color ?? config.theme.accent }, onClick: () => setPlanId(plan.id), children: [plan.popular && _jsx("span", { children: "\u2605" }), " ", plan.name] }, plan.id)))] })] })), config.showStaff && allowedStaff.length > 0 && (_jsxs("label", { className: "vb-field", children: [_jsx("span", { children: config.labels.chooseStaff }), _jsxs("select", { value: staffId, onChange: (event) => setStaffId(event.target.value), children: [_jsx("option", { value: "", children: "F\u00F8rste ledige" }), allowedStaff.map((person) => _jsx("option", { value: person.id, children: person.name }, person.id))] })] })), activeLocations.length > 0 && (_jsxs("label", { className: "vb-field", children: [_jsx("span", { children: config.labels.chooseLocation }), _jsxs("select", { value: locationId, onChange: (event) => setLocationId(event.target.value), children: [_jsx("option", { value: "", children: "Velg lokasjon" }), activeLocations.map((location) => _jsx("option", { value: location.id, children: location.name }, location.id))] })] }))] }), _jsxs("main", { className: "vb-panel vb-calendar-panel", children: [_jsxs("div", { className: "vb-section-heading", children: [_jsx("span", { className: "vb-step", children: "2" }), _jsxs("div", { children: [_jsx("h3", { children: config.labels.chooseDate }), _jsx("p", { children: "Klikk p\u00E5 en dato og velg tid." })] })] }), _jsx(MonthCalendar, { month: visibleMonth, selectedDate: selectedDate, locale: config.locale, timeZone: config.timeZone, weekStartsOn: config.weekStartsOn, markers: markers, isDateDisabled: isDateDisabled, onSelectDate: (date) => { setSelectedDate(date); setVisibleMonth(startOfMonth(date)); }, onPreviousMonth: () => setVisibleMonth(moveMonth(visibleMonth, -1)), onNextMonth: () => setVisibleMonth(moveMonth(visibleMonth, 1)), onToday: () => { setSelectedDate(today); setVisibleMonth(startOfMonth(today)); }, todayLabel: config.labels.today }), _jsxs("section", { className: "vb-times", children: [_jsxs("div", { className: "vb-times__heading", children: [_jsxs("div", { children: [_jsx("h4", { children: config.labels.chooseTime }), _jsx("p", { children: dayTitle(selectedDate, config.locale) })] }), selectedService && _jsxs("span", { className: "vb-duration", children: [selectedService.durationMinutes, " min"] })] }), loadingSlots ? _jsx("div", { className: "vb-skeleton-grid", children: Array.from({ length: 8 }, (_, index) => _jsx("span", {}, index)) }) : (_jsxs("div", { className: "vb-time-grid", children: [slots.filter((slot) => slot.available).map((slot) => (_jsxs("button", { type: "button", className: selectedSlotId === slot.id ? "is-selected" : "", onClick: () => setSelectedSlotId(slot.id), children: [slot.label, typeof slot.remainingCapacity === "number" && slot.remainingCapacity > 1 && _jsxs("small", { children: [slot.remainingCapacity, " ledige"] })] }, slot.id))), slots.filter((slot) => slot.available).length === 0 && _jsx("div", { className: "vb-empty vb-empty--wide", children: config.labels.noTimes })] }))] }, `${selectedDate}-${serviceId}-${staffId}`)] }), _jsxs("aside", { className: "vb-panel vb-summary-panel", children: [_jsxs("div", { className: "vb-section-heading", children: [_jsx("span", { className: "vb-step", children: "3" }), _jsxs("div", { children: [_jsx("h3", { children: config.labels.yourDetails }), _jsx("p", { children: "Kontroller valgene og fullf\u00F8r." })] })] }), _jsxs("div", { className: "vb-summary", children: [_jsxs("div", { children: [_jsx("span", { children: "Tjeneste" }), _jsx("strong", { children: selectedService?.name ?? "Ikke valgt" })] }), _jsxs("div", { children: [_jsx("span", { children: "Dato og tid" }), _jsx("strong", { children: selectedSlot ? formatDateTime(selectedSlot.startsAt, config.locale, config.timeZone) : "Ikke valgt" })] }), planId && _jsxs("div", { children: [_jsx("span", { children: "Plan" }), _jsx("strong", { children: activePlans.find((plan) => plan.id === planId)?.name })] }), staffId && _jsxs("div", { children: [_jsx("span", { children: "Medarbeider" }), _jsx("strong", { children: activeStaff.find((person) => person.id === staffId)?.name })] })] }), _jsxs("form", { className: "vb-form", onSubmit: submit, children: [_jsxs("label", { className: "vb-field", children: [_jsx("span", { children: "Navn *" }), _jsx("input", { value: name, onChange: (event) => setName(event.target.value), autoComplete: "name" })] }), _jsxs("label", { className: "vb-field", children: [_jsx("span", { children: "E-post *" }), _jsx("input", { type: "email", value: email, onChange: (event) => setEmail(event.target.value), autoComplete: "email" })] }), _jsxs("label", { className: "vb-field", children: [_jsxs("span", { children: ["Telefon", config.requirePhone ? " *" : ""] }), _jsx("input", { type: "tel", value: phone, onChange: (event) => setPhone(event.target.value), autoComplete: "tel" })] }), _jsxs("label", { className: "vb-field", children: [_jsx("span", { children: "Kommentar" }), _jsx("textarea", { value: notes, onChange: (event) => setNotes(event.target.value), rows: 3 })] }), config.customFields.map((field) => (_jsxs("label", { className: "vb-field", children: [_jsxs("span", { children: [field.label, field.required ? " *" : ""] }), field.type === "textarea" ? (_jsx("textarea", { rows: 3, placeholder: field.placeholder, value: String(customValues[field.id] ?? ""), onChange: (event) => setCustomValues((current) => ({ ...current, [field.id]: event.target.value })) })) : field.type === "select" ? (_jsxs("select", { value: String(customValues[field.id] ?? ""), onChange: (event) => setCustomValues((current) => ({ ...current, [field.id]: event.target.value })), children: [_jsx("option", { value: "", children: "Velg\u2026" }), field.options?.map((option) => _jsx("option", { value: option, children: option }, option))] })) : field.type === "checkbox" ? (_jsxs("span", { className: "vb-checkbox", children: [_jsx("input", { type: "checkbox", checked: Boolean(customValues[field.id]), onChange: (event) => setCustomValues((current) => ({ ...current, [field.id]: event.target.checked })) }), " Ja"] })) : (_jsx("input", { type: field.type, placeholder: field.placeholder, value: String(customValues[field.id] ?? ""), onChange: (event) => setCustomValues((current) => ({ ...current, [field.id]: event.target.value })) })), field.helpText && _jsx("small", { children: field.helpText })] }, field.id))), _jsx("button", { className: "vb-button vb-button--primary", disabled: submitting || !selectedSlot || !selectedService, children: submitting ? "Lagrer…" : config.labels.confirm }), message && _jsx("p", { className: `vb-message ${message === config.labels.bookingSuccess ? "is-success" : ""}`, role: "status", children: message })] })] })] })] }));
}
//# sourceMappingURL=BookingCalendar.js.map
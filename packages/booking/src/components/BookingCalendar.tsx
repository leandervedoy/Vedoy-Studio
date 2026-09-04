"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { mergeConfiguration } from "../defaults.js";
import type {
  AvailabilityProvider,
  AvailabilitySlot,
  Booking,
  BookingAdapter,
  BookingConfiguration,
  BookingPlan,
  BookingService,
  BookingStaff,
  ScheduleData
} from "../types.js";
import { defaultAvailabilityProvider, bookingCountByDate } from "../utils/availability.js";
import {
  addDaysToKey,
  addMinutes,
  compareDateKeys,
  dateKeyInTimeZone,
  dayTitle,
  formatDateTime,
  moveMonth,
  startOfMonth,
  zonedLocalToUtc
} from "../utils/date.js";
import { themeVariables } from "../utils/theme.js";
import { MonthCalendar, type MonthCalendarMarker } from "./MonthCalendar.js";

export interface BookingCalendarProps {
  services: BookingService[];
  plans?: BookingPlan[];
  staff?: BookingStaff[];
  adapter: BookingAdapter;
  schedule: ScheduleData;
  configuration?: BookingConfiguration;
  availabilityProvider?: AvailabilityProvider;
  initialDate?: string;
  onBooked?: (booking: Booking) => void;
  className?: string;
}

function priceLabel(price: number | undefined, currency: string, locale: string): string {
  if (price == null) return "Pris etter avtale";
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export function BookingCalendar({
  services,
  plans = [],
  staff = [],
  adapter,
  schedule,
  configuration,
  availabilityProvider = defaultAvailabilityProvider,
  initialDate,
  onBooked,
  className = ""
}: BookingCalendarProps) {
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
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [monthBookings, setMonthBookings] = useState<Booking[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [customValues, setCustomValues] = useState<Record<string, string | boolean>>({});

  const categories = useMemo(() => ["all", ...Array.from(new Set(activeServices.map((service) => service.category).filter(Boolean) as string[]))], [activeServices]);
  const filteredServices = useMemo(() => {
    const query = serviceSearch.trim().toLowerCase();
    return activeServices.filter((service) => {
      if (category !== "all" && service.category !== category) return false;
      if (query && !`${service.name} ${service.description ?? ""}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [activeServices, category, serviceSearch]);
  const selectedService = activeServices.find((service) => service.id === serviceId);
  const allowedPlans = activePlans.filter((plan) => !plan.serviceIds?.length || plan.serviceIds.includes(serviceId));
  const allowedStaff = activeStaff.filter((person) => {
    if (person.serviceIds?.length && !person.serviceIds.includes(serviceId)) return false;
    if (selectedService?.staffIds?.length && !selectedService.staffIds.includes(person.id)) return false;
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
    const result: Record<string, MonthCalendarMarker> = {};
    const counts = bookingCountByDate(monthBookings, config.timeZone);
    for (const [date, count] of counts) result[date] = { count };
    for (const override of schedule.overrides) {
      result[override.date] = {
        ...result[override.date],
        color: override.color ?? (override.closed ? "#dc2626" : "#2563eb"),
        label: override.label ?? (override.closed ? config.labels.closed : undefined)
      };
    }
    return result;
  }, [config.labels.closed, config.timeZone, monthBookings, schedule.overrides]);

  function isDateDisabled(date: string): boolean {
    if (!config.allowPastDates && compareDateKeys(date, today) < 0) return true;
    if (compareDateKeys(date, addDaysToKey(today, config.bookingWindowDays)) > 0) return true;
    const override = schedule.overrides.find((item) => item.date === date);
    return override?.closed === true;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
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
    } catch (error) {
      setMessage(error instanceof Error && error.message === "BOOKING_CONFLICT" ? "Tiden ble nettopp tatt. Velg et annet tidspunkt." : "Bestillingen kunne ikke lagres. Prøv igjen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className={`vb-root vb-booking vb-layout--${config.layout} ${config.animations ? "vb-animate" : ""} ${className}`}
      style={themeVariables(config.theme)}
    >
      <header className="vb-hero">
        <span className="vb-eyebrow">Vedøy Booking</span>
        <h2>{config.labels.title}</h2>
        <p>{config.labels.subtitle}</p>
      </header>

      <div className="vb-booking__layout">
        <aside className="vb-panel vb-service-panel">
          <div className="vb-section-heading">
            <span className="vb-step">1</span>
            <div><h3>{config.labels.chooseService}</h3><p>Filtrer og velg det som passer.</p></div>
          </div>

          <input className="vb-input" value={serviceSearch} onChange={(event) => setServiceSearch(event.target.value)} placeholder="Søk i tjenester…" />
          {config.showCategories && categories.length > 2 && (
            <div className="vb-chips">
              {categories.map((item) => (
                <button type="button" key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>
                  {item === "all" ? "Alle" : item}
                </button>
              ))}
            </div>
          )}

          <div className="vb-service-list">
            {filteredServices.map((service) => (
              <button
                type="button"
                key={service.id}
                className={`vb-service-card ${service.id === serviceId ? "is-selected" : ""}`}
                style={{ "--vb-item-color": service.color ?? config.theme.accent } as React.CSSProperties}
                onClick={() => { setServiceId(service.id); setPlanId(""); setStaffId(""); }}
              >
                <span className="vb-service-card__color" />
                {service.icon && <span className="vb-service-card__icon">{service.icon}</span>}
                <span className="vb-service-card__body">
                  <strong>{service.name}</strong>
                  <small>{service.durationMinutes} min · {priceLabel(service.price, service.currency ?? config.currency, config.locale)}</small>
                  {service.description && <em>{service.description}</em>}
                </span>
                <span className="vb-check">✓</span>
              </button>
            ))}
            {filteredServices.length === 0 && <div className="vb-empty">Ingen tjenester passer filteret.</div>}
          </div>

          {config.showPlans && allowedPlans.length > 0 && (
            <div className="vb-subsection">
              <h4>{config.labels.choosePlan}</h4>
              <div className="vb-plan-list">
                <button type="button" className={`vb-plan-chip ${planId === "" ? "is-selected" : ""}`} onClick={() => setPlanId("")}>Ingen plan</button>
                {allowedPlans.map((plan) => (
                  <button type="button" key={plan.id} className={`vb-plan-chip ${planId === plan.id ? "is-selected" : ""}`} style={{ "--vb-item-color": plan.color ?? config.theme.accent } as React.CSSProperties} onClick={() => setPlanId(plan.id)}>
                    {plan.popular && <span>★</span>} {plan.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {config.showStaff && allowedStaff.length > 0 && (
            <label className="vb-field">
              <span>{config.labels.chooseStaff}</span>
              <select value={staffId} onChange={(event) => setStaffId(event.target.value)}>
                <option value="">Første ledige</option>
                {allowedStaff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
              </select>
            </label>
          )}
          {activeLocations.length > 0 && (
            <label className="vb-field">
              <span>{config.labels.chooseLocation}</span>
              <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
                <option value="">Velg lokasjon</option>
                {activeLocations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
              </select>
            </label>
          )}
        </aside>

        <main className="vb-panel vb-calendar-panel">
          <div className="vb-section-heading">
            <span className="vb-step">2</span>
            <div><h3>{config.labels.chooseDate}</h3><p>Klikk på en dato og velg tid.</p></div>
          </div>
          <MonthCalendar
            month={visibleMonth}
            selectedDate={selectedDate}
            locale={config.locale}
            timeZone={config.timeZone}
            weekStartsOn={config.weekStartsOn}
            markers={markers}
            isDateDisabled={isDateDisabled}
            onSelectDate={(date) => { setSelectedDate(date); setVisibleMonth(startOfMonth(date)); }}
            onPreviousMonth={() => setVisibleMonth(moveMonth(visibleMonth, -1))}
            onNextMonth={() => setVisibleMonth(moveMonth(visibleMonth, 1))}
            onToday={() => { setSelectedDate(today); setVisibleMonth(startOfMonth(today)); }}
            todayLabel={config.labels.today}
          />

          <section className="vb-times" key={`${selectedDate}-${serviceId}-${staffId}`}>
            <div className="vb-times__heading">
              <div><h4>{config.labels.chooseTime}</h4><p>{dayTitle(selectedDate, config.locale)}</p></div>
              {selectedService && <span className="vb-duration">{selectedService.durationMinutes} min</span>}
            </div>
            {loadingSlots ? <div className="vb-skeleton-grid">{Array.from({ length: 8 }, (_, index) => <span key={index} />)}</div> : (
              <div className="vb-time-grid">
                {slots.filter((slot) => slot.available).map((slot) => (
                  <button type="button" key={slot.id} className={selectedSlotId === slot.id ? "is-selected" : ""} onClick={() => setSelectedSlotId(slot.id)}>
                    {slot.label}
                    {typeof slot.remainingCapacity === "number" && slot.remainingCapacity > 1 && <small>{slot.remainingCapacity} ledige</small>}
                  </button>
                ))}
                {slots.filter((slot) => slot.available).length === 0 && <div className="vb-empty vb-empty--wide">{config.labels.noTimes}</div>}
              </div>
            )}
          </section>
        </main>

        <aside className="vb-panel vb-summary-panel">
          <div className="vb-section-heading">
            <span className="vb-step">3</span>
            <div><h3>{config.labels.yourDetails}</h3><p>Kontroller valgene og fullfør.</p></div>
          </div>

          <div className="vb-summary">
            <div><span>Tjeneste</span><strong>{selectedService?.name ?? "Ikke valgt"}</strong></div>
            <div><span>Dato og tid</span><strong>{selectedSlot ? formatDateTime(selectedSlot.startsAt, config.locale, config.timeZone) : "Ikke valgt"}</strong></div>
            {planId && <div><span>Plan</span><strong>{activePlans.find((plan) => plan.id === planId)?.name}</strong></div>}
            {staffId && <div><span>Medarbeider</span><strong>{activeStaff.find((person) => person.id === staffId)?.name}</strong></div>}
          </div>

          <form className="vb-form" onSubmit={submit}>
            <label className="vb-field"><span>Navn *</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
            <label className="vb-field"><span>E-post *</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
            <label className="vb-field"><span>Telefon{config.requirePhone ? " *" : ""}</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" /></label>
            <label className="vb-field"><span>Kommentar</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} /></label>

            {config.customFields.map((field) => (
              <label className="vb-field" key={field.id}>
                <span>{field.label}{field.required ? " *" : ""}</span>
                {field.type === "textarea" ? (
                  <textarea rows={3} placeholder={field.placeholder} value={String(customValues[field.id] ?? "")} onChange={(event) => setCustomValues((current) => ({ ...current, [field.id]: event.target.value }))} />
                ) : field.type === "select" ? (
                  <select value={String(customValues[field.id] ?? "")} onChange={(event) => setCustomValues((current) => ({ ...current, [field.id]: event.target.value }))}>
                    <option value="">Velg…</option>
                    {field.options?.map((option) => <option value={option} key={option}>{option}</option>)}
                  </select>
                ) : field.type === "checkbox" ? (
                  <span className="vb-checkbox"><input type="checkbox" checked={Boolean(customValues[field.id])} onChange={(event) => setCustomValues((current) => ({ ...current, [field.id]: event.target.checked }))} /> Ja</span>
                ) : (
                  <input type={field.type} placeholder={field.placeholder} value={String(customValues[field.id] ?? "")} onChange={(event) => setCustomValues((current) => ({ ...current, [field.id]: event.target.value }))} />
                )}
                {field.helpText && <small>{field.helpText}</small>}
              </label>
            ))}

            <button className="vb-button vb-button--primary" disabled={submitting || !selectedSlot || !selectedService}>
              {submitting ? "Lagrer…" : config.labels.confirm}
            </button>
            {message && <p className={`vb-message ${message === config.labels.bookingSuccess ? "is-success" : ""}`} role="status">{message}</p>}
          </form>
        </aside>
      </div>
    </section>
  );
}

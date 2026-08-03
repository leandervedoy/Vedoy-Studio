"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mergeConfiguration } from "../defaults.js";
import type { Booking, BookingAdapter, BookingConfiguration, BookingPlan, BookingService, BookingStaff, BookingStatus } from "../types.js";
import { addDaysToKey, addMinutes, calendarGrid, dateKeyInTimeZone, dayTitle, formatDateTime, moveMonth, startOfMonth, zonedLocalToUtc } from "../utils/date.js";
import { themeVariables } from "../utils/theme.js";
import { MonthCalendar, type MonthCalendarMarker } from "./MonthCalendar.js";

export interface BookingAdminCalendarProps {
  adapter: BookingAdapter;
  services: BookingService[];
  plans?: BookingPlan[];
  staff?: BookingStaff[];
  configuration?: BookingConfiguration;
  initialDate?: string;
  className?: string;
}

const statuses: Array<BookingStatus | "all"> = ["all", "pending", "confirmed", "in-progress", "completed", "cancelled", "no-show"];
const statusLabels: Record<BookingStatus | "all", string> = {
  all: "Alle statuser",
  pending: "Avventer",
  confirmed: "Bekreftet",
  "in-progress": "Pågår",
  completed: "Fullført",
  cancelled: "Avbestilt",
  "no-show": "Ikke møtt"
};

export function BookingAdminCalendar({ adapter, services, plans = [], staff = [], configuration, initialDate, className = "" }: BookingAdminCalendarProps) {
  const config = useMemo(() => mergeConfiguration(configuration), [configuration]);
  const today = dateKeyInTimeZone(new Date(), config.timeZone);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(initialDate ?? today));
  const [selectedDate, setSelectedDate] = useState(initialDate ?? today);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
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
      if (status !== "all" && booking.status !== status) return false;
      if (serviceId !== "all" && booking.serviceId !== serviceId) return false;
      if (staffId !== "all" && booking.staffId !== staffId) return false;
      if (normalizedQuery) {
        const haystack = `${booking.customer.name} ${booking.customer.email} ${booking.customer.phone ?? ""} ${booking.notes ?? ""}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [bookings, query, serviceId, staffId, status]);

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const booking of filtered) {
      const date = dateKeyInTimeZone(new Date(booking.startsAt), config.timeZone);
      const current = map.get(date) ?? [];
      current.push(booking);
      map.set(date, current.sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
    }
    return map;
  }, [config.timeZone, filtered]);

  const markers = useMemo<Record<string, MonthCalendarMarker>>(() => {
    const result: Record<string, MonthCalendarMarker> = {};
    for (const [date, items] of bookingsByDate) {
      result[date] = { count: items.length, color: services.find((service) => service.id === items[0]?.serviceId)?.color ?? config.theme.accent };
    }
    return result;
  }, [bookingsByDate, config.theme.accent, services]);

  const selectedBookings = bookingsByDate.get(selectedDate) ?? [];

  async function updateStatus(id: string, nextStatus: BookingStatus) {
    await adapter.update(id, { status: nextStatus });
    await refresh();
  }

  async function remove(id: string) {
    if (typeof window !== "undefined" && !window.confirm("Slette bestillingen permanent?")) return;
    await adapter.remove(id);
    await refresh();
  }

  return (
    <section className={`vb-root vb-admin-suite ${config.animations ? "vb-animate" : ""} ${className}`} style={themeVariables(config.theme)}>
      <header className="vb-hero vb-hero--admin">
        <span className="vb-eyebrow">Bookingadministrasjon</span>
        <h2>Kalender og bestillinger</h2>
        <p>En Outlook-lignende oversikt med filtre, farger og direkte statusendring.</p>
      </header>

      <div className="vb-filterbar">
        <input className="vb-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Søk etter kunde…" />
        <select value={status} onChange={(event) => setStatus(event.target.value as BookingStatus | "all")}>{statuses.map((item) => <option value={item} key={item}>{statusLabels[item]}</option>)}</select>
        <select value={serviceId} onChange={(event) => setServiceId(event.target.value)}><option value="all">Alle tjenester</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>
        {staff.length > 0 && <select value={staffId} onChange={(event) => setStaffId(event.target.value)}><option value="all">Alle medarbeidere</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select>}
      </div>

      <div className="vb-editor-layout vb-editor-layout--admin">
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
            renderDateContent={(date) => {
              const items = bookingsByDate.get(date) ?? [];
              return (
                <span className="vb-calendar-events">
                  {items.slice(0, 3).map((booking) => {
                    const service = services.find((item) => item.id === booking.serviceId);
                    return <span key={booking.id} className={`vb-calendar-event is-${booking.status}`} style={{ "--vb-event-color": service?.color ?? config.theme.accent } as React.CSSProperties}>{booking.customer.name}</span>;
                  })}
                  {items.length > 3 && <small>+{items.length - 3} flere</small>}
                </span>
              );
            }}
          />
        </main>

        <aside className="vb-panel vb-day-agenda" key={selectedDate}>
          <div className="vb-section-heading">
            <span className="vb-step">{selectedBookings.length}</span>
            <div><h3>{dayTitle(selectedDate, config.locale)}</h3><p>{loading ? "Laster…" : `${selectedBookings.length} bestilling${selectedBookings.length === 1 ? "" : "er"}`}</p></div>
          </div>

          <div className="vb-agenda-list">
            {selectedBookings.map((booking) => {
              const service = services.find((item) => item.id === booking.serviceId);
              const plan = plans.find((item) => item.id === booking.planId);
              const person = staff.find((item) => item.id === booking.staffId);
              return (
                <article className="vb-agenda-card" key={booking.id} style={{ "--vb-event-color": service?.color ?? config.theme.accent } as React.CSSProperties}>
                  <span className="vb-agenda-card__bar" />
                  <div className="vb-agenda-card__top">
                    <div><strong>{booking.customer.name}</strong><small>{formatDateTime(booking.startsAt, config.locale, config.timeZone)}</small></div>
                    <select className={`vb-status is-${booking.status}`} value={booking.status} onChange={(event) => void updateStatus(booking.id, event.target.value as BookingStatus)}>
                      {statuses.filter((item): item is BookingStatus => item !== "all").map((item) => <option value={item} key={item}>{statusLabels[item]}</option>)}
                    </select>
                  </div>
                  <dl>
                    <div><dt>Tjeneste</dt><dd>{service?.name ?? booking.serviceId}</dd></div>
                    {plan && <div><dt>Plan</dt><dd>{plan.name}</dd></div>}
                    {person && <div><dt>Medarbeider</dt><dd>{person.name}</dd></div>}
                    <div><dt>Kontakt</dt><dd>{booking.customer.email}{booking.customer.phone ? ` · ${booking.customer.phone}` : ""}</dd></div>
                  </dl>
                  {booking.notes && <p>{booking.notes}</p>}
                  <button type="button" className="vb-link-danger" onClick={() => void remove(booking.id)}>Slett permanent</button>
                </article>
              );
            })}
            {!loading && selectedBookings.length === 0 && <div className="vb-empty">Ingen bestillinger denne dagen.</div>}
          </div>
        </aside>
      </div>
    </section>
  );
}

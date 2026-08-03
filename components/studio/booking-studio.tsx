"use client";

import { useMemo, useState } from "react";
import {
  BookingAdminCalendar,
  BookingCalendar,
  BookingCatalogManager,
  ScheduleCalendarEditor,
  type BookingPlan,
  type BookingService,
  type ScheduleData
} from "@vedoy/booking";
import { ApiBookingAdapter } from "@/components/booking/api-booking-adapter";
import {
  bookingConfiguration,
  bookingPlans,
  bookingSchedule,
  bookingServices,
  bookingStaff
} from "@/lib/booking-config";

export function BookingStudio() {
  const adapter = useMemo(() => new ApiBookingAdapter(), []);
  const scheduleAdapter = useMemo(() => ({
    async getSchedule() {
      if (typeof window === "undefined") return bookingSchedule;
      const raw = window.localStorage.getItem("vedoy-studio-schedule");
      if (!raw) return bookingSchedule;
      try {
        return JSON.parse(raw) as ScheduleData;
      } catch {
        window.localStorage.removeItem("vedoy-studio-schedule");
        return bookingSchedule;
      }
    },
    async saveSchedule(value: ScheduleData) {
      const saved = { ...value, updatedAt: new Date().toISOString() };
      window.localStorage.setItem("vedoy-studio-schedule", JSON.stringify(saved));
      return saved;
    }
  }), []);
  const [tab, setTab] = useState<"calendar" | "customer" | "hours" | "catalog">("calendar");
  const [services, setServices] = useState<BookingService[]>(bookingServices);
  const [plans, setPlans] = useState<BookingPlan[]>(bookingPlans);
  const [schedule, setSchedule] = useState<ScheduleData>(bookingSchedule);

  return (
    <section className="booking-studio">
      <nav className="segmented-tabs" aria-label="Bookingvisninger">
        <button className={tab === "calendar" ? "is-active" : ""} onClick={() => setTab("calendar")}>Bestillinger</button>
        <button className={tab === "customer" ? "is-active" : ""} onClick={() => setTab("customer")}>Kundevisning</button>
        <button className={tab === "hours" ? "is-active" : ""} onClick={() => setTab("hours")}>Åpningstider</button>
        <button className={tab === "catalog" ? "is-active" : ""} onClick={() => setTab("catalog")}>Tjenester og planer</button>
      </nav>
      <div className="booking-studio__content">
        {tab === "calendar" && <BookingAdminCalendar services={services} plans={plans} staff={bookingStaff} adapter={adapter} configuration={bookingConfiguration} />}
        {tab === "customer" && <BookingCalendar services={services} plans={plans} staff={bookingStaff} adapter={adapter} schedule={schedule} configuration={bookingConfiguration} />}
        {tab === "hours" && <ScheduleCalendarEditor adapter={scheduleAdapter} configuration={bookingConfiguration} onChange={setSchedule} />}
        {tab === "catalog" && <BookingCatalogManager services={services} plans={plans} onServicesChange={setServices} onPlansChange={setPlans} configuration={bookingConfiguration} />}
      </div>
      <p className="demo-disclaimer">Bookinger lagres i API/database. Endringer i tjenester og åpningstider er foreløpig lokale i nettleseren til administrasjons-API er koblet til.</p>
    </section>
  );
}

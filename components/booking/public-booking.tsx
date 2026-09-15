"use client";

import { useMemo } from "react";
import { BookingCalendar } from "@vedoy/booking";
import { ApiBookingAdapter } from "@/components/booking/api-booking-adapter";
import {
  bookingConfiguration,
  bookingPlans,
  bookingSchedule,
  bookingServices,
  bookingStaff
} from "@/lib/booking-config";

export function PublicBooking({ embedded = false }: { embedded?: boolean }) {
  const adapter = useMemo(() => new ApiBookingAdapter(), []);
  const publicConfiguration = { ...bookingConfiguration, showPlans: false };
  return (
    <BookingCalendar
      services={bookingServices}
      plans={bookingPlans}
      staff={bookingStaff}
      adapter={adapter}
      schedule={bookingSchedule}
      configuration={embedded ? { ...publicConfiguration, layout: "embedded" } : publicConfiguration}
    />
  );
}

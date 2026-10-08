"use client";

import dynamic from "next/dynamic";

const PublicBooking = dynamic(
  () => import("@/components/booking/public-booking").then((module) => module.PublicBooking),
  {
    ssr: false,
    loading: () => <div className="demo-disclaimer" role="status">Laster bookingkalender …</div>
  }
);

export function PublicBookingIsland() {
  return <PublicBooking />;
}

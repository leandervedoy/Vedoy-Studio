"use client";

import { useEffect, useId } from "react";
import { PublicBooking } from "@/components/booking/public-booking";

export function BookingDialog({ onClose }: { onClose: () => void }) {
  const titleId = useId();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="booking-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button className="booking-dialog__backdrop" type="button" onClick={onClose} aria-label="Lukk bestilling" />
      <section className="booking-dialog__panel">
        <header>
          <div>
            <small>VEDØY BOOKING</small>
            <h2 id={titleId}>Bestill en time</h2>
            <p>Velg tjeneste, dato og tidspunkt. Bestillingen lagres som en forespørsel.</p>
          </div>
          <button className="booking-dialog__close" type="button" onClick={onClose} aria-label="Lukk bestilling" autoFocus>×</button>
        </header>
        <div className="booking-dialog__notice">
          Ingen betaling trekkes. Vedøy bekrefter tidspunktet etter at forespørselen er mottatt.
        </div>
        <div className="booking-dialog__content">
          <PublicBooking embedded />
        </div>
      </section>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";

const BookingDialog = dynamic(
  () => import("@/components/booking/booking-dialog").then((module) => module.BookingDialog),
  { ssr: false }
);

export function BookingFloatingAction() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  if (pathname === "/booking") return null;

  return (
    <>
      <button
        ref={triggerRef}
        className="booking-floating-action"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>Bestill time</span>
        <b aria-hidden>↗</b>
      </button>
      {open ? <BookingDialog onClose={close} /> : null}
    </>
  );
}

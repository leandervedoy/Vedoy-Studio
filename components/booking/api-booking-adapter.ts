import type { Booking, BookingAdapter, BookingFilters, BookingInput } from "@vedoy/booking";
import { bookingServices } from "@/lib/booking-config";
import type { StudioBooking } from "@/lib/types";

function toPackageBooking(booking: StudioBooking): Booking {
  return {
    id: booking.id,
    serviceId: booking.serviceId,
    planId: booking.planId,
    staffId: booking.staffId,
    location: booking.location,
    customFields: booking.customFields,
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    customer: {
      name: booking.customerName,
      email: booking.customerEmail,
      phone: booking.customerPhone
    },
    notes: booking.notes,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.createdAt
  };
}

export class ApiBookingAdapter implements BookingAdapter {
  async create(input: BookingInput): Promise<Booking> {
    const service = bookingServices.find((item) => item.id === input.serviceId);
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: input.serviceId,
        serviceName: service?.name ?? input.serviceId,
        planId: input.planId,
        staffId: input.staffId,
        location: input.location,
        customFields: input.customFields,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        customerName: input.customer.name,
        customerEmail: input.customer.email,
        customerPhone: input.customer.phone,
        notes: input.notes
      })
    });
    const data = await response.json() as { booking?: StudioBooking; error?: string };
    if (!response.ok || !data.booking) throw new Error(data.error || "Kunne ikke lagre bookingen.");
    return toPackageBooking(data.booking);
  }

  async list(filters?: BookingFilters): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    if (filters?.status && filters.status !== "all") params.set("status", filters.status);
    if (filters?.serviceId && filters.serviceId !== "all") params.set("serviceId", filters.serviceId);
    if (filters?.staffId && filters.staffId !== "all") params.set("staffId", filters.staffId);
    const query = params.toString();
    const response = await fetch(`/api/bookings${query ? `?${query}` : ""}`, { cache: "no-store" });
    if (response.status === 401) return [];
    const data = await response.json() as { bookings?: StudioBooking[] };
    return (data.bookings ?? []).map(toPackageBooking);
  }

  async update(id: string, patch: Partial<Booking>): Promise<Booking> {
    const response = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: patch.status, startsAt: patch.startsAt, endsAt: patch.endsAt, notes: patch.notes })
    });
    const data = await response.json() as { booking?: StudioBooking; error?: string };
    if (!response.ok || !data.booking) throw new Error(data.error || "Kunne ikke oppdatere bookingen.");
    return toPackageBooking(data.booking);
  }

  async cancel(id: string): Promise<Booking> {
    return this.update(id, { status: "cancelled" });
  }

  async remove(id: string): Promise<void> {
    const response = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Kunne ikke slette bookingen.");
  }
}

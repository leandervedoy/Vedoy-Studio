import { bookingConflicts } from "../utils/availability.js";
function createId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto)
        return crypto.randomUUID();
    return `booking_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function matchesFilters(booking, filters) {
    if (!filters)
        return true;
    if (filters.status && filters.status !== "all" && booking.status !== filters.status)
        return false;
    if (filters.serviceId && filters.serviceId !== "all" && booking.serviceId !== filters.serviceId)
        return false;
    if (filters.planId && filters.planId !== "all" && booking.planId !== filters.planId)
        return false;
    if (filters.staffId && filters.staffId !== "all" && booking.staffId !== filters.staffId)
        return false;
    if (filters.from && booking.startsAt < filters.from)
        return false;
    if (filters.to && booking.startsAt > filters.to)
        return false;
    const query = filters.query?.trim().toLowerCase();
    if (query) {
        const haystack = [booking.customer.name, booking.customer.email, booking.customer.phone, booking.notes]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        if (!haystack.includes(query))
            return false;
    }
    return true;
}
export class LocalStorageBookingAdapter {
    constructor(storageKey = "vedoy-bookings-v2") {
        this.storageKey = storageKey;
    }
    read() {
        if (typeof window === "undefined")
            return [];
        const raw = window.localStorage.getItem(this.storageKey);
        if (!raw)
            return [];
        try {
            return JSON.parse(raw);
        }
        catch {
            return [];
        }
    }
    write(bookings) {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(this.storageKey, JSON.stringify(bookings));
        }
    }
    async create(input) {
        const bookings = this.read();
        if (bookingConflicts(input, bookings)) {
            throw new Error("BOOKING_CONFLICT");
        }
        const now = new Date().toISOString();
        const { initialStatus, ...bookingInput } = input;
        const booking = {
            ...bookingInput,
            id: createId(),
            status: initialStatus ?? "confirmed",
            createdAt: now,
            updatedAt: now
        };
        this.write([booking, ...bookings]);
        return booking;
    }
    async list(filters) {
        return this.read()
            .filter((booking) => matchesFilters(booking, filters))
            .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    }
    async get(id) {
        return this.read().find((booking) => booking.id === id) ?? null;
    }
    async update(id, patch) {
        const bookings = this.read();
        const current = bookings.find((booking) => booking.id === id);
        if (!current)
            throw new Error("BOOKING_NOT_FOUND");
        const updated = {
            ...current,
            ...patch,
            id: current.id,
            createdAt: current.createdAt,
            updatedAt: new Date().toISOString()
        };
        const otherBookings = bookings.filter((booking) => booking.id !== id);
        const schedulingChanged = patch.startsAt !== undefined || patch.endsAt !== undefined || patch.serviceId !== undefined ||
            patch.staffId !== undefined || patch.metadata !== undefined ||
            (current.status === "cancelled" && updated.status !== "cancelled");
        if (schedulingChanged && bookingConflicts(updated, otherBookings))
            throw new Error("BOOKING_CONFLICT");
        this.write(bookings.map((booking) => booking.id === id ? updated : booking));
        return updated;
    }
    async cancel(id) {
        return this.update(id, { status: "cancelled" });
    }
    async remove(id) {
        this.write(this.read().filter((booking) => booking.id !== id));
    }
    async hasConflict(input) {
        return bookingConflicts(input, this.read());
    }
}
//# sourceMappingURL=LocalStorageBookingAdapter.js.map
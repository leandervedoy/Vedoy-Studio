import type { Booking, BookingAdapter, BookingFilters, BookingInput } from "../types.js";
export declare class LocalStorageBookingAdapter implements BookingAdapter {
    private readonly storageKey;
    constructor(storageKey?: string);
    private read;
    private write;
    create(input: BookingInput): Promise<Booking>;
    list(filters?: BookingFilters): Promise<Booking[]>;
    get(id: string): Promise<Booking | null>;
    update(id: string, patch: Partial<Booking>): Promise<Booking>;
    cancel(id: string): Promise<Booking>;
    remove(id: string): Promise<void>;
    hasConflict(input: BookingInput): Promise<boolean>;
}
//# sourceMappingURL=LocalStorageBookingAdapter.d.ts.map
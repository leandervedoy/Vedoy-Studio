import type { AvailabilityProvider, Booking, BookingInput } from "../types.js";
export declare const defaultAvailabilityProvider: AvailabilityProvider;
export declare function bookingConflicts(candidate: BookingInput, bookings: Booking[]): boolean;
export declare function bookingCountByDate(bookings: Booking[], timeZone: string): Map<string, number>;
//# sourceMappingURL=availability.d.ts.map
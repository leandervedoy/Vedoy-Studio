import type { AvailabilityProvider, Booking, BookingAdapter, BookingConfiguration, BookingPlan, BookingService, BookingStaff, ScheduleData } from "../types.js";
export interface BookingCalendarProps {
    services: BookingService[];
    plans?: BookingPlan[];
    staff?: BookingStaff[];
    adapter: BookingAdapter;
    schedule: ScheduleData;
    configuration?: BookingConfiguration;
    availabilityProvider?: AvailabilityProvider;
    initialDate?: string;
    onBooked?: (booking: Booking) => void;
    className?: string;
}
export declare function BookingCalendar({ services, plans, staff, adapter, schedule, configuration, availabilityProvider, initialDate, onBooked, className }: BookingCalendarProps): import("react").JSX.Element;
//# sourceMappingURL=BookingCalendar.d.ts.map
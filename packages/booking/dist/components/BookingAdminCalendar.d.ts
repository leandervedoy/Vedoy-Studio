import type { BookingAdapter, BookingConfiguration, BookingPlan, BookingService, BookingStaff } from "../types.js";
export interface BookingAdminCalendarProps {
    adapter: BookingAdapter;
    services: BookingService[];
    plans?: BookingPlan[];
    staff?: BookingStaff[];
    configuration?: BookingConfiguration;
    initialDate?: string;
    className?: string;
}
export declare function BookingAdminCalendar({ adapter, services, plans, staff, configuration, initialDate, className }: BookingAdminCalendarProps): import("react").JSX.Element;
//# sourceMappingURL=BookingAdminCalendar.d.ts.map
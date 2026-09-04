import type { AvailabilityProvider, AvailabilitySlot, Booking, BookingInput, BookingService, ScheduleData, TimeRange } from "../types.js";
import { addMinutes, dateKeyInTimeZone, formatTime, minutesFromTime, timeFromMinutes, weekdayForDateKey, zonedLocalToUtc } from "./date.js";

function rangesForDate(date: string, schedule: ScheduleData): TimeRange[] {
  const override = schedule.overrides.find((item) => item.date === date);
  if (override?.closed) return [];
  if (override?.ranges?.length) return override.ranges;
  return schedule.weeklyHours[weekdayForDateKey(date)] ?? [];
}

function overlaps(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB;
}

function requestStaffMismatch(requestedStaffId: string | undefined, bookingStaffId: string | undefined): boolean {
  return Boolean(requestedStaffId && bookingStaffId && requestedStaffId !== bookingStaffId);
}

export const defaultAvailabilityProvider: AvailabilityProvider = ({ date, service, staffId, schedule, bookings, configuration }) => {
  const now = Date.now();
  const earliest = now + configuration.minNoticeMinutes * 60_000;
  const latest = now + configuration.bookingWindowDays * 86_400_000;
  const ranges = rangesForDate(date, schedule);
  const slots: AvailabilitySlot[] = [];
  const interval = configuration.slotIntervalMinutes;
  const duration = service.durationMinutes + (service.bufferBeforeMinutes ?? 0) + (service.bufferAfterMinutes ?? 0);
  const capacity = service.capacity ?? 1;

  for (const range of ranges) {
    const rangeStart = minutesFromTime(range.start);
    const rangeEnd = minutesFromTime(range.end);
    for (let minute = rangeStart; minute + duration <= rangeEnd; minute += interval) {
      const startsAt = zonedLocalToUtc(date, timeFromMinutes(minute), configuration.timeZone);
      const visibleStartsAt = addMinutes(startsAt, service.bufferBeforeMinutes ?? 0);
      const endsAt = addMinutes(visibleStartsAt, service.durationMinutes);
      const timestamp = new Date(startsAt).getTime();
      if (timestamp < earliest || timestamp > latest) continue;
      const slotEnd = new Date(addMinutes(startsAt, duration)).getTime();
      const overlappingBookings = bookings.filter((booking) => {
        if (booking.status === "cancelled") return false;
        if (requestStaffMismatch(staffId, booking.staffId)) return false;
        const bookingStart = new Date(String(booking.metadata?.blockedStartsAt ?? booking.startsAt)).getTime();
        const bookingEnd = new Date(String(booking.metadata?.blockedEndsAt ?? booking.endsAt)).getTime();
        return overlaps(timestamp, slotEnd, bookingStart, bookingEnd);
      });
      const blockedByOtherService = overlappingBookings.some((booking) => booking.serviceId !== service.id);
      const sameServiceConflicts = overlappingBookings.filter((booking) => booking.serviceId === service.id).length;
      const remainingCapacity = blockedByOtherService ? 0 : Math.max(0, capacity - sameServiceConflicts);
      slots.push({
        id: `${service.id}:${startsAt}`,
        startsAt: visibleStartsAt,
        endsAt,
        label: formatTime(visibleStartsAt, configuration.locale, configuration.timeZone),
        available: remainingCapacity > 0,
        remainingCapacity,
        reason: remainingCapacity > 0 ? undefined : "fully-booked"
      });
    }
  }
  return slots;
};

export function bookingConflicts(candidate: BookingInput, bookings: Booking[]): boolean {
  const start = new Date(String(candidate.metadata?.blockedStartsAt ?? candidate.startsAt)).getTime();
  const end = new Date(String(candidate.metadata?.blockedEndsAt ?? candidate.endsAt)).getTime();
  const capacity = Math.max(1, Number(candidate.metadata?.capacity ?? 1));
  const overlappingBookings = bookings.filter((booking) => {
    if (booking.status === "cancelled") return false;
    if (requestStaffMismatch(candidate.staffId, booking.staffId)) return false;
    const bookingStart = new Date(String(booking.metadata?.blockedStartsAt ?? booking.startsAt)).getTime();
    const bookingEnd = new Date(String(booking.metadata?.blockedEndsAt ?? booking.endsAt)).getTime();
    return overlaps(start, end, bookingStart, bookingEnd);
  });
  if (overlappingBookings.some((booking) => booking.serviceId !== candidate.serviceId)) return true;
  return overlappingBookings.filter((booking) => booking.serviceId === candidate.serviceId).length >= capacity;
}

export function bookingCountByDate(bookings: Booking[], timeZone: string): Map<string, number> {
  const result = new Map<string, number>();
  for (const booking of bookings) {
    if (booking.status === "cancelled") continue;
    const key = dateKeyInTimeZone(new Date(booking.startsAt), timeZone);
    result.set(key, (result.get(key) ?? 0) + 1);
  }
  return result;
}

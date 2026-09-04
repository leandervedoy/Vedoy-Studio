import type { Weekday } from "../types.js";
export declare function pad(value: number): string;
export declare function dateKeyFromParts(year: number, month: number, day: number): string;
export declare function parseDateKey(dateKey: string): {
    year: number;
    month: number;
    day: number;
};
export declare function addDaysToKey(dateKey: string, amount: number): string;
export declare function compareDateKeys(a: string, b: string): number;
export declare function dateKeyInTimeZone(date: Date, timeZone: string): string;
export declare function weekdayForDateKey(dateKey: string): Weekday;
export declare function monthKey(dateKey: string): string;
export declare function moveMonth(dateKey: string, amount: number): string;
export declare function startOfMonth(dateKey: string): string;
export declare function daysInMonth(dateKey: string): number;
export declare function calendarGrid(dateKey: string, weekStartsOn: 0 | 1): string[];
export declare function monthTitle(dateKey: string, locale: string): string;
export declare function dayTitle(dateKey: string, locale: string): string;
export declare function weekdayLabels(locale: string, weekStartsOn: 0 | 1, narrow?: boolean): string[];
export declare function formatTime(iso: string, locale: string, timeZone: string): string;
export declare function formatDateTime(iso: string, locale: string, timeZone: string): string;
export declare function minutesFromTime(value: string): number;
export declare function timeFromMinutes(value: number): string;
export declare function addMinutes(iso: string, minutes: number): string;
export declare function zonedLocalToUtc(dateKey: string, time: string, timeZone: string): string;
//# sourceMappingURL=date.d.ts.map
import type { Weekday } from "../types.js";

export function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function dateKeyFromParts(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

export function addDaysToKey(dateKey: string, amount: number): string {
  const { year, month, day } = parseDateKey(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day + amount, 12));
  return dateKeyFromParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function compareDateKeys(a: string, b: string): number {
  return a.localeCompare(b);
}

export function dateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function weekdayForDateKey(dateKey: string): Weekday {
  const { year, month, day } = parseDateKey(dateKey);
  return new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay() as Weekday;
}

export function monthKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function moveMonth(dateKey: string, amount: number): string {
  const { year, month } = parseDateKey(dateKey);
  const date = new Date(Date.UTC(year, month - 1 + amount, 1, 12));
  return dateKeyFromParts(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
}

export function startOfMonth(dateKey: string): string {
  return `${dateKey.slice(0, 7)}-01`;
}

export function daysInMonth(dateKey: string): number {
  const { year, month } = parseDateKey(dateKey);
  return new Date(Date.UTC(year, month, 0, 12)).getUTCDate();
}

export function calendarGrid(dateKey: string, weekStartsOn: 0 | 1): string[] {
  const first = startOfMonth(dateKey);
  const firstWeekday = weekdayForDateKey(first);
  const offset = (firstWeekday - weekStartsOn + 7) % 7;
  const start = addDaysToKey(first, -offset);
  return Array.from({ length: 42 }, (_, index) => addDaysToKey(start, index));
}

export function monthTitle(dateKey: string, locale: string): string {
  const { year, month } = parseDateKey(dateKey);
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1, 12)));
}

export function dayTitle(dateKey: string, locale: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export function weekdayLabels(locale: string, weekStartsOn: 0 | 1, narrow = false): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    const weekday = (weekStartsOn + index) % 7;
    const baseSunday = new Date(Date.UTC(2024, 0, 7 + weekday, 12));
    return new Intl.DateTimeFormat(locale, { weekday: narrow ? "narrow" : "short", timeZone: "UTC" }).format(baseSunday);
  });
}

export function formatTime(iso: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date(iso));
}

export function formatDateTime(iso: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone }).format(new Date(iso));
}

export function minutesFromTime(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function timeFromMinutes(value: number): string {
  return `${pad(Math.floor(value / 60))}:${pad(value % 60)}`;
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function zonedLocalToUtc(dateKey: string, time: string, timeZone: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const parts = formatter.formatToParts(new Date(utcGuess));
  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const representedAsUtc = Date.UTC(read("year"), read("month") - 1, read("day"), read("hour"), read("minute"), read("second"));
  const offset = representedAsUtc - utcGuess;
  return new Date(utcGuess - offset).toISOString();
}

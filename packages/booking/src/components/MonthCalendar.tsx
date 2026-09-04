"use client";

import type { CSSProperties, ReactNode } from "react";
import { calendarGrid, compareDateKeys, dateKeyInTimeZone, monthKey, monthTitle, parseDateKey, weekdayLabels } from "../utils/date.js";

export interface MonthCalendarMarker {
  color?: string;
  label?: string;
  count?: number;
}

export interface MonthCalendarProps {
  month: string;
  selectedDate?: string;
  locale?: string;
  timeZone?: string;
  weekStartsOn?: 0 | 1;
  markers?: Record<string, MonthCalendarMarker>;
  isDateDisabled?: (date: string) => boolean;
  onSelectDate: (date: string) => void;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
  onToday?: () => void;
  renderDateContent?: (date: string) => ReactNode;
  todayLabel?: string;
  className?: string;
}

export function MonthCalendar({
  month,
  selectedDate,
  locale = "nb-NO",
  timeZone = "Europe/Oslo",
  weekStartsOn = 1,
  markers = {},
  isDateDisabled,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  renderDateContent,
  todayLabel = "I dag",
  className = ""
}: MonthCalendarProps) {
  const grid = calendarGrid(month, weekStartsOn);
  const weekdays = weekdayLabels(locale, weekStartsOn, true);
  const today = dateKeyInTimeZone(new Date(), timeZone);

  return (
    <section className={`vb-calendar ${className}`} aria-label={monthTitle(month, locale)}>
      <header className="vb-calendar__toolbar">
        <div className="vb-calendar__nav">
          <button type="button" className="vb-icon-button" onClick={onPreviousMonth} aria-label="Forrige måned">‹</button>
          <button type="button" className="vb-button vb-button--ghost" onClick={onToday}>{todayLabel}</button>
          <button type="button" className="vb-icon-button" onClick={onNextMonth} aria-label="Neste måned">›</button>
        </div>
        <h3>{monthTitle(month, locale)}</h3>
      </header>

      <div className="vb-calendar__weekdays" role="row">
        {weekdays.map((weekday, index) => <span role="columnheader" key={`${weekday}-${index}`}>{weekday}</span>)}
      </div>

      <div className="vb-calendar__grid" role="grid">
        {grid.map((date) => {
          const marker = markers[date];
          const disabled = isDateDisabled?.(date) ?? false;
          const outsideMonth = monthKey(date) !== monthKey(month);
          const selected = date === selectedDate;
          const isToday = date === today;
          const { day } = parseDateKey(date);
          const style = marker?.color ? ({ "--vb-date-color": marker.color } as CSSProperties) : undefined;
          return (
            <button
              type="button"
              role="gridcell"
              key={date}
              className={[
                "vb-calendar__day",
                outsideMonth ? "is-outside" : "",
                selected ? "is-selected" : "",
                isToday ? "is-today" : "",
                marker ? "has-marker" : ""
              ].filter(Boolean).join(" ")}
              style={style}
              disabled={disabled}
              onClick={() => onSelectDate(date)}
              aria-selected={selected}
              aria-label={date}
            >
              <span className="vb-calendar__date-number">{day}</span>
              {marker?.label && <span className="vb-calendar__date-label">{marker.label}</span>}
              {typeof marker?.count === "number" && marker.count > 0 && <span className="vb-calendar__count">{marker.count}</span>}
              {renderDateContent?.(date)}
            </button>
          );
        })}
      </div>
    </section>
  );
}

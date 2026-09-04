"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { calendarGrid, dateKeyInTimeZone, monthKey, monthTitle, parseDateKey, weekdayLabels } from "../utils/date.js";
export function MonthCalendar({ month, selectedDate, locale = "nb-NO", timeZone = "Europe/Oslo", weekStartsOn = 1, markers = {}, isDateDisabled, onSelectDate, onPreviousMonth, onNextMonth, onToday, renderDateContent, todayLabel = "I dag", className = "" }) {
    const grid = calendarGrid(month, weekStartsOn);
    const weekdays = weekdayLabels(locale, weekStartsOn, true);
    const today = dateKeyInTimeZone(new Date(), timeZone);
    return (_jsxs("section", { className: `vb-calendar ${className}`, "aria-label": monthTitle(month, locale), children: [_jsxs("header", { className: "vb-calendar__toolbar", children: [_jsxs("div", { className: "vb-calendar__nav", children: [_jsx("button", { type: "button", className: "vb-icon-button", onClick: onPreviousMonth, "aria-label": "Forrige m\u00E5ned", children: "\u2039" }), _jsx("button", { type: "button", className: "vb-button vb-button--ghost", onClick: onToday, children: todayLabel }), _jsx("button", { type: "button", className: "vb-icon-button", onClick: onNextMonth, "aria-label": "Neste m\u00E5ned", children: "\u203A" })] }), _jsx("h3", { children: monthTitle(month, locale) })] }), _jsx("div", { className: "vb-calendar__weekdays", role: "row", children: weekdays.map((weekday, index) => _jsx("span", { role: "columnheader", children: weekday }, `${weekday}-${index}`)) }), _jsx("div", { className: "vb-calendar__grid", role: "grid", children: grid.map((date) => {
                    const marker = markers[date];
                    const disabled = isDateDisabled?.(date) ?? false;
                    const outsideMonth = monthKey(date) !== monthKey(month);
                    const selected = date === selectedDate;
                    const isToday = date === today;
                    const { day } = parseDateKey(date);
                    const style = marker?.color ? { "--vb-date-color": marker.color } : undefined;
                    return (_jsxs("button", { type: "button", role: "gridcell", className: [
                            "vb-calendar__day",
                            outsideMonth ? "is-outside" : "",
                            selected ? "is-selected" : "",
                            isToday ? "is-today" : "",
                            marker ? "has-marker" : ""
                        ].filter(Boolean).join(" "), style: style, disabled: disabled, onClick: () => onSelectDate(date), "aria-selected": selected, "aria-label": date, children: [_jsx("span", { className: "vb-calendar__date-number", children: day }), marker?.label && _jsx("span", { className: "vb-calendar__date-label", children: marker.label }), typeof marker?.count === "number" && marker.count > 0 && _jsx("span", { className: "vb-calendar__count", children: marker.count }), renderDateContent?.(date)] }, date));
                }) })] }));
}
//# sourceMappingURL=MonthCalendar.js.map
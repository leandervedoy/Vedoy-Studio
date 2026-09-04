import type { ReactNode } from "react";
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
export declare function MonthCalendar({ month, selectedDate, locale, timeZone, weekStartsOn, markers, isDateDisabled, onSelectDate, onPreviousMonth, onNextMonth, onToday, renderDateContent, todayLabel, className }: MonthCalendarProps): import("react").JSX.Element;
//# sourceMappingURL=MonthCalendar.d.ts.map
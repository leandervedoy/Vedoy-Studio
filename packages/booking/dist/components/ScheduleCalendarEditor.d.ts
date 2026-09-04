import type { BookingConfiguration, ScheduleAdapter, ScheduleData } from "../types.js";
export interface ScheduleCalendarEditorProps {
    adapter: ScheduleAdapter;
    configuration?: BookingConfiguration;
    initialDate?: string;
    onChange?: (schedule: ScheduleData) => void;
    className?: string;
}
export declare function ScheduleCalendarEditor({ adapter, configuration, initialDate, onChange, className }: ScheduleCalendarEditorProps): import("react").JSX.Element;
//# sourceMappingURL=ScheduleCalendarEditor.d.ts.map
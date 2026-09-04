import type { ScheduleAdapter, ScheduleData } from "../types.js";
export declare class LocalStorageScheduleAdapter implements ScheduleAdapter {
    private readonly storageKey;
    constructor(storageKey?: string);
    getSchedule(): Promise<ScheduleData>;
    saveSchedule(schedule: ScheduleData): Promise<ScheduleData>;
}
//# sourceMappingURL=LocalStorageScheduleAdapter.d.ts.map
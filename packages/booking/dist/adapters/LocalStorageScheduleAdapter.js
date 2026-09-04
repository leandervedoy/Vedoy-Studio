import { defaultSchedule } from "../defaults.js";
function cloneDefault() {
    return JSON.parse(JSON.stringify(defaultSchedule));
}
export class LocalStorageScheduleAdapter {
    constructor(storageKey = "vedoy-schedule-v2") {
        this.storageKey = storageKey;
    }
    async getSchedule() {
        if (typeof window === "undefined")
            return cloneDefault();
        const raw = window.localStorage.getItem(this.storageKey);
        if (!raw)
            return cloneDefault();
        try {
            return JSON.parse(raw);
        }
        catch {
            return cloneDefault();
        }
    }
    async saveSchedule(schedule) {
        const saved = { ...schedule, updatedAt: new Date().toISOString() };
        if (typeof window !== "undefined") {
            window.localStorage.setItem(this.storageKey, JSON.stringify(saved));
        }
        return saved;
    }
}
//# sourceMappingURL=LocalStorageScheduleAdapter.js.map
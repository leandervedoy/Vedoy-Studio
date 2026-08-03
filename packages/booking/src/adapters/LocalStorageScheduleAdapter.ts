import { defaultSchedule } from "../defaults.js";
import type { ScheduleAdapter, ScheduleData } from "../types.js";

function cloneDefault(): ScheduleData {
  return JSON.parse(JSON.stringify(defaultSchedule)) as ScheduleData;
}

export class LocalStorageScheduleAdapter implements ScheduleAdapter {
  constructor(private readonly storageKey = "vedoy-schedule-v2") {}

  async getSchedule(): Promise<ScheduleData> {
    if (typeof window === "undefined") return cloneDefault();
    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) return cloneDefault();
    try {
      return JSON.parse(raw) as ScheduleData;
    } catch {
      return cloneDefault();
    }
  }

  async saveSchedule(schedule: ScheduleData): Promise<ScheduleData> {
    const saved = { ...schedule, updatedAt: new Date().toISOString() };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(this.storageKey, JSON.stringify(saved));
    }
    return saved;
  }
}

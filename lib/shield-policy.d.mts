export function normalizeModerationText(value: unknown): string;
export function evaluatePublicMessage(body: string, activePhrases?: string[]): { flagged: boolean; reason: string | null };

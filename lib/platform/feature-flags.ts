import "server-only";
import { getSql } from "@/lib/db";
import { featureFlagSchema } from "@/lib/platform/contracts";

export type FeatureFlag = typeof featureFlagSchema._output;
const defaults: Record<FeatureFlag, boolean> = { forge: true, calendar: false, vedi: false, payments: false };

export async function isFeatureEnabled(organizationId: string, flag: FeatureFlag): Promise<boolean> {
  const sql = getSql(); if (!sql) return defaults[flag];
  const rows = await sql<{ enabled: boolean }[]>`select enabled from platform_feature_flags where organization_id = ${organizationId} and flag = ${flag} limit 1`;
  return rows[0]?.enabled ?? defaults[flag];
}

import "server-only";
import { getSql } from "@/lib/db";
import { jobTypeSchema } from "@/lib/platform/contracts";

export async function enqueueJob(input: { organizationId: string; type: typeof jobTypeSchema._output; payload: Record<string, unknown>; runAt?: Date }) {
  const sql = getSql();
  if (!sql) return { queued: false, reason: "database_not_configured" as const };
  const id = `job_${crypto.randomUUID().replaceAll("-", "")}`;
  await sql`insert into platform_jobs (id, organization_id, type, payload, run_at) values (${id}, ${input.organizationId}, ${input.type}, ${JSON.stringify(input.payload)}, ${input.runAt ?? new Date()})`;
  return { queued: true as const, id };
}

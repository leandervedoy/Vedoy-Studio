import "server-only";
import { getIntegrationStatuses, type IntegrationHealth } from "@/lib/integration-status";
import { isUsingDatabase } from "@/lib/repository";
import { logEvent } from "@/lib/platform/observability";

export type PlatformHealth = "healthy" | "degraded";

export type PlatformCheck = {
  id: string;
  name: string;
  status: IntegrationHealth | "healthy";
  detail: string;
};

export type PlatformHealthReport = {
  status: PlatformHealth;
  checkedAt: string;
  checks: PlatformCheck[];
};

const unhealthy = new Set<PlatformCheck["status"]>(["misconfigured", "degraded", "unavailable"]);

/** A safe operational snapshot for pages, monitors and load balancers. Never includes credentials. */
export async function getPlatformHealth(): Promise<PlatformHealthReport> {
  const integrations = await getIntegrationStatuses({ probeRemote: false });
  const checks: PlatformCheck[] = [
    {
      id: "storage",
      name: "Vedøy data",
      status: isUsingDatabase() ? "healthy" : "degraded",
      detail: isUsingDatabase() ? "PostgreSQL er tilkoblet." : "Demo bruker midlertidig minnelagring."
    },
    ...integrations.map(({ id, name, status, detail }) => ({ id, name, status, detail }))
  ];

  const report: PlatformHealthReport = {
    status: checks.some((check) => unhealthy.has(check.status)) ? "degraded" : "healthy",
    checkedAt: new Date().toISOString(),
    checks
  };
  logEvent(report.status === "healthy" ? "info" : "warn", "platform.health_checked", { status: report.status, checks: checks.map(({ id, status }) => ({ id, status })) });
  return report;
}

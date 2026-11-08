import "server-only";
import { getIntegrationStatuses, type IntegrationHealth } from "@/lib/integration-status";
import { isUsingDatabase } from "@/lib/repository";

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

  return {
    status: checks.some((check) => unhealthy.has(check.status)) ? "degraded" : "healthy",
    checkedAt: new Date().toISOString(),
    checks
  };
}

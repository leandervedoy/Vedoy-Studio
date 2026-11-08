import type { Metadata } from "next";
import { getPlatformHealth } from "@/lib/platform-health";

export const metadata: Metadata = { title: "Status" };

export default async function StatusPage() {
  const report = await getPlatformHealth();
  return <section className="status-page"><div className="container"><header><span className="large-status"><i /> {report.status === "healthy" ? "Alle kjernefunksjoner svarer" : "Noen tjenester trenger oppmerksomhet"}</span><h1>Systemstatus</h1><p>Oppdatert {new Intl.DateTimeFormat("nb-NO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(report.checkedAt))}. Statusen viser hva som er koblet og hva som fortsatt er i demo eller oppsett.</p></header><div className="status-service-list">{report.checks.map((check) => <article key={check.id}><div><strong>{check.name}</strong><small>{check.detail}</small></div><span className={check.status === "healthy" ? "is-ok" : "is-pending"}><i />{check.status === "healthy" ? "Klar" : check.status === "not_configured" ? "Ikke koblet" : "Trenger oppsett"}</span><b>{check.status === "healthy" ? "Live" : "—"}</b></article>)}</div></div></section>;
}

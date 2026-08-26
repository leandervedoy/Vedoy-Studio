import Link from "next/link";
import type { StudioProject } from "@/lib/types";

export function HostingOverview({ projects }: { projects: StudioProject[] }) {
  const healthy = projects.filter((project) => project.status === "healthy").length;
  const requests = projects.reduce((total, project) => total + project.monthlyRequests, 0);
  const regions = [...new Set(projects.map((project) => project.region))];

  return (
    <section className="hosting-overview" aria-label="Hostingoversikt">
      <div className="hosting-overview__intro">
        <div>
          <small>VEDØY HOSTING · BETA</small>
          <h2>Drift, samlet.</h2>
          <p>Få oversikt over prosjektene som skal driftes, og konfigurer kapasitet, backup og domene når kunden er klar.</p>
        </div>
        <Link className="button button--dark button--small" href="/tjenester/hosting-og-domene#konfigurer-hosting">Konfigurer hosting ↗</Link>
      </div>

      <div className="hosting-overview__metrics">
        <article><span>Prosjekter</span><strong>{projects.length}</strong><small>{healthy} med frisk status</small></article>
        <article><span>Trafikk</span><strong>{new Intl.NumberFormat("nb-NO", { notation: "compact" }).format(requests)}</strong><small>registrerte forespørsler</small></article>
        <article><span>Regioner</span><strong>{regions.length || "–"}</strong><small>{regions.length ? regions.join(" · ") : "Velges i konfiguratoren"}</small></article>
      </div>

      <div className="hosting-overview__steps">
        <article><b>01</b><div><strong>Velg løsning</strong><p>Server, lagring, region og backup.</p></div></article>
        <article><b>02</b><div><strong>Betal sikkert</strong><p>Stripe åpnes bare når integrasjonen er konfigurert.</p></div></article>
        <article><b>03</b><div><strong>Sett i drift</strong><p>Automatisk provisjonering kommer snart. Inntil da bekreftes oppsett manuelt.</p></div></article>
      </div>
    </section>
  );
}

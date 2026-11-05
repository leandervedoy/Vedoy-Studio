"use client";

import { FormEvent, useMemo, useState } from "react";
import type { StudioProject } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function ProjectManager({ initialProjects, demoMode = false }: { initialProjects: StudioProject[]; demoMode?: boolean }) {
  const [projects, setProjects] = useState(initialProjects);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | StudioProject["status"]>("all");
  const [expandedId, setExpandedId] = useState<string>();
  const visibleProjects = useMemo(() => projects.filter((project) => {
    const matchesQuery = `${project.name} ${project.productionUrl} ${project.framework}`.toLocaleLowerCase("nb-NO").includes(query.toLocaleLowerCase("nb-NO"));
    return matchesQuery && (status === "all" || project.status === status);
  }), [projects, query, status]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          framework: form.get("framework"),
          productionUrl: form.get("productionUrl")
        })
      });
      const data = await response.json() as { project?: StudioProject; error?: string };
      if (!response.ok || !data.project) throw new Error(data.error || "Kunne ikke opprette prosjekt.");
      setProjects((items) => [data.project!, ...items]);
      setOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Noe gikk galt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="project-toolbar">
        <div className="action-row">
          <button className="button button--dark" type="button" disabled={demoMode} title={demoMode ? "Koble til databasen før prosjekter kan lagres" : "Opprett nytt prosjekt"} onClick={() => setOpen(true)}>+ Nytt prosjekt</button>
        </div>
        <div className="project-toolbar__filters">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Søk etter prosjekt eller adresse" aria-label="Søk i prosjekter" />
          <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="Filtrer etter status">
            <option value="all">Alle statuser</option><option value="healthy">Aktiv</option><option value="building">Under arbeid</option><option value="attention">Trenger tilsyn</option><option value="paused">Pauset</option>
          </select>
        </div>
      </div>
      <div className="project-results" role="status">
        <strong>{visibleProjects.length} av {projects.length} prosjekter</strong>
        <span>{demoMode ? "Eksempelprosjekter – ingen live-synkronisering" : "Oppførte prosjekter – ikke automatisk synkronisert med Vercel"}</span>
      </div>
      <div className="project-list">
        {visibleProjects.length ? visibleProjects.map((project) => <article key={project.id} className="project-entry"><div className="project-row">
          <div className="project-row__icon">{project.framework === "Next.js" ? "N" : "S"}</div>
          <div className="project-row__main"><strong>{project.name}</strong><a href={`https://${project.productionUrl}`} target="_blank" rel="noreferrer">{project.productionUrl} ↗</a></div>
          <div><small>{demoMode ? "Eksempelstatus" : "Registrert status"}</small><span className={`project-health project-health--${project.status}`}><i />{project.status === "healthy" ? "Aktiv" : project.status === "building" ? "Under arbeid" : project.status === "paused" ? "Pauset" : "Trenger tilsyn"}</span></div>
          <div><small>Rammeverk</small><span>{project.framework}</span></div>
          <div><small>Siste deploy</small><span>{formatDateTime(project.lastDeployAt)}</span></div>
          <button className="icon-button" type="button" aria-label={`Vis detaljer for ${project.name}`} aria-expanded={expandedId === project.id} onClick={() => setExpandedId((current) => current === project.id ? undefined : project.id)}>{expandedId === project.id ? "×" : "•••"}</button>
        </div>{expandedId === project.id && <div className="project-entry__details"><div><small>DRIFT</small><strong>{project.region}</strong></div><div><small>TRAFIKK</small><strong>{new Intl.NumberFormat("nb-NO").format(project.monthlyRequests)} forespørsler</strong></div><div><small>OPPRETTET</small><strong>{formatDateTime(project.createdAt)}</strong></div><a className="button button--small button--ghost" href={`https://${project.productionUrl}`} target="_blank" rel="noreferrer">Åpne produksjon ↗</a></div>}</article>) : <div className="project-empty"><p>Ingen prosjekter matcher filtrene.</p><button className="button button--small button--ghost" type="button" onClick={() => { setQuery(""); setStatus("all"); }}>Nullstill søket</button></div>}
      </div>
      {open && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="new-project-title">
          <button className="modal__backdrop" onClick={() => setOpen(false)} aria-label="Lukk" />
          <form className="modal__card" onSubmit={create}>
            <div className="modal__header"><div><small>NYTT PROSJEKT</small><h2 id="new-project-title">Hva skal vi bygge?</h2></div><button type="button" onClick={() => setOpen(false)}>×</button></div>
            <label><span>Prosjektnavn</span><input name="name" placeholder="Nordlys Kafé" minLength={2} required /></label>
            <label><span>Rammeverk</span><select name="framework" defaultValue="Next.js"><option>Next.js</option><option>React</option><option>Vue</option><option>Node API</option><option>Statisk nettside</option></select></label>
            <label><span>Ønsket adresse</span><input name="productionUrl" placeholder="nordlys.vedoy.site" /></label>
            {error && <p className="form-error">{error}</p>}
            <div className="modal__actions"><button type="button" className="button button--ghost" onClick={() => setOpen(false)}>Avbryt</button><button className="button button--dark" disabled={loading}>{loading ? "Oppretter …" : "Opprett prosjekt"}</button></div>
          </form>
        </div>
      )}
    </>
  );
}

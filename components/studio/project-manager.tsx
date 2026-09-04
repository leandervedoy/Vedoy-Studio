"use client";

import { FormEvent, useState } from "react";
import type { StudioProject } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function ProjectManager({ initialProjects }: { initialProjects: StudioProject[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      <div className="action-row"><button className="button button--dark" type="button" onClick={() => setOpen(true)}>+ Nytt prosjekt</button><button className="button button--ghost" type="button">Importer fra GitHub</button></div>
      <div className="project-list">
        {projects.map((project) => (
          <article key={project.id} className="project-row">
            <div className="project-row__icon">{project.framework === "Next.js" ? "N" : "S"}</div>
            <div className="project-row__main"><strong>{project.name}</strong><a href={`https://${project.productionUrl}`} target="_blank" rel="noreferrer">{project.productionUrl} ↗</a></div>
            <div><small>Status</small><span className={`project-health project-health--${project.status}`}><i />{project.status === "healthy" ? "Frisk" : project.status === "building" ? "Bygger" : "Trenger tilsyn"}</span></div>
            <div><small>Rammeverk</small><span>{project.framework}</span></div>
            <div><small>Siste deploy</small><span>{formatDateTime(project.lastDeployAt)}</span></div>
            <button className="icon-button" type="button" aria-label={`Meny for ${project.name}`}>•••</button>
          </article>
        ))}
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

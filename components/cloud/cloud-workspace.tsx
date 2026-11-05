"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Project = { id: string; name: string; source: "manual" | "github" | "folder"; github_url: string | null; github_default_branch: string | null; created_at: string };
type CloudFile = { id: string; display_path: string; size_bytes: number; mime_type: string; created_at: string };

const FORMAT = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 });
function fileSize(n: number) { return n < 1024 ? n + " B" : n < 1048576 ? FORMAT.format(n / 1024) + " KB" : FORMAT.format(n / 1048576) + " MB"; }
async function apiJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, cache: "no-store" });
  const body = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || "Noe gikk galt. Prøv igjen.");
  return body;
}
function headers() { return { "Content-Type": "application/json" }; }

export function CloudWorkspace({ userName }: { userName: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [source, setSource] = useState<Project["source"]>("manual");
  const [name, setName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const folderRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const activeProject = projects.find(p => p.id === active);

  const loadProjects = useCallback(async () => {
    try {
      const data = await apiJson<{ projects: Project[] }>("/api/cloud/projects");
      setProjects(data.projects);
      setActive(current => current && data.projects.some(p => p.id === current) ? current : (data.projects[0]?.id || null));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Kunne ikke hente prosjekter."); }
    finally { setStarted(true); }
  }, []);
  const loadFiles = useCallback(async (id: string) => {
    try {
      const data = await apiJson<{ files: CloudFile[] }>("/api/cloud/files?projectId=" + encodeURIComponent(id));
      setFiles(data.files);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Kunne ikke hente filene."); }
  }, []);
  useEffect(() => { void loadProjects(); }, [loadProjects]);
  useEffect(() => { if (active) void loadFiles(active); else setFiles([]); }, [active, loadFiles]);
  useEffect(() => { if (folderRef.current) folderRef.current.setAttribute("webkitdirectory", ""); }, []);

  async function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const data = await apiJson<{ project: Project; note?: string }>("/api/cloud/projects", { method: "POST", headers: headers(), body: JSON.stringify({ source, name, githubUrl }) });
      setProjects(items => [data.project, ...items]); setActive(data.project.id);
      setName(""); setGithubUrl("");
      setNotice(data.note || "Prosjektet er opprettet. Du kan nå laste opp filer.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Kunne ikke opprette prosjekt."); }
    finally { setBusy(false); }
  }

  async function upload(selected: FileList | null) {
    if (!selected || !active || uploading) return;
    const items = Array.from(selected).slice(0, 25);
    setUploading(true); setError(""); setNotice("");
    let success = 0;
    try {
      for (const file of items) {
        if (file.size > 10 * 1024 * 1024 || file.size === 0) throw new Error("Filen " + file.name + " er tom eller større enn 10 MB.");
        const path = file.webkitRelativePath || file.name;
        const grant = await apiJson<{ fileId: string; signedUrl: string }>("/api/cloud/files", { method: "POST", headers: headers(), body: JSON.stringify({ projectId: active, path, size: file.size, contentType: file.type || "application/octet-stream" }) });
        const result = await fetch(grant.signedUrl, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
        if (!result.ok) throw new Error("Kunne ikke laste opp " + file.name + " (" + result.status + ").");
        await apiJson("/api/cloud/files", { method: "PATCH", headers: headers(), body: JSON.stringify({ fileId: grant.fileId }) });
        success++;
        setNotice("Lastet opp " + success + " av " + items.length + " filer.");
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Opplasting feilet."); }
    finally {
      setUploading(false); if (fileRef.current) fileRef.current.value = ""; if (folderRef.current) folderRef.current.value = "";
      await loadFiles(active);
    }
  }
  async function importGithubFiles() {
    if (!active) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await apiJson<{ imported: number; remaining: number; note: string }>("/api/cloud/projects/import", { method: "POST", headers: headers(), body: JSON.stringify({ projectId: active }) });
      setNotice("Importert " + result.imported + " kildefiler. " + (result.remaining ? result.remaining + " filer gjenstår. " : "") + result.note);
      await loadFiles(active);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "GitHub-import feilet."); }
    finally { setBusy(false); }
  }
  async function download(fileId: string) {
    setError("");
    try {
      const result = await apiJson<{ url: string }>("/api/cloud/files/download?id=" + encodeURIComponent(fileId));
      window.location.assign(result.url);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Nedlasting feilet."); }
  }
  async function deleteFile(file: CloudFile) {
    if (!active || !window.confirm("Slette filen «" + file.display_path + "» permanent?")) return;
    setError("");
    try { await apiJson("/api/cloud/files?id=" + encodeURIComponent(file.id), { method: "DELETE", headers: headers() }); await loadFiles(active); setNotice("Filen er slettet."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Kunne ikke slette filen."); }
  }
  async function deleteProject() {
    if (!active || !activeProject || !window.confirm("Slette prosjektet «" + activeProject.name + "» og alle filene permanent?")) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await apiJson("/api/cloud/projects?id=" + encodeURIComponent(active), { method: "DELETE", headers: headers() });
      setActive(null); await loadProjects(); setNotice("Prosjektet er slettet.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Kunne ikke slette prosjektet."); }
    finally { setBusy(false); }
  }

  return <main className="vedoy-cloud">
    <div className="vedoy-cloud__shell">
      <header className="vedoy-cloud__top"><Link href="/" className="vedoy-cloud__mark">VEDØY <span>STUDIO</span></Link><div className="vedoy-cloud__toplinks"><Link href="/studio">Studio</Link><Link href="/projects">EN / Projects</Link><button type="button" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/prosjekter"); }} className="vedoy-cloud__signout">Logg ut</button><span className="vedoy-cloud__avatar" title={userName}>{userName.slice(0, 1).toUpperCase()}</span></div></header>
      <section className="vedoy-cloud__hero"><div><span className="vedoy-cloud__eyebrow">VEDOY CLOUD / PERSONLIG ARBEIDSOMRÅDE</span><h1>Prosjektene dine.<br /><em>På ett sted.</em></h1><p>Opprett et prosjekt, koble et offentlig GitHub-repositorium eller lagre prosjektfiler i en privat sky.</p></div><div className="vedoy-cloud__capacity"><span>PRØVEVERSJON</span><strong>100 MB</strong><small>Privat lagring per konto · maks 10 MB per fil</small></div></section>
      {error && <p className="vedoy-cloud__alert" role="alert">{error}</p>}
      {notice && <p className="vedoy-cloud__success" role="status">{notice}</p>}
      <section className="vedoy-cloud__columns">
        <aside className="vedoy-cloud__sidebar">
          <div className="vedoy-cloud__sectionhead"><h2>Mine prosjekter</h2><span>{projects.length} / 30</span></div>
          {started && !projects.length && <p className="vedoy-cloud__muted">Du har ingen prosjekter ennå.</p>}
          {projects.map(project => <button key={project.id} type="button" className={`vedoy-cloud__project ${active === project.id ? "is-active" : ""}`} onClick={() => { setActive(project.id); setNotice(""); setError(""); }}><span className="vedoy-cloud__projecticon">{project.source === "github" ? "⌘" : project.source === "folder" ? "▤" : "◫"}</span><span><strong>{project.name}</strong><small>{project.source === "github" ? "GitHub · koblet" : "Vedoy Cloud"}</small></span><span aria-hidden="true">↗</span></button>)}
          <div className="vedoy-cloud__form">
            <span className="vedoy-cloud__eyebrow">OPPRETT / IMPORTER</span>
            <h3>Nytt prosjekt</h3>
            <div className="vedoy-cloud__tabs" role="group" aria-label="Prosjektkilde">
              {([["manual", "Nytt"], ["github", "GitHub"], ["folder", "Mappe"]] as const).map(([value, label]) => <button key={value} type="button" className={source === value ? "is-current" : ""} onClick={() => setSource(value)}>{label}</button>)}
            </div>
            <form onSubmit={createProject}>
              <label>Prosjektnavn<input value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={100} placeholder={source === "github" ? "Valgfritt · GitHub-navn" : "Mitt prosjekt"} required={source !== "github"} /></label>
              {source === "github" && <label>Offentlig GitHub-lenke<input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} required placeholder="https://github.com/bruker/repo" /><small>Prosjektet kobles først som lenke. Deretter kan du importere kildefiler til Vedoy Cloud.</small></label>}
              {source === "folder" && <p className="vedoy-cloud__hint">Opprett prosjektet først, og last opp en hel mappe i filområdet til høyre.</p>}
              <button className="vedoy-cloud__primary" disabled={busy}>{busy ? "Oppretter …" : source === "github" ? "Koble GitHub →" : "Opprett prosjekt →"}</button>
            </form>
          </div>
        </aside>
        <div className="vedoy-cloud__main">
          {activeProject ? <>
            <div className="vedoy-cloud__filehead"><div><span className="vedoy-cloud__eyebrow">PROSJEKT / {activeProject.source.toUpperCase()}</span><h2>{activeProject.name}</h2><p>Opprettet {new Date(activeProject.created_at).toLocaleDateString("nb-NO")}</p></div><button className="vedoy-cloud__danger" type="button" disabled={busy} onClick={() => void deleteProject()}>Slett prosjekt</button></div>
            {activeProject.github_url && <div className="vedoy-cloud__github"><div><strong>GitHub-repositorium</strong><p>{activeProject.github_url} · {activeProject.github_default_branch}</p><small>Lenket GitHub-prosjekt. Du kan importere et utvalg kildefiler til privat lagring.</small></div><div className="vedoy-cloud__githubactions"><a href={activeProject.github_url} rel="noopener noreferrer" target="_blank">Åpne GitHub ↗</a><button type="button" disabled={busy} onClick={() => void importGithubFiles()}>{busy ? "Importerer …" : "Importer kildefiler ↓"}</button></div></div>}
            <div className="vedoy-cloud__uploads"><div><h3>Prosjektfiler</h3><p>Kun du kan åpne filene dine. Mapper beholder navn og struktur ved opplasting.</p></div><div className="vedoy-cloud__uploadbuttons"><label className="vedoy-cloud__button">↑ Last opp filer<input ref={fileRef} type="file" multiple disabled={uploading} onChange={e => void upload(e.currentTarget.files)} /></label><label className="vedoy-cloud__button vedoy-cloud__button--secondary">▤ Last opp mappe<input ref={folderRef} type="file" multiple disabled={uploading} onChange={e => void upload(e.currentTarget.files)} /></label></div></div>
            <div className="vedoy-cloud__table"><div className="vedoy-cloud__tablehead"><span>FIL / MAPPE</span><span>STØRRELSE</span><span>HANDLINGER</span></div>{files.length ? files.map(file => <article key={file.id} className="vedoy-cloud__filerow"><div><span className="vedoy-cloud__fileicon">▧</span><span className="vedoy-cloud__filename">{file.display_path}</span></div><span>{fileSize(file.size_bytes)}</span><div><button type="button" onClick={() => void download(file.id)}>Last ned</button><button type="button" onClick={() => void deleteFile(file)}>Slett</button></div></article>) : <p className="vedoy-cloud__empty">Ingen lagrede filer i dette prosjektet. Last opp en fil eller mappe for å starte.</p>}</div>
          </> : <div className="vedoy-cloud__placeholder"><span>◇</span><h2>Begynn med et prosjekt.</h2><p>Velg «Nytt prosjekt», «GitHub» eller «Mappe» til venstre. Prosjektdataene tilhører kontoen din.</p></div>}
        </div>
      </section>
      <footer className="vedoy-cloud__footer"><span>Vedoy Cloud · Beta</span><span>Filene lagres i Supabase-regionen eu-north-1 (Sverige). Ingen norsk datalagringsgaranti.</span><Link href="/privacy">Personvern</Link></footer>
    </div>
  </main>;
}

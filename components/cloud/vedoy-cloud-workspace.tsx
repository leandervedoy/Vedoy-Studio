"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import styles from "./vedoy-cloud.module.css";

type Project = { id: string; name: string; source: "manual"|"folder"|"github"; github_url: string | null; github_default_branch: string | null; created_at: string };
type CloudFile = { id: string; display_path: string; size_bytes: number; created_at: string };
type Json = { error?: string; projects?: Project[]; project?: Project; files?: CloudFile[]; fileId?: string; signedUrl?: string; ok?: boolean; url?: string; note?: string };
const displayBytes = (bytes: number) => bytes < 1024 ? bytes + " B" : (bytes / (1024*1024) >= 1 ? (bytes/(1024*1024)).toFixed(1) + " MB" : (bytes/1024).toFixed(1) + " KB");

async function api(url: string, options?: RequestInit): Promise<Json> {
  const response = await fetch(url, { cache: "no-store", credentials: "same-origin", ...options });
  const result = await response.json().catch(() => ({})) as Json;
  if (!response.ok) throw new Error(result.error || "Forespørselen feilet.");
  return result;
}

export function VedoyCloudWorkspace({ name }: { name: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [mode, setMode] = useState<"manual"|"github">("manual");
  const [projectName, setProjectName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const folderInput = useRef<HTMLInputElement>(null);
  const normalInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api("/api/cloud/projects");
      setProjects(data.projects || []);
      setSelected(current => (data.projects || []).some(p => p.id === current) ? current : (data.projects?.[0]?.id || ""));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kunne ikke laste prosjekter."); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { folderInput.current?.setAttribute("webkitdirectory", ""); folderInput.current?.setAttribute("directory", ""); }, []);
  useEffect(() => {
    if (!selected) { setFiles([]); return; }
    let alive = true;
    api("/api/cloud/files?projectId=" + encodeURIComponent(selected))
      .then(d => { if (alive) setFiles(d.files || []); })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : "Kunne ikke laste filer."); });
    return () => { alive = false; };
  }, [selected]);
  const active = projects.find(p => p.id === selected);

  async function create(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const data = await api("/api/cloud/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: projectName || undefined, source: mode, githubUrl: githubUrl || undefined }) });
      await refresh();
      if (data.project) setSelected(data.project.id);
      setProjectName(""); setGithubUrl(""); setMessage(data.note || "Prosjektet ble opprettet.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kunne ikke opprette prosjekt."); }
    finally { setBusy(false); }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files || []);
    if (!active || !chosen.length) return;
    if (chosen.length > 50) { setError("Velg høyst 50 filer om gangen."); event.target.value = ""; return; }
    setUploading(true); setError(""); setMessage("");
    let complete = 0;
    try {
      for (const file of chosen) {
        if (file.size <= 0 || file.size > 10 * 1024 * 1024) throw new Error(file.name + ": filen må være mellom 1 byte og 10 MB.");
        const path = file.webkitRelativePath || file.name;
        const ticket = await api("/api/cloud/files", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: active.id, path, size: file.size, contentType: file.type || "application/octet-stream" }) });
        if (!ticket.signedUrl || !ticket.fileId) throw new Error("Manglende opplastingsadresse.");
        const sent = await fetch(ticket.signedUrl, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" }, body: file });
        if (!sent.ok) throw new Error(file.name + ": filopplasting feilet (" + sent.status + ").");
        await api("/api/cloud/files", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileId: ticket.fileId }) });
        complete++;
        setMessage("Lastet opp " + complete + " av " + chosen.length + " filer.");
      }
      const response = await api("/api/cloud/files?projectId=" + encodeURIComponent(active.id));
      setFiles(response.files || []); setMessage(complete + " filer lagret privat i Vedoy Cloud.");
    } catch (cause) { setError((cause instanceof Error ? cause.message : "Opplastingen feilet.") + " " + complete + " filer ble lagret."); }
    finally { setUploading(false); event.target.value = ""; }
  }

  async function download(fileId: string) {
    setError("");
    try {
      const result = await api("/api/cloud/files/download?id=" + encodeURIComponent(fileId));
      if (!result.url) throw new Error("Nedlastingslenken mangler.");
      window.location.assign(result.url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Nedlasting feilet."); }
  }
  async function removeFile(fileId: string, filename: string) {
    if (!window.confirm("Slette filen «" + filename + "» permanent?")) return;
    setError("");
    try {
      await api("/api/cloud/files?id=" + encodeURIComponent(fileId), { method: "DELETE" });
      setFiles(current => current.filter(f => f.id !== fileId)); setMessage("Filen ble slettet.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kunne ikke slette filen."); }
  }
  async function removeProject() {
    if (!active || !window.confirm("Slette prosjektet «" + active.name + "» og alle filene permanent?")) return;
    setError("");
    try {
      await api("/api/cloud/projects?id=" + encodeURIComponent(active.id), { method: "DELETE" });
      setSelected(""); setFiles([]); await refresh(); setMessage("Prosjektet ble slettet.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kunne ikke slette prosjektet."); }
  }

  return <section className={styles.workspace}>
    <div className={styles.workspaceHead}><div><p className={styles.kicker}>MITT ARBEIDSOMRÅDE</p><h2>Velkommen, {name.split(" ")[0]}.</h2><p>Prosjekter og filer bare for din Vedøy-konto.</p></div><span className={styles.beta}>BETA · PRIVAT</span></div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {message && <p className={styles.success} role="status">{message}</p>}
    <div className={styles.panels}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}><h3>Prosjekter</h3><span>{projects.length}</span></div>
        <div className={styles.projectList}>{projects.map(p =>
          <button type="button" key={p.id} onClick={() => { setSelected(p.id); setMessage(""); }} className={selected === p.id ? styles.projectActive : styles.projectButton}>
            <span className={styles.projectSymbol}>{p.source === "github" ? "⌁" : p.source === "folder" ? "▤" : "▦"}</span><span><strong>{p.name}</strong><small>{p.source === "github" ? "GitHub" : "Vedoy Cloud"}</small></span>
          </button>)}
          {!projects.length && <p className={styles.muted}>Ingen prosjekter ennå.</p>}</div>
        <form onSubmit={create} className={styles.createBox}>
          <p className={styles.kicker}>NYTT PROSJEKT</p>
          <div className={styles.tabs}><button className={mode === "manual" ? styles.tabActive : ""} type="button" onClick={() => setMode("manual")}>Opprett</button><button type="button" className={mode === "github" ? styles.tabActive : ""} onClick={() => setMode("github")}>Fra GitHub</button></div>
          <label><span>Prosjektnavn</span><input maxLength={100} minLength={2} required={mode === "manual"} placeholder="Mitt nye prosjekt" value={projectName} onChange={e => setProjectName(e.target.value)} /></label>
          {mode === "github" && <label><span>Offentlig GitHub-lenke</span><input type="url" required placeholder="https://github.com/bruker/repo" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} /><small>Knytter repoet til prosjektet. Kopierer ikke kode eller private repoer.</small></label>}
          <button className={styles.primary} type="submit" disabled={busy}>{busy ? "Oppretter…" : mode === "github" ? "Koble til GitHub ↗" : "+ Opprett prosjekt"}</button>
        </form>
      </aside>
      <div className={styles.content}>
        {active ? <>
          <div className={styles.contentTop}><div><p className={styles.kicker}>PROSJEKT / {active.source.toUpperCase()}</p><h3>{active.name}</h3><p>Opprettet {new Date(active.created_at).toLocaleDateString("nb-NO")}</p></div><button className={styles.deleteProject} type="button" onClick={removeProject}>Slett prosjekt</button></div>
          {active.github_url && <a className={styles.github} href={active.github_url} target="_blank" rel="noreferrer">⌁ Åpne GitHub-prosjektet <span>{active.github_default_branch || "main"} ↗</span></a>}
          <div className={styles.uploadArea}><div><strong>Last opp filer eller en mappe</strong><p>Ta vare på dokumenter, bilder og kodefiler. Mapper beholder stiene sine.</p><small>10 MB per fil · 100 MB totalt · 200 filer per prosjekt</small></div><div className={styles.uploadActions}><button disabled={uploading} type="button" onClick={() => normalInput.current?.click()}>+ Velg filer</button><button disabled={uploading} type="button" onClick={() => folderInput.current?.click()}>▤ Velg mappe</button></div><input ref={normalInput} hidden type="file" multiple onChange={upload}/><input ref={folderInput} hidden type="file" multiple onChange={upload}/></div>
          <div className={styles.filesHeading}><h4>Lagrede filer</h4><span>{files.length}</span></div>
          {files.length ? <div className={styles.files}>{files.map(f => <div className={styles.fileRow} key={f.id}><span className={styles.fileIcon}>▤</span><div><strong title={f.display_path}>{f.display_path}</strong><small>{displayBytes(f.size_bytes)}</small></div><button type="button" onClick={() => download(f.id)}>Last ned</button><button className={styles.smallDelete} type="button" aria-label={"Slett " + f.display_path} onClick={() => removeFile(f.id, f.display_path)}>×</button></div>)}</div> : <p className={styles.empty}>Ingen filer. Last opp din første mappe eller fil.</p>}
        </> : <div className={styles.emptyProject}><span>▦</span><h3>Her starter neste prosjekt.</h3><p>Opprett et nytt prosjekt til venstre, eller koble til et offentlig GitHub-repositorium.</p></div>}
      </div>
    </div>
  </section>;
}

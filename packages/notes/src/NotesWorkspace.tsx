"use client";

import { useEffect, useMemo, useState } from "react";
import type { NotesAttachment as StudioNoteAttachment, NotesColor as StudioNoteColor, NotesDocument as StudioNote, NotesShare as StudioNoteShare, NotesVersion as StudioNoteVersion } from "./types.js";

const colorOptions: Array<{ value: StudioNoteColor; label: string }> = [
  { value: "sand", label: "Sand" }, { value: "lemon", label: "Gul" }, { value: "mint", label: "Grønn" }, { value: "lavender", label: "Lilla" }, { value: "coral", label: "Korall" }
];
const templates = [
  { label: "Kundemøte", title: "Kundemøte · ", content: "Deltakere:\n\nBehov:\n\nAvtalt neste steg:\n\nOppfølging:", color: "mint" as const },
  { label: "Lansering", title: "Lanseringssjekk", content: "Mål:\n\n- [ ] Sjekk innhold\n- [ ] Test skjema og lenker\n- [ ] Publiser\n\nEtter lansering:", color: "lemon" as const },
  { label: "Idé", title: "Ny idé", content: "Problemet:\n\nLøsningen:\n\nHvem hjelper dette:\n\nNeste minste steg:\n- [ ] ", color: "lavender" as const }
];

async function api<T>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Noe gikk galt.");
  return data;
}

export function NotesWorkspace({ initialNotes, compact = false }: { initialNotes: StudioNote[]; compact?: boolean }) {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedId, setSelectedId] = useState(initialNotes[0]?.id);
  const [query, setQuery] = useState("");
  const [notebookFilter, setNotebookFilter] = useState("Alle notater");
  const [sectionFilter, setSectionFilter] = useState("Alle seksjoner");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [versions, setVersions] = useState<StudioNoteVersion[]>([]);
  const [attachments, setAttachments] = useState<StudioNoteAttachment[]>([]);
  const [share, setShare] = useState<StudioNoteShare | null>(null);
  const [online, setOnline] = useState(true);
  const selected = notes.find((note) => note.id === selectedId) ?? notes[0];
  const notebooks = useMemo(() => [...new Set(notes.map((note) => note.notebook))], [notes]);
  const sections = useMemo(() => [...new Set(notes.filter((note) => notebookFilter === "Alle notater" || note.notebook === notebookFilter).map((note) => note.section))], [notes, notebookFilter]);
  const filteredNotes = useMemo(() => notes.filter((note) => {
    const text = `${note.title} ${note.content} ${note.tags.join(" ")}`.toLocaleLowerCase("nb-NO");
    return text.includes(query.toLocaleLowerCase("nb-NO")) && (!pinnedOnly || note.pinned) && (notebookFilter === "Alle notater" || note.notebook === notebookFilter) && (sectionFilter === "Alle seksjoner" || note.section === sectionFilter);
  }), [notes, query, pinnedOnly, notebookFilter, sectionFilter]);
  const tasks = selected?.content.split("\n").map((line, index) => ({ line, index, match: line.match(/^- \[([ x])\] (.+)$/i) })).filter((item) => item.match) ?? [];

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update(); window.addEventListener("online", update); window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  useEffect(() => {
    if (!selected || compact) return;
    const raw = localStorage.getItem(`vedoy-note-draft:${selected.id}`);
    if (raw) try {
      const draft = JSON.parse(raw) as { title?: string; content?: string; savedAt?: number };
      if ((draft.savedAt ?? 0) > new Date(selected.updatedAt).getTime() && (draft.title !== selected.title || draft.content !== selected.content)) {
        updateLocal(selected.id, { title: draft.title ?? selected.title, content: draft.content ?? selected.content });
        setMessage("Lokal kladd gjenopprettet");
      }
    } catch { localStorage.removeItem(`vedoy-note-draft:${selected.id}`); }
    void refreshExtras(selected.id);
  // selectedId is the intended boundary; local edits must not trigger a reload.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, compact]);

  useEffect(() => {
    if (!selected || compact) return;
    localStorage.setItem(`vedoy-note-draft:${selected.id}`, JSON.stringify({ title: selected.title, content: selected.content, savedAt: Date.now() }));
  }, [selected?.id, selected?.title, selected?.content, compact]);

  async function refreshExtras(noteId: string) {
    try {
      const [historyResponse, attachmentsResponse, shareResponse] = await Promise.all([
        fetch(`/api/notes/${noteId}/history`), fetch(`/api/notes/${noteId}/attachments`), fetch(`/api/notes/${noteId}/share`)
      ]);
      if (historyResponse.ok) setVersions(((await historyResponse.json()) as { versions: StudioNoteVersion[] }).versions);
      if (attachmentsResponse.ok) setAttachments(((await attachmentsResponse.json()) as { attachments: StudioNoteAttachment[] }).attachments);
      if (shareResponse.ok) setShare(((await shareResponse.json()) as { share: StudioNoteShare | null }).share);
    } catch { setMessage("Arbeider fra lokal kladd"); }
  }

  function updateLocal(id: string, patch: Partial<StudioNote>) { setNotes((current) => current.map((note) => note.id === id ? { ...note, ...patch } : note)); }
  async function createNote(template?: typeof templates[number]) {
    setBusy(true); setMessage("");
    try {
      const { note } = await api<{ note: StudioNote }>("/api/notes", "POST", { title: template?.title ?? "Nytt notat", content: template?.content ?? "", color: template?.color ?? "lemon", pinned: false, notebook: notebookFilter === "Alle notater" ? "Arbeidsområde" : notebookFilter, section: sectionFilter === "Alle seksjoner" ? "Generelt" : sectionFilter, tags: [] });
      setNotes((current) => [note, ...current]); setSelectedId(note.id);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kunne ikke opprette notat."); } finally { setBusy(false); }
  }
  async function saveNote(patch: Partial<StudioNote>) {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      const { note } = await api<{ note: StudioNote }>(`/api/notes/${selected.id}`, "PATCH", patch);
      setNotes((current) => current.map((item) => item.id === note.id ? note : item).sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      setSelectedId(note.id); localStorage.removeItem(`vedoy-note-draft:${note.id}`); setMessage("Lagret");
      if (!compact) void refreshExtras(note.id);
    } catch (error) { setMessage(!navigator.onLine ? "Ingen nett – kladden er lagret lokalt" : error instanceof Error ? error.message : "Kunne ikke lagre notatet."); } finally { setBusy(false); }
  }
  async function removeNote() {
    if (!selected || !window.confirm("Slette dette notatet?")) return;
    setBusy(true); setMessage("");
    try { await api(`/api/notes/${selected.id}`, "DELETE"); const next = notes.filter((note) => note.id !== selected.id); setNotes(next); setSelectedId(next[0]?.id); } catch (error) { setMessage(error instanceof Error ? error.message : "Kunne ikke slette notatet."); } finally { setBusy(false); }
  }
  function addTag() { if (!selected) return; const tag = tagDraft.trim().replace(/^#/, ""); if (!tag || selected.tags.includes(tag)) return; setTagDraft(""); saveNote({ tags: [...selected.tags, tag] }); }
  function appendText(text: string) { if (!selected) return; const content = `${selected.content}${selected.content && !selected.content.endsWith("\n") ? "\n" : ""}${text}`; updateLocal(selected.id, { content }); saveNote({ content }); }
  function toggleTask(index: number) { if (!selected) return; const lines = selected.content.split("\n"); lines[index] = lines[index].replace(/^- \[([ x])\]/i, (_, checked: string) => `- [${checked.toLowerCase() === "x" ? " " : "x"}]`); const content = lines.join("\n"); updateLocal(selected.id, { content }); saveNote({ content }); }
  function changeGroup(field: "notebook" | "section", value: string) { if (!selected) return; const next = value === "__new__" ? window.prompt(field === "notebook" ? "Navn på ny notatbok" : "Navn på ny seksjon")?.trim() : value; if (!next) return; updateLocal(selected.id, { [field]: next }); saveNote({ [field]: next }); }

  async function uploadAttachment(file: File | undefined) {
    if (!selected || !file) return;
    setBusy(true); setMessage("");
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch(`/api/notes/${selected.id}/attachments`, { method: "POST", body: form });
      const data = await response.json() as { attachment?: StudioNoteAttachment; error?: string };
      if (!response.ok || !data.attachment) throw new Error(data.error || "Vedlegget kunne ikke lastes opp.");
      setAttachments((current) => [data.attachment!, ...current]); setMessage("Vedlegg lagret");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Vedlegget kunne ikke lagres."); } finally { setBusy(false); }
  }
  async function deleteAttachment(id: string) {
    if (!selected) return;
    await api(`/api/notes/${selected.id}/attachments/${id}`, "DELETE");
    setAttachments((current) => current.filter((item) => item.id !== id));
  }
  async function restoreVersion(versionId: string) {
    if (!selected || !window.confirm("Gjenopprette denne versjonen? Dagens innhold lagres i historikken.")) return;
    setBusy(true);
    try {
      const { note } = await api<{ note: StudioNote }>(`/api/notes/${selected.id}/history`, "POST", { versionId });
      setNotes((current) => current.map((item) => item.id === note.id ? note : item)); setMessage("Versjon gjenopprettet"); void refreshExtras(note.id);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Versjonen kunne ikke gjenopprettes."); } finally { setBusy(false); }
  }
  async function createShare() {
    if (!selected) return;
    try { const data = await api<{ share: StudioNoteShare }>(`/api/notes/${selected.id}/share`, "POST"); setShare(data.share); await navigator.clipboard.writeText(`${window.location.origin}/shared/notes/${data.share.token}`); setMessage("Delingslenke kopiert"); } catch (error) { setMessage(error instanceof Error ? error.message : "Kunne ikke dele notatet."); }
  }
  async function revokeShare() {
    if (!selected) return;
    await api(`/api/notes/${selected.id}/share`, "DELETE"); setShare(null); setMessage("Delingslenken er deaktivert");
  }

  return <section className={`notes-board${compact ? " notes-board--compact" : ""}`} aria-label="Vedøy Notes">
    <div className="notes-board__toolbar"><div><small>{compact ? "RASKE NOTATER" : "VEDØY NOTES"}</small><h2>{compact ? "Tenk, skriv, gjør." : "Ditt arbeidsområde"}</h2></div><div className="notes-toolbar-actions">{!compact && <span className={online ? "is-online" : "is-offline"}><i />{online ? "Synkronisert" : "Lokal kladd"}</span>}<button type="button" className="button button--dark button--small" onClick={() => createNote()} disabled={busy}>+ Ny side</button></div></div>
    {!compact && <><div className="notes-templates"><span>Ny fra mal:</span>{templates.map((template) => <button type="button" key={template.label} onClick={() => createNote(template)} disabled={busy}>{template.label}</button>)}</div><div className="notes-filter-row"><label className="notes-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Søk i notater, tekst eller nøkkelord" aria-label="Søk i notater" /></label><label className="notes-pinned-filter"><input type="checkbox" checked={pinnedOnly} onChange={(event) => setPinnedOnly(event.target.checked)} /> Bare festet</label></div></>}
    <div className="notes-board__layout">
      {!compact && <aside className="notes-navigation"><small>NOTATBØKER</small><button className={notebookFilter === "Alle notater" ? "is-active" : ""} onClick={() => { setNotebookFilter("Alle notater"); setSectionFilter("Alle seksjoner"); }}>▤ Alle notater <span>{notes.length}</span></button>{notebooks.map((notebook) => <button key={notebook} className={notebookFilter === notebook ? "is-active" : ""} onClick={() => { setNotebookFilter(notebook); setSectionFilter("Alle seksjoner"); }}>▱ {notebook}<span>{notes.filter((note) => note.notebook === notebook).length}</span></button>)}<small>SEKSJONER</small><button className={sectionFilter === "Alle seksjoner" ? "is-active" : ""} onClick={() => setSectionFilter("Alle seksjoner")}>Alle seksjoner</button>{sections.map((section) => <button key={section} className={sectionFilter === section ? "is-active" : ""} onClick={() => setSectionFilter(section)}>— {section}</button>)}</aside>}
      <div className="notes-list">{filteredNotes.length ? filteredNotes.map((note) => <button type="button" key={note.id} className={`note-card note-card--${note.color}${selected?.id === note.id ? " is-selected" : ""}`} onClick={() => setSelectedId(note.id)}><span>{note.notebook} · {note.section}</span><strong>{note.title}</strong><p>{note.content || "Tom side"}</p><footer>{note.tags.slice(0, 2).map((tag) => <i key={tag}>#{tag}</i>)}</footer><time>{new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" }).format(new Date(note.updatedAt))}</time></button>) : <p className="notes-empty">Ingen sider her enda. Start med en mal eller en tom side.</p>}</div>
      {selected && <article className={`notes-editor notes-editor--${selected.color}`}><div className="notes-editor__top"><span>{selected.pinned ? "⌁ Festet side" : `${selected.notebook} / ${selected.section}`}</span><button type="button" onClick={removeNote} disabled={busy}>Slett</button></div><input value={selected.title} onChange={(event) => updateLocal(selected.id, { title: event.target.value })} onBlur={() => saveNote({ title: selected.title })} aria-label="Tittel" placeholder="Tittel" />
        {!compact && <div className="notes-properties"><label>Notatbok<select value={selected.notebook} onChange={(event) => changeGroup("notebook", event.target.value)}>{notebooks.map((notebook) => <option key={notebook}>{notebook}</option>)}<option value="__new__">+ Ny notatbok …</option></select></label><label>Seksjon<select value={selected.section} onChange={(event) => changeGroup("section", event.target.value)}>{[...new Set(notes.filter((note) => note.notebook === selected.notebook).map((note) => note.section))].map((section) => <option key={section}>{section}</option>)}<option value="__new__">+ Ny seksjon …</option></select></label></div>}
        {!compact && <div className="notes-formatting"><button type="button" onClick={() => appendText("## Overskrift")}>H</button><button type="button" onClick={() => appendText("- Punkt")}>•</button><button type="button" onClick={() => appendText("- [ ] Oppgave")}>☐</button><span>{tasks.length ? `${tasks.filter((task) => task.match?.[1].toLowerCase() === "x").length}/${tasks.length} oppgaver` : "Ren tekst"}</span></div>}
        <textarea value={selected.content} onChange={(event) => updateLocal(selected.id, { content: event.target.value })} onBlur={() => saveNote({ content: selected.content })} aria-label="Notatinnhold" placeholder="Skriv et notat …" />
        {!compact && <><div className="notes-tags">{selected.tags.map((tag) => <button key={tag} type="button" onClick={() => saveNote({ tags: selected.tags.filter((item) => item !== tag) })}>#{tag} ×</button>)}<input value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag(); } }} placeholder="Nøkkelord" aria-label="Legg til nøkkelord" /><button type="button" onClick={addTag}>Legg til</button></div>{tasks.length > 0 && <div className="notes-tasks"><strong>Oppgaver</strong>{tasks.map((task) => <label key={task.index}><input type="checkbox" checked={task.match?.[1].toLowerCase() === "x"} onChange={() => toggleTask(task.index)} /> <span>{task.match?.[2]}</span></label>)}</div>}<div className="notes-advanced-grid"><section><header><strong>Vedlegg</strong><label className="notes-upload">+ Last opp<input type="file" accept="image/png,image/jpeg,image/webp,application/pdf,text/plain,text/markdown" onChange={(event) => { void uploadAttachment(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label></header>{attachments.length ? <div className="notes-attachment-list">{attachments.map((attachment) => <div key={attachment.id}><a href={`/api/notes/${selected.id}/attachments/${attachment.id}`} target="_blank" rel="noreferrer"><span>⌕</span><div><strong>{attachment.filename}</strong><small>{Math.max(1, Math.round(attachment.sizeBytes / 1024))} KB</small></div></a><button type="button" onClick={() => void deleteAttachment(attachment.id)} aria-label={`Slett ${attachment.filename}`}>×</button></div>)}</div> : <p>PNG, JPG, WebP, PDF eller tekst · maks 2 MB.</p>}</section><section><header><strong>Versjonshistorikk</strong><span>{versions.length}</span></header>{versions.length ? <div className="notes-history-list">{versions.slice(0, 6).map((version) => <button type="button" key={version.id} onClick={() => void restoreVersion(version.id)}><span>{new Intl.DateTimeFormat("nb-NO", { dateStyle: "short", timeStyle: "short" }).format(new Date(version.createdAt))}</span><small>{version.title}</small></button>)}</div> : <p>Historikk opprettes når siden lagres.</p>}</section><section><header><strong>Deling</strong><span>Kun lesing</span></header>{share ? <><p>Alle med lenken kan lese denne siden.</p><div className="notes-share-actions"><button type="button" onClick={() => { void navigator.clipboard.writeText(`${window.location.origin}/shared/notes/${share.token}`); setMessage("Lenke kopiert"); }}>Kopier lenke</button><button type="button" onClick={() => void revokeShare()}>Deaktiver</button></div></> : <><p>Opprett en tilfeldig, sikker leselenke. Lenken kan deaktiveres når som helst.</p><button type="button" className="notes-share-button" onClick={() => void createShare()}>Opprett delingslenke</button></>}</section></div></>}
        <footer><div className="notes-colors" aria-label="Velg farge">{colorOptions.map((color) => <button type="button" key={color.value} className={`notes-color notes-color--${color.value}${selected.color === color.value ? " is-active" : ""}`} onClick={() => saveNote({ color: color.value })} aria-label={color.label} title={color.label} />)}</div><label className="notes-pin"><input type="checkbox" checked={selected.pinned} onChange={(event) => saveNote({ pinned: event.target.checked })} /> Fest</label><small aria-live="polite">{busy ? "Lagrer …" : message}</small></footer>
      </article>}
    </div>
  </section>;
}

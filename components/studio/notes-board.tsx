"use client";

import { useMemo, useState } from "react";
import type { StudioNote, StudioNoteColor } from "@/lib/types";

const colorOptions: Array<{ value: StudioNoteColor; label: string }> = [
  { value: "sand", label: "Sand" },
  { value: "lemon", label: "Gul" },
  { value: "mint", label: "Grønn" },
  { value: "lavender", label: "Lilla" },
  { value: "coral", label: "Korall" }
];

async function api<T>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Noe gikk galt.");
  return data;
}

export function NotesBoard({ initialNotes, compact = false }: { initialNotes: StudioNote[]; compact?: boolean }) {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedId, setSelectedId] = useState(initialNotes[0]?.id);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selected = notes.find((note) => note.id === selectedId) ?? notes[0];
  const filteredNotes = useMemo(() => notes.filter((note) => `${note.title} ${note.content}`.toLocaleLowerCase("nb-NO").includes(query.toLocaleLowerCase("nb-NO"))), [notes, query]);

  async function createNote() {
    setBusy(true); setMessage("");
    try {
      const { note } = await api<{ note: StudioNote }>("/api/notes", "POST", { title: "Nytt notat", content: "", color: "lemon", pinned: false });
      setNotes((current) => [note, ...current]);
      setSelectedId(note.id);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kunne ikke opprette notat."); }
    finally { setBusy(false); }
  }

  async function saveNote(patch: Partial<StudioNote>) {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      const { note } = await api<{ note: StudioNote }>(`/api/notes/${selected.id}`, "PATCH", patch);
      setNotes((current) => current.map((item) => item.id === note.id ? note : item).sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      setSelectedId(note.id);
      setMessage("Lagret");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kunne ikke lagre notatet."); }
    finally { setBusy(false); }
  }

  async function removeNote() {
    if (!selected || !window.confirm("Slette dette notatet?")) return;
    setBusy(true); setMessage("");
    try {
      await api(`/api/notes/${selected.id}`, "DELETE");
      const next = notes.filter((note) => note.id !== selected.id);
      setNotes(next); setSelectedId(next[0]?.id);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kunne ikke slette notatet."); }
    finally { setBusy(false); }
  }

  return <section className={`notes-board${compact ? " notes-board--compact" : ""}`} aria-label="Studio-notater">
    <div className="notes-board__toolbar">
      <div><small>{compact ? "RASKE NOTATER" : "VEDØY NOTES"}</small><h2>{compact ? "Tenk, skriv, gjør." : "Dine notater"}</h2></div>
      <button type="button" className="button button--dark button--small" onClick={createNote} disabled={busy}>+ Nytt notat</button>
    </div>
    {!compact && <label className="notes-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Søk i notater" aria-label="Søk i notater" /></label>}
    <div className="notes-board__layout">
      <div className="notes-list">
        {filteredNotes.length ? filteredNotes.map((note) => <button type="button" key={note.id} className={`note-card note-card--${note.color}${selected?.id === note.id ? " is-selected" : ""}`} onClick={() => setSelectedId(note.id)}>
          <span>{note.pinned ? "⌁ Festet" : "Notat"}</span><strong>{note.title}</strong><p>{note.content || "Tomt notat"}</p><time>{new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" }).format(new Date(note.updatedAt))}</time>
        </button>) : <p className="notes-empty">Ingen notater enda. Skriv ned neste gode idé.</p>}
      </div>
      {selected && <article className={`notes-editor notes-editor--${selected.color}`}>
        <div className="notes-editor__top"><span>{selected.pinned ? "⌁ Festet" : "Privat notat"}</span><button type="button" onClick={removeNote} disabled={busy}>Slett</button></div>
        <input value={selected.title} onChange={(event) => setNotes((current) => current.map((note) => note.id === selected.id ? { ...note, title: event.target.value } : note))} onBlur={() => saveNote({ title: selected.title })} aria-label="Tittel" placeholder="Tittel" />
        <textarea value={selected.content} onChange={(event) => setNotes((current) => current.map((note) => note.id === selected.id ? { ...note, content: event.target.value } : note))} onBlur={() => saveNote({ content: selected.content })} aria-label="Notatinnhold" placeholder="Skriv et notat …" />
        <footer><div className="notes-colors" aria-label="Velg farge">{colorOptions.map((color) => <button type="button" key={color.value} className={`notes-color notes-color--${color.value}${selected.color === color.value ? " is-active" : ""}`} onClick={() => saveNote({ color: color.value })} aria-label={color.label} title={color.label} />)}</div><label className="notes-pin"><input type="checkbox" checked={selected.pinned} onChange={(event) => saveNote({ pinned: event.target.checked })} /> Fest</label><small aria-live="polite">{busy ? "Lagrer …" : message}</small></footer>
      </article>}
    </div>
  </section>;
}

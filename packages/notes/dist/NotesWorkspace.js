"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
const colorOptions = [
    { value: "sand", label: "Sand" }, { value: "lemon", label: "Gul" }, { value: "mint", label: "Grønn" }, { value: "lavender", label: "Lilla" }, { value: "coral", label: "Korall" }
];
const templates = [
    { label: "Kundemøte", title: "Kundemøte · ", content: "Deltakere:\n\nBehov:\n\nAvtalt neste steg:\n\nOppfølging:", color: "mint" },
    { label: "Lansering", title: "Lanseringssjekk", content: "Mål:\n\n- [ ] Sjekk innhold\n- [ ] Test skjema og lenker\n- [ ] Publiser\n\nEtter lansering:", color: "lemon" },
    { label: "Idé", title: "Ny idé", content: "Problemet:\n\nLøsningen:\n\nHvem hjelper dette:\n\nNeste minste steg:\n- [ ] ", color: "lavender" }
];
async function api(url, method, body) {
    const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const data = await response.json();
    if (!response.ok)
        throw new Error(data.error || "Noe gikk galt.");
    return data;
}
export function NotesWorkspace({ initialNotes, compact = false }) {
    const [notes, setNotes] = useState(initialNotes);
    const [selectedId, setSelectedId] = useState(initialNotes[0]?.id);
    const [query, setQuery] = useState("");
    const [notebookFilter, setNotebookFilter] = useState("Alle notater");
    const [sectionFilter, setSectionFilter] = useState("Alle seksjoner");
    const [pinnedOnly, setPinnedOnly] = useState(false);
    const [tagDraft, setTagDraft] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [versions, setVersions] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [share, setShare] = useState(null);
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
        update();
        window.addEventListener("online", update);
        window.addEventListener("offline", update);
        return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
    }, []);
    useEffect(() => {
        if (!selected || compact)
            return;
        const raw = localStorage.getItem(`vedoy-note-draft:${selected.id}`);
        if (raw)
            try {
                const draft = JSON.parse(raw);
                if ((draft.savedAt ?? 0) > new Date(selected.updatedAt).getTime() && (draft.title !== selected.title || draft.content !== selected.content)) {
                    updateLocal(selected.id, { title: draft.title ?? selected.title, content: draft.content ?? selected.content });
                    setMessage("Lokal kladd gjenopprettet");
                }
            }
            catch {
                localStorage.removeItem(`vedoy-note-draft:${selected.id}`);
            }
        void refreshExtras(selected.id);
        // selectedId is the intended boundary; local edits must not trigger a reload.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, compact]);
    useEffect(() => {
        if (!selected || compact)
            return;
        localStorage.setItem(`vedoy-note-draft:${selected.id}`, JSON.stringify({ title: selected.title, content: selected.content, savedAt: Date.now() }));
    }, [selected?.id, selected?.title, selected?.content, compact]);
    async function refreshExtras(noteId) {
        try {
            const [historyResponse, attachmentsResponse, shareResponse] = await Promise.all([
                fetch(`/api/notes/${noteId}/history`), fetch(`/api/notes/${noteId}/attachments`), fetch(`/api/notes/${noteId}/share`)
            ]);
            if (historyResponse.ok)
                setVersions((await historyResponse.json()).versions);
            if (attachmentsResponse.ok)
                setAttachments((await attachmentsResponse.json()).attachments);
            if (shareResponse.ok)
                setShare((await shareResponse.json()).share);
        }
        catch {
            setMessage("Arbeider fra lokal kladd");
        }
    }
    function updateLocal(id, patch) { setNotes((current) => current.map((note) => note.id === id ? { ...note, ...patch } : note)); }
    async function createNote(template) {
        setBusy(true);
        setMessage("");
        try {
            const { note } = await api("/api/notes", "POST", { title: template?.title ?? "Nytt notat", content: template?.content ?? "", color: template?.color ?? "lemon", pinned: false, notebook: notebookFilter === "Alle notater" ? "Arbeidsområde" : notebookFilter, section: sectionFilter === "Alle seksjoner" ? "Generelt" : sectionFilter, tags: [] });
            setNotes((current) => [note, ...current]);
            setSelectedId(note.id);
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : "Kunne ikke opprette notat.");
        }
        finally {
            setBusy(false);
        }
    }
    async function saveNote(patch) {
        if (!selected)
            return;
        setBusy(true);
        setMessage("");
        try {
            const { note } = await api(`/api/notes/${selected.id}`, "PATCH", patch);
            setNotes((current) => current.map((item) => item.id === note.id ? note : item).sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
            setSelectedId(note.id);
            localStorage.removeItem(`vedoy-note-draft:${note.id}`);
            setMessage("Lagret");
            if (!compact)
                void refreshExtras(note.id);
        }
        catch (error) {
            setMessage(!navigator.onLine ? "Ingen nett – kladden er lagret lokalt" : error instanceof Error ? error.message : "Kunne ikke lagre notatet.");
        }
        finally {
            setBusy(false);
        }
    }
    async function removeNote() {
        if (!selected || !window.confirm("Slette dette notatet?"))
            return;
        setBusy(true);
        setMessage("");
        try {
            await api(`/api/notes/${selected.id}`, "DELETE");
            const next = notes.filter((note) => note.id !== selected.id);
            setNotes(next);
            setSelectedId(next[0]?.id);
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : "Kunne ikke slette notatet.");
        }
        finally {
            setBusy(false);
        }
    }
    function addTag() { if (!selected)
        return; const tag = tagDraft.trim().replace(/^#/, ""); if (!tag || selected.tags.includes(tag))
        return; setTagDraft(""); saveNote({ tags: [...selected.tags, tag] }); }
    function appendText(text) { if (!selected)
        return; const content = `${selected.content}${selected.content && !selected.content.endsWith("\n") ? "\n" : ""}${text}`; updateLocal(selected.id, { content }); saveNote({ content }); }
    function toggleTask(index) { if (!selected)
        return; const lines = selected.content.split("\n"); lines[index] = lines[index].replace(/^- \[([ x])\]/i, (_, checked) => `- [${checked.toLowerCase() === "x" ? " " : "x"}]`); const content = lines.join("\n"); updateLocal(selected.id, { content }); saveNote({ content }); }
    function changeGroup(field, value) { if (!selected)
        return; const next = value === "__new__" ? window.prompt(field === "notebook" ? "Navn på ny notatbok" : "Navn på ny seksjon")?.trim() : value; if (!next)
        return; updateLocal(selected.id, { [field]: next }); saveNote({ [field]: next }); }
    async function uploadAttachment(file) {
        if (!selected || !file)
            return;
        setBusy(true);
        setMessage("");
        try {
            const form = new FormData();
            form.set("file", file);
            const response = await fetch(`/api/notes/${selected.id}/attachments`, { method: "POST", body: form });
            const data = await response.json();
            if (!response.ok || !data.attachment)
                throw new Error(data.error || "Vedlegget kunne ikke lastes opp.");
            setAttachments((current) => [data.attachment, ...current]);
            setMessage("Vedlegg lagret");
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : "Vedlegget kunne ikke lagres.");
        }
        finally {
            setBusy(false);
        }
    }
    async function deleteAttachment(id) {
        if (!selected)
            return;
        await api(`/api/notes/${selected.id}/attachments/${id}`, "DELETE");
        setAttachments((current) => current.filter((item) => item.id !== id));
    }
    async function restoreVersion(versionId) {
        if (!selected || !window.confirm("Gjenopprette denne versjonen? Dagens innhold lagres i historikken."))
            return;
        setBusy(true);
        try {
            const { note } = await api(`/api/notes/${selected.id}/history`, "POST", { versionId });
            setNotes((current) => current.map((item) => item.id === note.id ? note : item));
            setMessage("Versjon gjenopprettet");
            void refreshExtras(note.id);
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : "Versjonen kunne ikke gjenopprettes.");
        }
        finally {
            setBusy(false);
        }
    }
    async function createShare() {
        if (!selected)
            return;
        try {
            const data = await api(`/api/notes/${selected.id}/share`, "POST");
            setShare(data.share);
            await navigator.clipboard.writeText(`${window.location.origin}/shared/notes/${data.share.token}`);
            setMessage("Delingslenke kopiert");
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : "Kunne ikke dele notatet.");
        }
    }
    async function revokeShare() {
        if (!selected)
            return;
        await api(`/api/notes/${selected.id}/share`, "DELETE");
        setShare(null);
        setMessage("Delingslenken er deaktivert");
    }
    return _jsxs("section", { className: `notes-board${compact ? " notes-board--compact" : ""}`, "aria-label": "Ved\u00F8y Notes", children: [_jsxs("div", { className: "notes-board__toolbar", children: [_jsxs("div", { children: [_jsx("small", { children: compact ? "RASKE NOTATER" : "VEDØY NOTES" }), _jsx("h2", { children: compact ? "Tenk, skriv, gjør." : "Ditt arbeidsområde" })] }), _jsxs("div", { className: "notes-toolbar-actions", children: [!compact && _jsxs("span", { className: online ? "is-online" : "is-offline", children: [_jsx("i", {}), online ? "Synkronisert" : "Lokal kladd"] }), _jsx("button", { type: "button", className: "button button--dark button--small", onClick: () => createNote(), disabled: busy, children: "+ Ny side" })] })] }), !compact && _jsxs(_Fragment, { children: [_jsxs("div", { className: "notes-templates", children: [_jsx("span", { children: "Ny fra mal:" }), templates.map((template) => _jsx("button", { type: "button", onClick: () => createNote(template), disabled: busy, children: template.label }, template.label))] }), _jsxs("div", { className: "notes-filter-row", children: [_jsxs("label", { className: "notes-search", children: [_jsx("span", { children: "\u2315" }), _jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "S\u00F8k i notater, tekst eller n\u00F8kkelord", "aria-label": "S\u00F8k i notater" })] }), _jsxs("label", { className: "notes-pinned-filter", children: [_jsx("input", { type: "checkbox", checked: pinnedOnly, onChange: (event) => setPinnedOnly(event.target.checked) }), " Bare festet"] })] })] }), _jsxs("div", { className: "notes-board__layout", children: [!compact && _jsxs("aside", { className: "notes-navigation", children: [_jsx("small", { children: "NOTATB\u00D8KER" }), _jsxs("button", { className: notebookFilter === "Alle notater" ? "is-active" : "", onClick: () => { setNotebookFilter("Alle notater"); setSectionFilter("Alle seksjoner"); }, children: ["\u25A4 Alle notater ", _jsx("span", { children: notes.length })] }), notebooks.map((notebook) => _jsxs("button", { className: notebookFilter === notebook ? "is-active" : "", onClick: () => { setNotebookFilter(notebook); setSectionFilter("Alle seksjoner"); }, children: ["\u25B1 ", notebook, _jsx("span", { children: notes.filter((note) => note.notebook === notebook).length })] }, notebook)), _jsx("small", { children: "SEKSJONER" }), _jsx("button", { className: sectionFilter === "Alle seksjoner" ? "is-active" : "", onClick: () => setSectionFilter("Alle seksjoner"), children: "Alle seksjoner" }), sections.map((section) => _jsxs("button", { className: sectionFilter === section ? "is-active" : "", onClick: () => setSectionFilter(section), children: ["\u2014 ", section] }, section))] }), _jsx("div", { className: "notes-list", children: filteredNotes.length ? filteredNotes.map((note) => _jsxs("button", { type: "button", className: `note-card note-card--${note.color}${selected?.id === note.id ? " is-selected" : ""}`, onClick: () => setSelectedId(note.id), children: [_jsxs("span", { children: [note.notebook, " \u00B7 ", note.section] }), _jsx("strong", { children: note.title }), _jsx("p", { children: note.content || "Tom side" }), _jsx("footer", { children: note.tags.slice(0, 2).map((tag) => _jsxs("i", { children: ["#", tag] }, tag)) }), _jsx("time", { children: new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" }).format(new Date(note.updatedAt)) })] }, note.id)) : _jsx("p", { className: "notes-empty", children: "Ingen sider her enda. Start med en mal eller en tom side." }) }), selected && _jsxs("article", { className: `notes-editor notes-editor--${selected.color}`, children: [_jsxs("div", { className: "notes-editor__top", children: [_jsx("span", { children: selected.pinned ? "⌁ Festet side" : `${selected.notebook} / ${selected.section}` }), _jsx("button", { type: "button", onClick: removeNote, disabled: busy, children: "Slett" })] }), _jsx("input", { value: selected.title, onChange: (event) => updateLocal(selected.id, { title: event.target.value }), onBlur: () => saveNote({ title: selected.title }), "aria-label": "Tittel", placeholder: "Tittel" }), !compact && _jsxs("div", { className: "notes-properties", children: [_jsxs("label", { children: ["Notatbok", _jsxs("select", { value: selected.notebook, onChange: (event) => changeGroup("notebook", event.target.value), children: [notebooks.map((notebook) => _jsx("option", { children: notebook }, notebook)), _jsx("option", { value: "__new__", children: "+ Ny notatbok \u2026" })] })] }), _jsxs("label", { children: ["Seksjon", _jsxs("select", { value: selected.section, onChange: (event) => changeGroup("section", event.target.value), children: [[...new Set(notes.filter((note) => note.notebook === selected.notebook).map((note) => note.section))].map((section) => _jsx("option", { children: section }, section)), _jsx("option", { value: "__new__", children: "+ Ny seksjon \u2026" })] })] })] }), !compact && _jsxs("div", { className: "notes-formatting", children: [_jsx("button", { type: "button", onClick: () => appendText("## Overskrift"), children: "H" }), _jsx("button", { type: "button", onClick: () => appendText("- Punkt"), children: "\u2022" }), _jsx("button", { type: "button", onClick: () => appendText("- [ ] Oppgave"), children: "\u2610" }), _jsx("span", { children: tasks.length ? `${tasks.filter((task) => task.match?.[1].toLowerCase() === "x").length}/${tasks.length} oppgaver` : "Ren tekst" })] }), _jsx("textarea", { value: selected.content, onChange: (event) => updateLocal(selected.id, { content: event.target.value }), onBlur: () => saveNote({ content: selected.content }), "aria-label": "Notatinnhold", placeholder: "Skriv et notat \u2026" }), !compact && _jsxs(_Fragment, { children: [_jsxs("div", { className: "notes-tags", children: [selected.tags.map((tag) => _jsxs("button", { type: "button", onClick: () => saveNote({ tags: selected.tags.filter((item) => item !== tag) }), children: ["#", tag, " \u00D7"] }, tag)), _jsx("input", { value: tagDraft, onChange: (event) => setTagDraft(event.target.value), onKeyDown: (event) => { if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    addTag();
                                                } }, placeholder: "N\u00F8kkelord", "aria-label": "Legg til n\u00F8kkelord" }), _jsx("button", { type: "button", onClick: addTag, children: "Legg til" })] }), tasks.length > 0 && _jsxs("div", { className: "notes-tasks", children: [_jsx("strong", { children: "Oppgaver" }), tasks.map((task) => _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: task.match?.[1].toLowerCase() === "x", onChange: () => toggleTask(task.index) }), " ", _jsx("span", { children: task.match?.[2] })] }, task.index))] }), _jsxs("div", { className: "notes-advanced-grid", children: [_jsxs("section", { children: [_jsxs("header", { children: [_jsx("strong", { children: "Vedlegg" }), _jsxs("label", { className: "notes-upload", children: ["+ Last opp", _jsx("input", { type: "file", accept: "image/png,image/jpeg,image/webp,application/pdf,text/plain,text/markdown", onChange: (event) => { void uploadAttachment(event.target.files?.[0]); event.currentTarget.value = ""; } })] })] }), attachments.length ? _jsx("div", { className: "notes-attachment-list", children: attachments.map((attachment) => _jsxs("div", { children: [_jsxs("a", { href: `/api/notes/${selected.id}/attachments/${attachment.id}`, target: "_blank", rel: "noreferrer", children: [_jsx("span", { children: "\u2315" }), _jsxs("div", { children: [_jsx("strong", { children: attachment.filename }), _jsxs("small", { children: [Math.max(1, Math.round(attachment.sizeBytes / 1024)), " KB"] })] })] }), _jsx("button", { type: "button", onClick: () => void deleteAttachment(attachment.id), "aria-label": `Slett ${attachment.filename}`, children: "\u00D7" })] }, attachment.id)) }) : _jsx("p", { children: "PNG, JPG, WebP, PDF eller tekst \u00B7 maks 2 MB." })] }), _jsxs("section", { children: [_jsxs("header", { children: [_jsx("strong", { children: "Versjonshistorikk" }), _jsx("span", { children: versions.length })] }), versions.length ? _jsx("div", { className: "notes-history-list", children: versions.slice(0, 6).map((version) => _jsxs("button", { type: "button", onClick: () => void restoreVersion(version.id), children: [_jsx("span", { children: new Intl.DateTimeFormat("nb-NO", { dateStyle: "short", timeStyle: "short" }).format(new Date(version.createdAt)) }), _jsx("small", { children: version.title })] }, version.id)) }) : _jsx("p", { children: "Historikk opprettes n\u00E5r siden lagres." })] }), _jsxs("section", { children: [_jsxs("header", { children: [_jsx("strong", { children: "Deling" }), _jsx("span", { children: "Kun lesing" })] }), share ? _jsxs(_Fragment, { children: [_jsx("p", { children: "Alle med lenken kan lese denne siden." }), _jsxs("div", { className: "notes-share-actions", children: [_jsx("button", { type: "button", onClick: () => { void navigator.clipboard.writeText(`${window.location.origin}/shared/notes/${share.token}`); setMessage("Lenke kopiert"); }, children: "Kopier lenke" }), _jsx("button", { type: "button", onClick: () => void revokeShare(), children: "Deaktiver" })] })] }) : _jsxs(_Fragment, { children: [_jsx("p", { children: "Opprett en tilfeldig, sikker leselenke. Lenken kan deaktiveres n\u00E5r som helst." }), _jsx("button", { type: "button", className: "notes-share-button", onClick: () => void createShare(), children: "Opprett delingslenke" })] })] })] })] }), _jsxs("footer", { children: [_jsx("div", { className: "notes-colors", "aria-label": "Velg farge", children: colorOptions.map((color) => _jsx("button", { type: "button", className: `notes-color notes-color--${color.value}${selected.color === color.value ? " is-active" : ""}`, onClick: () => saveNote({ color: color.value }), "aria-label": color.label, title: color.label }, color.value)) }), _jsxs("label", { className: "notes-pin", children: [_jsx("input", { type: "checkbox", checked: selected.pinned, onChange: (event) => saveNote({ pinned: event.target.checked }) }), " Fest"] }), _jsx("small", { "aria-live": "polite", children: busy ? "Lagrer …" : message })] })] })] })] });
}
//# sourceMappingURL=NotesWorkspace.js.map
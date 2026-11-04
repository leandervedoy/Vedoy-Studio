"use client";
import { useState } from "react";
import type { VedoyNewsPost } from "@/lib/types";
import { NEWS_PROJECTS, NEWS_TOPICS, decodeNewsCategory, type NewsProjectSlug, type NewsTopicSlug } from "@/lib/news-taxonomy";

type Form = {
  title: string;
  excerpt: string;
  content: string;
  project: NewsProjectSlug;
  topic: NewsTopicSlug;
  authorType: "user" | "vedi";
};
const empty: Form = { title: "", excerpt: "", content: "", project: "vedoy", topic: "nyheter", authorType: "user" };

export function NewsManager({ initialPosts, authorName, canPublish }: {
  initialPosts: VedoyNewsPost[];
  authorName: string;
  authorAvatarUrl?: string;
  canPublish: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [form, setForm] = useState<Form>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));

  async function save() {
    if (saving) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch(editingId ? `/api/news/${editingId}` : "/api/news", {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kunne ikke lagre.");
      setPosts((previous) => editingId
        ? previous.map((post) => post.id === editingId ? data.post : post)
        : [data.post, ...previous]);
      setForm(empty); setEditingId(null);
      setMessage("Innlegget er lagret.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kunne ikke lagre."); }
    finally { setSaving(false); }
  }

  async function changeStatus(id: string, status: "draft" | "published") {
    if (saving) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kunne ikke endre status.");
      setPosts((previous) => previous.map((post) => post.id === id ? data.post : post));
      setMessage(status === "published" ? "Innlegget er publisert." : "Innlegget er avpublisert.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kunne ikke oppdatere."); }
    finally { setSaving(false); }
  }

  async function weeklyDraft() {
    if (saving) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/news/weekly", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kunne ikke lage utkast.");
      setPosts((previous) => [data.post, ...previous]);
      setMessage("Vedi-utkast opprettet. Rediger og godkjenn før publisering.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kunne ikke lage utkast."); }
    finally { setSaving(false); }
  }
  return <div className="news-manager">
    <section className="studio-panel">
      <div className="panel-heading"><div><small>{editingId ? "REDIGER INNLEGG" : "NYTT INNLEGG"}</small><h2>{editingId ? "Oppdater nyheten" : "Opprett nyhetsutkast"}</h2></div></div>
      <label htmlFor="news-title">Tittel</label>
      <input id="news-title" required placeholder="Tittel" value={form.title} onChange={(event) => set("title", event.target.value)} />
      <label htmlFor="news-excerpt">Ingress</label>
      <input id="news-excerpt" required placeholder="Kort ingress" value={form.excerpt} onChange={(event) => set("excerpt", event.target.value)} />
      <label htmlFor="news-project">Prosjekt / produkt</label>
      <select id="news-project" value={form.project} onChange={(event) => set("project", event.target.value as NewsProjectSlug)}>
        {NEWS_PROJECTS.map((project) => <option key={project.slug} value={project.slug}>{project.label}</option>)}
      </select>
      <label htmlFor="news-category">Kategori</label>
      <select id="news-category" value={form.topic} onChange={(event) => set("topic", event.target.value as NewsTopicSlug)}>
        {NEWS_TOPICS.map((topic) => <option key={topic.slug} value={topic.slug}>{topic.label}</option>)}
      </select>
      {!editingId && <>
        <label htmlFor="news-author">Forfatter</label>
        <select id="news-author" value={form.authorType} onChange={(event) => set("authorType", event.target.value as Form["authorType"])}>
          <option value="user">Skrevet av {authorName}</option><option value="vedi">Skrevet av Vedi · KI</option>
        </select>
      </>}
      <label htmlFor="news-content">Artikkel</label>
      <textarea id="news-content" rows={12} placeholder="Skriv nyheten her …" value={form.content} onChange={(event) => set("content", event.target.value)} />
      <button className="button button--dark" disabled={saving || !form.title.trim() || !form.excerpt.trim() || !form.content.trim()} type="button" onClick={save}>{saving ? "Lagrer …" : editingId ? "Lagre endringer" : "Lagre som kladd"}</button>
      {editingId && <button className="button button--small" type="button" onClick={() => { setEditingId(null); setForm(empty); }}>Avbryt</button>}
      {message && <p role="status">{message}</p>}
    </section>
    <section className="studio-panel">
      <div className="panel-heading"><div><small>INNLEGG</small><h2>{posts.length} nyheter og utkast</h2></div><button className="button button--small" disabled={saving} type="button" onClick={weeklyDraft}>Lag Vedi-utkast</button></div>
      {posts.map((post) => {
        const category = decodeNewsCategory(post.category);
        return <article className="news-admin-row" key={post.id}>
          <div><strong>{post.title || "Uten tittel"}</strong><span>{category.projectLabel} / {category.topicLabel} · {post.status} · {post.authorName}</span></div>
          <div>
            <button className="button button--small" disabled={saving} type="button" onClick={() => {
              setEditingId(post.id);
              setForm({ title: post.title, excerpt: post.excerpt, content: post.content, project: category.project, topic: category.topic, authorType: post.authorType });
              setMessage("");
            }}>Rediger</button>
            {canPublish && (post.status === "draft"
              ? <button className="button button--small button--dark" disabled={saving} type="button" onClick={() => changeStatus(post.id, "published")}>Publiser</button>
              : <button className="button button--small" disabled={saving} type="button" onClick={() => changeStatus(post.id, "draft")}>Avpubliser</button>)}
          </div>
        </article>;
      })}
    </section>
  </div>;
}

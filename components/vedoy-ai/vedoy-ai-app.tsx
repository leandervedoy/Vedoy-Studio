"use client";

import Image from "next/image";
import { AccountTools } from "./account-tools";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { aiBrowser, aiFetch } from "@/lib/vedoy-ai/browser";
import { categories, colors, type Agent, type Conversation, type Locale, type Message, type Settings } from "@/lib/vedoy-ai/types";

const copy = {
  nb: { library: "Assistenter", chats: "Samtaler", settings: "Innstillinger", title: "Hva vil du få gjort?", subtitle: "Velg en assistent eller lag din egen.", search: "Søk i assistenter", add: "Ny assistent", mine: "Mine", all: "Alle", hidden: "Skjulte", edit: "Rediger", hide: "Skjul", show: "Vis", remove: "Slett", favorite: "Favoritt", start: "Start samtale", save: "Lagre", cancel: "Avbryt", name: "Navn", description: "Kort beskrivelse", prompt: "Instruksjon til assistenten", category: "Kategori", language: "Språk", workspace: "Navn på arbeidsrom", compact: "Kompakt visning", signIn: "Logg inn", email: "E-postadresse", magic: "Send innloggingslenke", vedoy: "Logg inn med Vedøy", sent: "Sjekk e-posten din for innloggingslenken.", signOut: "Logg ut", empty: "Ingen assistenter matcher søket.", ask: "Skriv en melding …", send: "Send", back: "Tilbake", welcome: "Velkommen til Vedøy AI", loginText: "Logg inn for å lagre assistenter, innstillinger og samtaler på alle enhetene dine.", setup: "Vedøy AI må kobles til Supabase før innlogging kan brukes.", deleteConfirm: "Slette denne assistenten permanent?", historyEmpty: "Du har ingen lagrede samtaler ennå.", newChat: "Ny samtale", system: "Vedøy", own: "Din", error: "Noe gikk galt. Prøv igjen.", aiMissing: "AI-nøkkelen er ikke konfigurert ennå." },
  en: { library: "Assistants", chats: "Chats", settings: "Settings", title: "What do you want to get done?", subtitle: "Choose an assistant or create your own.", search: "Search assistants", add: "New assistant", mine: "Mine", all: "All", hidden: "Hidden", edit: "Edit", hide: "Hide", show: "Show", remove: "Delete", favorite: "Favorite", start: "Start chat", save: "Save", cancel: "Cancel", name: "Name", description: "Short description", prompt: "Instructions for the assistant", category: "Category", language: "Language", workspace: "Workspace name", compact: "Compact view", signIn: "Sign in", email: "Email address", magic: "Send sign-in link", vedoy: "Sign in with Vedøy", sent: "Check your email for the sign-in link.", signOut: "Sign out", empty: "No assistants match your search.", ask: "Write a message …", send: "Send", back: "Back", welcome: "Welcome to Vedøy AI", loginText: "Sign in to keep assistants, settings and chats synced across devices.", setup: "Connect Vedøy AI to Supabase before sign-in can be used.", deleteConfirm: "Delete this assistant permanently?", historyEmpty: "You have no saved chats yet.", newChat: "New chat", system: "Vedøy", own: "Yours", error: "Something went wrong. Try again.", aiMissing: "The AI key has not been configured yet." }
} as const;

const icons: Record<string, string> = { general: "✦", writing: "Aa", business: "↗", technology: "{}", creative: "◇" };
const defaults = { name: "", description: "", system_prompt: "", category: "general", color: "sage" };

export function VedoyAiApp() {
  const client = aiBrowser();
  const vedoyProvider = process.env.NEXT_PUBLIC_AI_OAUTH_PROVIDER;
  const [locale, setLocale] = useState<Locale>("nb");
  const t = copy[locale];
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [settings, setSettings] = useState<Settings>({ locale: "nb", workspace_name: "Mitt arbeidsrom", compact: false });
  const [view, setView] = useState<"library" | "chats" | "settings">("library");
  const [filter, setFilter] = useState<"all" | "mine" | "hidden">("all");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<(typeof defaults & { id?: string }) | null>(null);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!client) { setLoading(false); return; }
    client.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); }).catch(() => { setLoading(false); setNotice(t.error); });
    const { data } = client.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    if (!user) { setAgents([]); setConversations([]); setActiveAgent(null); setConversation(null); return; }
    let cancelled = false;
    Promise.all([aiFetch<Agent[]>("/agents"), aiFetch<Conversation[]>("/conversations"), aiFetch<Settings>("/settings")])
      .then(([nextAgents, nextChats, nextSettings]) => { if (cancelled) return; setAgents(nextAgents); setConversations(nextChats); setSettings(nextSettings); setLocale(nextSettings.locale); })
      .catch(() => setNotice(t.error));
    return () => { cancelled = true; };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleAgents = useMemo(() => agents.filter(agent => {
    if (filter === "mine" && agent.is_system) return false;
    if (filter === "hidden" && !agent.hidden) return false;
    if (filter !== "hidden" && agent.hidden) return false;
    const needle = search.toLowerCase();
    return !needle || `${agent.name} ${agent.description}`.toLowerCase().includes(needle);
  }).sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite))), [agents, filter, search]);

  async function login(event: FormEvent) {
    event.preventDefault(); if (!client) return;
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/ai` } });
    setNotice(error ? t.error : t.sent);
  }
  async function vedoyLogin() {
    if (!client || !vedoyProvider) return;
    const provider = vedoyProvider as Parameters<typeof client.auth.signInWithOAuth>[0]["provider"];
    const { error } = await client.auth.signInWithOAuth({ provider, options: { redirectTo: `${location.origin}/ai` } });
    if (error) setNotice(t.error);
  }
  async function saveAgent(event: FormEvent) {
    event.preventDefault(); if (!editor) return;
    try {
      const result = await aiFetch<Agent>(editor.id ? `/agents/${editor.id}` : "/agents", { method: editor.id ? "PATCH" : "POST", body: JSON.stringify(editor) });
      setAgents(current => editor.id ? current.map(item => item.id === result.id ? { ...item, ...result } : item) : [result, ...current]); setEditor(null);
    } catch { setNotice(t.error); }
  }
  async function preference(agent: Agent, changes: Partial<Pick<Agent, "hidden" | "favorite">>) {
    const updated = { ...agent, ...changes };
    setAgents(current => current.map(item => item.id === agent.id ? updated : item));
    try { await aiFetch(`/agents/${agent.id}`, { method: "PATCH", body: JSON.stringify({ action: "preferences", hidden: Boolean(updated.hidden), favorite: Boolean(updated.favorite) }) }); }
    catch { setAgents(current => current.map(item => item.id === agent.id ? agent : item)); setNotice(t.error); }
  }
  async function remove(agent: Agent) {
    if (!confirm(t.deleteConfirm)) return;
    try { await aiFetch(`/agents/${agent.id}`, { method: "DELETE" }); setAgents(current => current.filter(item => item.id !== agent.id)); }
    catch { setNotice(t.error); }
  }
  async function openConversation(chat: Conversation) {
    try { const full = await aiFetch<Conversation>(`/conversations/${chat.id}`); setConversation(full); setActiveAgent(agents.find(a => a.id === full.agent_id) || null); }
    catch { setNotice(t.error); }
  }
  async function removeConversation(id: string) {
    if (!confirm(locale === "en" ? "Delete this conversation permanently?" : "Slette denne samtalen permanent?")) return;
    try { await aiFetch(`/conversations?id=${id}`, { method: "DELETE" }); setConversations(current => current.filter(item => item.id !== id)); }
    catch { setNotice(t.error); }
  }
  async function send(event: FormEvent) {
    event.preventDefault(); if (!activeAgent || !message.trim() || sending) return;
    const text = message.trim(); setMessage(""); setSending(true);
    const optimistic: Message[] = [...(conversation?.messages || []), { role: "user", content: text }];
    setConversation(current => ({ id: current?.id || "pending", agent_id: activeAgent.id, title: current?.title || text, updated_at: new Date().toISOString(), messages: optimistic }));
    try {
      const saved = await aiFetch<Conversation>("/chat", { method: "POST", body: JSON.stringify({ agent_id: activeAgent.id, conversation_id: conversation?.id === "pending" ? undefined : conversation?.id, message: text, locale }) });
      setConversation(saved); setConversations(current => [saved, ...current.filter(item => item.id !== saved.id)]);
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      const errors: Record<string, string> = {
        ai_not_configured: t.aiMissing,
        subscription_required: locale === "en" ? "An active subscription is required. Open Settings." : "Et aktivt abonnement kreves. Åpne Innstillinger.",
        conversation_full: locale === "en" ? "This conversation is full. Start a new chat." : "Samtalen er full. Start en ny samtale.",
        conversation_changed: locale === "en" ? "The conversation changed in another window. Open it again." : "Samtalen ble endret i et annet vindu. Åpne den på nytt.",
        daily_limit: locale === "en" ? "Daily limit reached. Try again tomorrow." : "Dagens grense er nådd. Prøv igjen i morgen."
      };
      setNotice(errors[code] || t.error); setConversation(conversation); setMessage(text);
    }
    finally { setSending(false); }
  }
  async function saveSettings(event: FormEvent) {
    event.preventDefault(); try { await aiFetch("/settings", { method: "PUT", body: JSON.stringify(settings) }); setLocale(settings.locale); setNotice(t.save + " ✓"); } catch { setNotice(t.error); }
  }

  if (loading) return <main className="vai-center"><div className="vai-loader" /></main>;
  if (!user) return <main className="vai-login"><section><Image src="/imgs/Logos/Vedoy_Logo_B.png" width={152} height={54} alt="Vedøy" priority /><span className="vai-product">AI</span><h1>{t.welcome}</h1><p>{client ? t.loginText : t.setup}</p>{client && <>{vedoyProvider && <><button className="vai-primary vai-wide" onClick={vedoyLogin}>{t.vedoy}</button><div className="vai-divider"><span>eller / or</span></div></>}<form onSubmit={login}><label>{t.email}<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="navn@bedrift.no" /></label><button className="vai-secondary vai-wide">{t.magic}</button></form></>}<button className="vai-lang" onClick={() => setLocale(locale === "nb" ? "en" : "nb")}>{locale === "nb" ? "English" : "Norsk"}</button>{notice && <p className="vai-notice">{notice}</p>}</section></main>;

  if (activeAgent) return <main className="vai-chat"><header><button disabled={sending} onClick={() => { setActiveAgent(null); setConversation(null); }}>← {t.back}</button><div className={`vai-agent-icon is-${activeAgent.color}`}>{icons[activeAgent.category]}</div><div><strong>{activeAgent.name}</strong><small>{activeAgent.description}</small></div></header><div className="vai-messages">{(conversation?.messages || []).length === 0 && <div className="vai-chat-empty"><div className={`vai-agent-icon is-${activeAgent.color}`}>{icons[activeAgent.category]}</div><h1>{activeAgent.name}</h1><p>{activeAgent.description}</p></div>}{conversation?.messages.map((item, index) => <article key={index} className={item.role === "user" ? "is-user" : "is-assistant"}>{item.content}</article>)}{sending && <article className="is-assistant vai-typing">•••</article>}</div><form className="vai-composer" onSubmit={send}><textarea maxLength={6000} aria-label={t.ask} rows={1} value={message} onChange={e => setMessage(e.target.value)} placeholder={t.ask} /><button disabled={sending || !message.trim()} aria-label={t.send}>↑</button></form>{notice && <p className="vai-chat-error" role="alert">{notice}</p>}</main>;

  return <main className={`vai-shell ${settings.compact ? "is-compact" : ""}`}>
    <aside><div className="vai-brand"><Image src="/imgs/Logos/Vedoy_Logo_W.png" width={120} height={42} alt="Vedøy" /><span>AI</span></div><nav><button className={view === "library" ? "is-active" : ""} onClick={() => setView("library")}><i>✦</i>{t.library}</button><button className={view === "chats" ? "is-active" : ""} onClick={() => setView("chats")}><i>◷</i>{t.chats}</button><button className={view === "settings" ? "is-active" : ""} onClick={() => setView("settings")}><i>⚙</i>{t.settings}</button></nav><div className="vai-user"><span>{user.email?.slice(0, 1).toUpperCase()}</span><small>{user.email}</small><button onClick={() => client?.auth.signOut()} title={t.signOut}>↗</button></div></aside>
    <section className="vai-main"><header className="vai-mobile-head"><div className="vai-brand"><Image src="/imgs/Logos/Vedoy_Logo_B.png" width={105} height={38} alt="Vedøy" /><span>AI</span></div><select value={view} onChange={e => setView(e.target.value as typeof view)}><option value="library">{t.library}</option><option value="chats">{t.chats}</option><option value="settings">{t.settings}</option></select></header>
      {view === "library" && <><div className="vai-heading"><div><p>{settings.workspace_name}</p><h1>{t.title}</h1><span>{t.subtitle}</span></div><button className="vai-primary" onClick={() => setEditor(defaults)}>＋ {t.add}</button></div><div className="vai-tools"><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={`⌕  ${t.search}`} /><div>{(["all", "mine", "hidden"] as const).map(item => <button key={item} className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>{t[item]}</button>)}</div></div><div className="vai-grid">{visibleAgents.map(agent => <article className={`vai-card is-${agent.color}`} key={agent.id}><div className="vai-card-top"><div className="vai-agent-icon">{icons[agent.category]}</div><button className={agent.favorite ? "is-favorite" : ""} onClick={() => preference(agent, { favorite: !agent.favorite })} aria-label={t.favorite}>★</button></div><small>{agent.is_system ? t.system : t.own}</small><h2>{agent.name}</h2><p>{agent.description}</p><div className="vai-card-actions"><button className="vai-start" onClick={() => { setActiveAgent(agent); setConversation(null); }}>{t.start} →</button>{!agent.is_system && <button onClick={() => setEditor({ ...agent })}>{t.edit}</button>}<button onClick={() => preference(agent, { hidden: !agent.hidden })}>{agent.hidden ? t.show : t.hide}</button>{!agent.is_system && <button className="is-danger" onClick={() => remove(agent)}>{t.remove}</button>}</div></article>)}{visibleAgents.length === 0 && <p className="vai-empty">{t.empty}</p>}</div></>}
      {view === "chats" && <><div className="vai-heading"><div><p>{settings.workspace_name}</p><h1>{t.chats}</h1></div></div><div className="vai-list">{conversations.map(chat => <article key={chat.id}><button onClick={() => openConversation(chat)}><span>◷</span><div><strong>{chat.title}</strong><small>{new Intl.DateTimeFormat(locale === "nb" ? "nb-NO" : "en-GB", { dateStyle: "medium" }).format(new Date(chat.updated_at))}</small></div><i>→</i></button><button className="vai-list-delete" aria-label={t.remove} onClick={() => removeConversation(chat.id)}>×</button></article>)}{conversations.length === 0 && <p className="vai-empty">{t.historyEmpty}</p>}</div></>}
      {view === "settings" && <><div className="vai-heading"><div><p>Vedøy AI</p><h1>{t.settings}</h1></div></div><form className="vai-settings" onSubmit={saveSettings}><label>{t.language}<select value={settings.locale} onChange={e => setSettings({ ...settings, locale: e.target.value as Locale })}><option value="nb">Norsk</option><option value="en">English</option></select></label><label>{t.workspace}<input value={settings.workspace_name} maxLength={80} onChange={e => setSettings({ ...settings, workspace_name: e.target.value })} /></label><label className="vai-check"><input type="checkbox" checked={settings.compact} onChange={e => setSettings({ ...settings, compact: e.target.checked })} />{t.compact}</label><button className="vai-primary">{t.save}</button></form></>}
      {view === "settings" && <AccountTools locale={locale} />}
    </section>
    {editor && <div className="vai-modal" role="dialog" aria-modal="true"><form onSubmit={saveAgent}><div className="vai-modal-head"><h2>{editor.id ? t.edit : t.add}</h2><button type="button" onClick={() => setEditor(null)}>×</button></div><label>{t.name}<input required maxLength={100} value={editor.name} onChange={e => setEditor({ ...editor, name: e.target.value })} /></label><label>{t.description}<textarea maxLength={300} rows={2} value={editor.description} onChange={e => setEditor({ ...editor, description: e.target.value })} /></label><label>{t.prompt}<textarea required maxLength={12000} rows={7} value={editor.system_prompt} onChange={e => setEditor({ ...editor, system_prompt: e.target.value })} /></label><div className="vai-form-row"><label>{t.category}<select value={editor.category} onChange={e => setEditor({ ...editor, category: e.target.value })}>{categories.map(item => <option value={item} key={item}>{item}</option>)}</select></label><label>Farge / Color<select value={editor.color} onChange={e => setEditor({ ...editor, color: e.target.value })}>{colors.map(item => <option value={item} key={item}>{item}</option>)}</select></label></div><div className="vai-modal-actions"><button type="button" className="vai-secondary" onClick={() => setEditor(null)}>{t.cancel}</button><button className="vai-primary">{t.save}</button></div></form></div>}
    {notice && <button className="vai-toast" onClick={() => setNotice("")}>{notice} ×</button>}
  </main>;
}

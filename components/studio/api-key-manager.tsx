"use client";

import { FormEvent, useState } from "react";
import type { StudioApiKey } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function ApiKeyManager({ initialKeys }: { initialKeys: StudioApiKey[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const scopes = form.getAll("scopes").map(String);
    const response = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), scopes })
    });
    const data = await response.json() as { key?: StudioApiKey; secret?: string; error?: string };
    if (!response.ok || !data.key || !data.secret) {
      setError(data.error || "Kunne ikke lage nøkkelen.");
      return;
    }
    setKeys((items) => [data.key!, ...items]);
    setSecret(data.secret);
  }

  return (
    <>
      <div className="action-row"><button className="button button--dark" type="button" onClick={() => { setOpen(true); setSecret(""); }}>+ Ny API-nøkkel</button><a className="button button--ghost" href="/docs#api">Les API-dokumentasjon</a></div>
      <div className="api-key-list">
        {keys.map((key) => (
          <article key={key.id}>
            <div className="api-key-icon">{`{}`}</div>
            <div><strong>{key.name}</strong><code>{key.prefix}••••••••••</code></div>
            <div><small>Tilganger</small><span>{key.scopes.join(", ")}</span></div>
            <div><small>Sist brukt</small><span>{key.lastUsedAt ? formatDateTime(key.lastUsedAt) : "Aldri"}</span></div>
            <button className="icon-button" type="button">•••</button>
          </article>
        ))}
      </div>
      <section className="code-panel" id="api">
        <div className="code-panel__top"><span>JavaScript</span><button type="button">Kopier</button></div>
        <pre><code>{`const response = await fetch("https://api.vedoy.com/v1/bookings", {
  headers: { Authorization: "Bearer vdy_live_..." }
});

const { bookings } = await response.json();`}</code></pre>
      </section>
      {open && (
        <div className="modal" role="dialog" aria-modal="true">
          <button className="modal__backdrop" onClick={() => setOpen(false)} aria-label="Lukk" />
          <form className="modal__card" onSubmit={create}>
            <div className="modal__header"><div><small>UTVIKLER</small><h2>Ny API-nøkkel</h2></div><button type="button" onClick={() => setOpen(false)}>×</button></div>
            {secret ? <>
              <div className="secret-box"><small>Kopier nå — nøkkelen vises bare én gang</small><code>{secret}</code></div>
              <button className="button button--dark button--wide" type="button" onClick={() => { void navigator.clipboard.writeText(secret); }}>Kopier nøkkel</button>
            </> : <>
              <label><span>Navn</span><input name="name" placeholder="Produksjon" required minLength={2} /></label>
              <fieldset className="scope-list"><legend>Tilganger</legend>
                {["booking:read", "booking:write", "analytics:read", "projects:read"].map((scope) => <label key={scope}><input type="checkbox" name="scopes" value={scope} defaultChecked={scope === "booking:read"} /><span>{scope}</span></label>)}
              </fieldset>
              {error && <p className="form-error">{error}</p>}
              <div className="modal__actions"><button className="button button--ghost" type="button" onClick={() => setOpen(false)}>Avbryt</button><button className="button button--dark">Lag nøkkel</button></div>
            </>}
          </form>
        </div>
      )}
    </>
  );
}

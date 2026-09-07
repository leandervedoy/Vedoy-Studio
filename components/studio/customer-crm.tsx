"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { StudioCustomer } from "@/lib/types";
import { formatDateTime, formatNok } from "@/lib/utils";

type CustomerDraft = {
  name: string;
  email: string;
  phone: string;
  company: string;
  valueNok: string;
  tags: string;
};

const emptyDraft: CustomerDraft = { name: "", email: "", phone: "", company: "", valueNok: "0", tags: "" };

function customerDraft(customer: StudioCustomer): CustomerDraft {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone ?? "",
    company: customer.company ?? "",
    valueNok: String(customer.valueNok),
    tags: customer.tags.join(", ")
  };
}

export function CustomerCrm({ customers: initialCustomers, referenceTime }: { customers: StudioCustomer[]; referenceTime: string }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<StudioCustomer | "new" | null>(null);
  const [draft, setDraft] = useState<CustomerDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!editing) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditing(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [editing]);

  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("nb-NO");
    if (!normalized) return customers;
    return customers.filter((customer) => [customer.name, customer.email, customer.phone, customer.company, ...customer.tags]
      .filter(Boolean)
      .some((value) => value!.toLocaleLowerCase("nb-NO").includes(normalized)));
  }, [customers, query]);

  const metrics = useMemo(() => {
    const activeSince = new Date(referenceTime).getTime() - 30 * 24 * 60 * 60 * 1000;
    return {
      total: customers.length,
      active: customers.filter((customer) => new Date(customer.lastActivityAt).getTime() >= activeSince).length,
      value: customers.reduce((sum, customer) => sum + customer.valueNok, 0)
    };
  }, [customers, referenceTime]);

  function openNew() {
    setDraft(emptyDraft);
    setMessage("");
    setEditing("new");
  }

  function openEdit(customer: StudioCustomer) {
    setDraft(customerDraft(customer));
    setMessage("");
    setEditing(customer);
  }

  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || saving) return;
    setSaving(true);
    setMessage("");
    const isNew = editing === "new";
    try {
      const response = await fetch(isNew ? "/api/customers" : `/api/customers/${editing.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, valueNok: Number(draft.valueNok), tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean) })
      });
      const data = await response.json() as { customer?: StudioCustomer; error?: string };
      if (!response.ok || !data.customer) throw new Error(data.error || "Kunne ikke lagre kunden.");
      const savedCustomer = data.customer;
      setCustomers((current) => isNew ? [savedCustomer, ...current] : current.map((customer) => customer.id === savedCustomer.id ? savedCustomer : customer));
      setEditing(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kunne ikke lagre kunden.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="crm-metrics" aria-label="Kundeoversikt">
        <article><small>KUNDER</small><strong>{metrics.total}</strong><span>i registeret</span></article>
        <article><small>AKTIVE SISTE 30 DAGER</small><strong>{metrics.active}</strong><span>med ny aktivitet</span></article>
        <article><small>REGISTRERT VERDI</small><strong>{formatNok(metrics.value)}</strong><span>samlet kundeverdi</span></article>
      </section>
      <div className="crm-toolbar">
        <label className="studio-search">
          <span>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Søk etter kunde, bedrift, e-post eller merke" aria-label="Søk i kunderegisteret" />
          <kbd>{filteredCustomers.length}</kbd>
        </label>
        <button className="button button--dark" type="button" onClick={openNew}>+ Ny kunde</button>
      </div>
      <p className="crm-sync-note"><span>↻</span> Nye bookinger oppretter eller oppdaterer kunden automatisk.</p>
      <div className="customer-table">
        <div className="customer-table__head"><span>Kunde</span><span>Merker</span><span>Verdi</span><span>Siste aktivitet</span><span>Handlinger</span></div>
        {filteredCustomers.map((customer) => (
          <article key={customer.id}>
            <button type="button" className="customer-person customer-person--button" onClick={() => openEdit(customer)} aria-label={`Rediger ${customer.name}`}>
              <span>{customer.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
              <div><strong>{customer.name}</strong><small>{customer.company || customer.email}</small></div>
            </button>
            <div className="tag-list">{customer.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <strong>{formatNok(customer.valueNok)}</strong>
            <span>{formatDateTime(customer.lastActivityAt)}</span>
            <div className="customer-actions">
              <a href={`mailto:${customer.email}`} aria-label={`Send e-post til ${customer.name}`}>✉</a>
              {customer.phone ? <a href={`tel:${customer.phone}`} aria-label={`Ring ${customer.name}`}>☎</a> : null}
              <button type="button" onClick={() => openEdit(customer)} aria-label={`Rediger ${customer.name}`}>✎</button>
            </div>
          </article>
        ))}
        {filteredCustomers.length === 0 ? <div className="crm-empty"><strong>Ingen kunder funnet</strong><p>Prøv et annet søkeord eller legg til en ny kunde.</p></div> : null}
      </div>

      {editing ? (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="customer-dialog-title">
          <button className="modal__backdrop" type="button" onClick={() => setEditing(null)} aria-label="Lukk kundeskjema" />
          <form className="modal__card customer-form" onSubmit={saveCustomer}>
            <div className="modal__header"><div><small>VEDØY CRM</small><h2 id="customer-dialog-title">{editing === "new" ? "Ny kunde" : "Rediger kunde"}</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Lukk">×</button></div>
            <div className="customer-form__grid">
              <label><span>Navn *</span><input required minLength={2} maxLength={160} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} autoFocus /></label>
              <label><span>E-post *</span><input required type="email" maxLength={254} value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} /></label>
              <label><span>Bedrift</span><input maxLength={160} value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} /></label>
              <label><span>Telefon</span><input type="tel" maxLength={40} value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} /></label>
              <label><span>Kundeverdi (kr)</span><input type="number" min="0" max="100000000" step="1" value={draft.valueNok} onChange={(event) => setDraft((current) => ({ ...current, valueNok: event.target.value }))} /></label>
              <label><span>Merker</span><input maxLength={300} value={draft.tags} onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))} placeholder="Bedrift, Growth, Oppfølging" /></label>
            </div>
            {message ? <p className="form-error" role="alert">{message}</p> : null}
            <div className="modal__actions"><button className="button button--ghost" type="button" onClick={() => setEditing(null)}>Avbryt</button><button className="button button--dark" disabled={saving}>{saving ? "Lagrer …" : "Lagre kunde"}</button></div>
          </form>
        </div>
      ) : null}
    </>
  );
}

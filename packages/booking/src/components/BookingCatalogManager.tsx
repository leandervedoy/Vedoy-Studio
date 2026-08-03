"use client";

import { useMemo, useState, type FormEvent } from "react";
import { mergeConfiguration } from "../defaults.js";
import type { BookingConfiguration, BookingPlan, BookingService } from "../types.js";
import { themeVariables } from "../utils/theme.js";

export interface BookingCatalogManagerProps {
  services: BookingService[];
  plans: BookingPlan[];
  onServicesChange: (services: BookingService[]) => void;
  onPlansChange: (plans: BookingPlan[]) => void;
  configuration?: BookingConfiguration;
  className?: string;
}

const emptyService: BookingService = { id: "", name: "", description: "", category: "", durationMinutes: 60, price: 0, currency: "NOK", color: "#2563eb", active: true };
const emptyPlan: BookingPlan = { id: "", name: "", description: "", price: 0, currency: "NOK", billing: "monthly", color: "#7c3aed", active: true, popular: false };

function slug(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9æøå]+/gi, "-").replace(/(^-|-$)/g, "") || `item-${Date.now()}`;
}

export function BookingCatalogManager({ services, plans, onServicesChange, onPlansChange, configuration, className = "" }: BookingCatalogManagerProps) {
  const config = useMemo(() => mergeConfiguration(configuration), [configuration]);
  const [tab, setTab] = useState<"services" | "plans">("services");
  const [serviceDraft, setServiceDraft] = useState<BookingService>(emptyService);
  const [planDraft, setPlanDraft] = useState<BookingPlan>(emptyPlan);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  function saveService(event: FormEvent) {
    event.preventDefault();
    if (!serviceDraft.name.trim()) return;
    const item = { ...serviceDraft, id: editingServiceId ?? slug(serviceDraft.name), name: serviceDraft.name.trim() };
    onServicesChange(editingServiceId ? services.map((service) => service.id === editingServiceId ? item : service) : [...services, item]);
    setServiceDraft(emptyService);
    setEditingServiceId(null);
  }

  function savePlan(event: FormEvent) {
    event.preventDefault();
    if (!planDraft.name.trim()) return;
    const item = { ...planDraft, id: editingPlanId ?? slug(planDraft.name), name: planDraft.name.trim() };
    onPlansChange(editingPlanId ? plans.map((plan) => plan.id === editingPlanId ? item : plan) : [...plans, item]);
    setPlanDraft(emptyPlan);
    setEditingPlanId(null);
  }

  return (
    <section className={`vb-root vb-admin-suite ${config.animations ? "vb-animate" : ""} ${className}`} style={themeVariables(config.theme)}>
      <header className="vb-hero vb-hero--admin">
        <span className="vb-eyebrow">Katalog</span>
        <h2>Tjenester og planer</h2>
        <p>Endre navn, pris, varighet, kategori, farge og synlighet uten å endre bookingkomponenten.</p>
      </header>

      <div className="vb-segmented">
        <button type="button" className={tab === "services" ? "is-active" : ""} onClick={() => setTab("services")}>Tjenester ({services.length})</button>
        <button type="button" className={tab === "plans" ? "is-active" : ""} onClick={() => setTab("plans")}>Planer ({plans.length})</button>
      </div>

      {tab === "services" ? (
        <div className="vb-catalog-layout">
          <form className="vb-panel vb-catalog-form" onSubmit={saveService}>
            <h3>{editingServiceId ? "Rediger tjeneste" : "Ny tjeneste"}</h3>
            <label className="vb-field"><span>Navn *</span><input value={serviceDraft.name} onChange={(event) => setServiceDraft((current) => ({ ...current, name: event.target.value }))} /></label>
            <label className="vb-field"><span>Beskrivelse</span><textarea rows={3} value={serviceDraft.description ?? ""} onChange={(event) => setServiceDraft((current) => ({ ...current, description: event.target.value }))} /></label>
            <div className="vb-fields-grid">
              <label className="vb-field"><span>Kategori</span><input value={serviceDraft.category ?? ""} onChange={(event) => setServiceDraft((current) => ({ ...current, category: event.target.value }))} /></label>
              <label className="vb-field"><span>Farge</span><input type="color" value={serviceDraft.color ?? "#2563eb"} onChange={(event) => setServiceDraft((current) => ({ ...current, color: event.target.value }))} /></label>
              <label className="vb-field"><span>Varighet (min)</span><input type="number" min={5} step={5} value={serviceDraft.durationMinutes} onChange={(event) => setServiceDraft((current) => ({ ...current, durationMinutes: Number(event.target.value) }))} /></label>
              <label className="vb-field"><span>Pris</span><input type="number" min={0} value={serviceDraft.price ?? 0} onChange={(event) => setServiceDraft((current) => ({ ...current, price: Number(event.target.value) }))} /></label>
              <label className="vb-field"><span>Buffer før</span><input type="number" min={0} step={5} value={serviceDraft.bufferBeforeMinutes ?? 0} onChange={(event) => setServiceDraft((current) => ({ ...current, bufferBeforeMinutes: Number(event.target.value) }))} /></label>
              <label className="vb-field"><span>Buffer etter</span><input type="number" min={0} step={5} value={serviceDraft.bufferAfterMinutes ?? 0} onChange={(event) => setServiceDraft((current) => ({ ...current, bufferAfterMinutes: Number(event.target.value) }))} /></label>
            </div>
            <label className="vb-checkbox"><input type="checkbox" checked={serviceDraft.active !== false} onChange={(event) => setServiceDraft((current) => ({ ...current, active: event.target.checked }))} /> Aktiv og synlig</label>
            <div className="vb-action-row"><button className="vb-button vb-button--primary">{editingServiceId ? "Lagre endringer" : "Legg til tjeneste"}</button>{editingServiceId && <button type="button" className="vb-button vb-button--ghost" onClick={() => { setEditingServiceId(null); setServiceDraft(emptyService); }}>Avbryt</button>}</div>
          </form>

          <div className="vb-panel vb-catalog-list">
            {services.map((service) => (
              <article key={service.id} style={{ "--vb-item-color": service.color ?? config.theme.accent } as React.CSSProperties}>
                <span className="vb-catalog-color" />
                <div><strong>{service.name}</strong><small>{service.category || "Uten kategori"} · {service.durationMinutes} min · {service.price ?? 0} {service.currency ?? config.currency}</small><p>{service.description}</p></div>
                <div className="vb-row-actions"><button type="button" className="vb-button vb-button--ghost" onClick={() => { setEditingServiceId(service.id); setServiceDraft({ ...service }); }}>Rediger</button><button type="button" className="vb-link-danger" onClick={() => onServicesChange(services.filter((item) => item.id !== service.id))}>Slett</button></div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="vb-catalog-layout">
          <form className="vb-panel vb-catalog-form" onSubmit={savePlan}>
            <h3>{editingPlanId ? "Rediger plan" : "Ny plan"}</h3>
            <label className="vb-field"><span>Navn *</span><input value={planDraft.name} onChange={(event) => setPlanDraft((current) => ({ ...current, name: event.target.value }))} /></label>
            <label className="vb-field"><span>Beskrivelse</span><textarea rows={3} value={planDraft.description ?? ""} onChange={(event) => setPlanDraft((current) => ({ ...current, description: event.target.value }))} /></label>
            <div className="vb-fields-grid">
              <label className="vb-field"><span>Pris</span><input type="number" min={0} value={planDraft.price ?? 0} onChange={(event) => setPlanDraft((current) => ({ ...current, price: Number(event.target.value) }))} /></label>
              <label className="vb-field"><span>Betaling</span><select value={planDraft.billing ?? "monthly"} onChange={(event) => setPlanDraft((current) => ({ ...current, billing: event.target.value as BookingPlan["billing"] }))}><option value="one-time">Engang</option><option value="monthly">Månedlig</option><option value="yearly">Årlig</option></select></label>
              <label className="vb-field"><span>Inkluderte minutter</span><input type="number" min={0} value={planDraft.includedMinutes ?? 0} onChange={(event) => setPlanDraft((current) => ({ ...current, includedMinutes: Number(event.target.value) }))} /></label>
              <label className="vb-field"><span>Rabatt %</span><input type="number" min={0} max={100} value={planDraft.discountPercent ?? 0} onChange={(event) => setPlanDraft((current) => ({ ...current, discountPercent: Number(event.target.value) }))} /></label>
              <label className="vb-field"><span>Farge</span><input type="color" value={planDraft.color ?? "#7c3aed"} onChange={(event) => setPlanDraft((current) => ({ ...current, color: event.target.value }))} /></label>
            </div>
            <label className="vb-checkbox"><input type="checkbox" checked={planDraft.popular === true} onChange={(event) => setPlanDraft((current) => ({ ...current, popular: event.target.checked }))} /> Marker som populær</label>
            <label className="vb-checkbox"><input type="checkbox" checked={planDraft.active !== false} onChange={(event) => setPlanDraft((current) => ({ ...current, active: event.target.checked }))} /> Aktiv og synlig</label>
            <div className="vb-action-row"><button className="vb-button vb-button--primary">{editingPlanId ? "Lagre endringer" : "Legg til plan"}</button>{editingPlanId && <button type="button" className="vb-button vb-button--ghost" onClick={() => { setEditingPlanId(null); setPlanDraft(emptyPlan); }}>Avbryt</button>}</div>
          </form>

          <div className="vb-panel vb-catalog-list">
            {plans.map((plan) => (
              <article key={plan.id} style={{ "--vb-item-color": plan.color ?? config.theme.accent } as React.CSSProperties}>
                <span className="vb-catalog-color" />
                <div><strong>{plan.popular ? "★ " : ""}{plan.name}</strong><small>{plan.price ?? 0} {plan.currency ?? config.currency} · {plan.billing ?? "one-time"}</small><p>{plan.description}</p></div>
                <div className="vb-row-actions"><button type="button" className="vb-button vb-button--ghost" onClick={() => { setEditingPlanId(plan.id); setPlanDraft({ ...plan }); }}>Rediger</button><button type="button" className="vb-link-danger" onClick={() => onPlansChange(plans.filter((item) => item.id !== plan.id))}>Slett</button></div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

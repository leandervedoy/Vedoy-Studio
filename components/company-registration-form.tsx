"use client";

import { useMemo, useState } from "react";
import type { GrowthSubscriptionPlan, TeamRole } from "@/lib/types";

type Invite = { name: string; email: string; role: Exclude<TeamRole, "owner"> };
const plans: { id: GrowthSubscriptionPlan; title: string; detail: string; seats: number }[] = [
  { id: "trial", title: "Prøv Growth", detail: "7 dager · for eier alene", seats: 1 },
  { id: "start", title: "Growth Start", detail: "Én bruker", seats: 1 },
  { id: "team", title: "Growth Team", detail: "For små team", seats: 10 },
  { id: "plus", title: "Growth Plus", detail: "For voksende virksomheter", seats: 25 }
];
const roleLabels: Record<Exclude<TeamRole, "owner">, string> = { admin: "Administrator", manager: "Leder", editor: "Redaktør", member: "Medlem" };

export function CompanyRegistrationForm({ initialPlan = "team" }: { initialPlan?: GrowthSubscriptionPlan }) {
  const [plan, setPlan] = useState<GrowthSubscriptionPlan>(initialPlan);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [form, setForm] = useState({ companyName: "", organizationNumber: "", ownerName: "", ownerEmail: "", ownerTitle: "owner", phone: "", website: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const selectedPlan = useMemo(() => plans.find((item) => item.id === plan) ?? plans[2], [plan]);
  const remainingSeats = selectedPlan.seats - 1 - invites.length;

  function updateInvite(index: number, patch: Partial<Invite>) { setInvites((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)); }
  function addInvite() { if (remainingSeats > 0) setInvites((items) => [...items, { name: "", email: "", role: "member" }]); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/company-registrations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, subscriptionPlan: plan, invitedMembers: invites }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registreringen kunne ikke lagres.");
      setMessage(`Registrert som ${data.registration.id}. Vedøy går gjennom oppsettet før et eget, isolert Studio-arbeidsområde blir aktivert.`);
      setInvites([]); setForm((current) => ({ ...current, website: "" }));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Noe gikk galt. Prøv igjen."); }
    finally { setSaving(false); }
  }

  return <form className="company-setup-form" onSubmit={submit}>
    <div className="company-setup-form__section"><small>01 · VIRKSOMHET</small><div className="company-setup-fields"><label>Bedriftsnavn<input required value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} placeholder="Eksempel AS" /></label><label>Organisasjonsnummer <span>valgfritt</span><input value={form.organizationNumber} onChange={(event) => setForm({ ...form, organizationNumber: event.target.value })} inputMode="numeric" placeholder="999 999 999" /></label></div></div>
    <div className="company-setup-form__section"><small>02 · ANSVARLIG KONTAKT</small><div className="company-setup-fields"><label>Navn<input required value={form.ownerName} onChange={(event) => setForm({ ...form, ownerName: event.target.value })} placeholder="Fullt navn" /></label><label>Rolle<select value={form.ownerTitle} onChange={(event) => setForm({ ...form, ownerTitle: event.target.value })}><option value="owner">Eier</option><option value="managing-director">Daglig leder</option></select></label><label>E-post<input required type="email" value={form.ownerEmail} onChange={(event) => setForm({ ...form, ownerEmail: event.target.value })} placeholder="navn@bedrift.no" /></label><label>Telefon <span>valgfritt</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="47 00 00 00" /></label></div></div>
    <div className="company-setup-form__section"><small>03 · ABONNEMENT OG SETER</small><div className="company-plan-grid">{plans.map((item) => <label className={plan === item.id ? "is-selected" : ""} key={item.id}><input type="radio" name="plan" value={item.id} checked={plan === item.id} onChange={() => { setPlan(item.id); setInvites((items) => items.slice(0, Math.max(0, item.seats - 1))); }} /><strong>{item.title}</strong><span>{item.detail}</span><b>{item.seats} {item.seats === 1 ? "bruker" : "brukere"}</b></label>)}</div><p className="company-seat-note">Eier/daglig leder bruker én plass. {selectedPlan.title} har <strong>{selectedPlan.seats} {selectedPlan.seats === 1 ? "bruker" : "brukere"}</strong> totalt.</p></div>
    <div className="company-setup-form__section"><div className="company-setup-section-heading"><div><small>04 · TEAM OG ROLLER</small><p>Legg inn ansatte du ønsker å invitere. Rollen kan justeres av administrator etter aktivering.</p></div><button type="button" onClick={addInvite} disabled={remainingSeats <= 0}>+ Legg til ansatt</button></div>{invites.length ? <div className="company-invite-list">{invites.map((invite, index) => <div key={index}><input required value={invite.name} onChange={(event) => updateInvite(index, { name: event.target.value })} placeholder="Navn" /><input required type="email" value={invite.email} onChange={(event) => updateInvite(index, { email: event.target.value })} placeholder="navn@bedrift.no" /><select value={invite.role} onChange={(event) => updateInvite(index, { role: event.target.value as Invite["role"] })}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" aria-label="Fjern ansatt" onClick={() => setInvites((items) => items.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}</div> : <div className="company-invite-empty">Ingen ansatte lagt til ennå. Det er helt fint — du kan invitere flere etter at oppsettet er aktivert.</div>}<p className={remainingSeats < 0 ? "company-seat-note is-over" : "company-seat-note"}>{Math.max(remainingSeats, 0)} ledig{remainingSeats === 1 ? " plass" : "e plasser"} i dette abonnementet.</p></div>
    <input className="company-honeypot" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} aria-hidden="true" />
    <div className="company-setup-form__footer"><p>Dette oppretter en sikker oppstartsforespørsel — ikke en felles Studio-konto. Vedøy bekrefter virksomheten og aktiverer et eget arbeidsområde før invitasjoner sendes.</p><button className="editorial-button" disabled={saving}>{saving ? "Lagrer …" : "Registrer bedrift"} <span>↗</span></button></div>{message ? <p className="company-form-message" role="status">{message}</p> : null}
  </form>;
}

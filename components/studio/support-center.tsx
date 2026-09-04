"use client";

import { FormEvent, useState } from "react";
import type { StudioTicket } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function SupportCenter({ initialTickets }: { initialTickets: StudioTicket[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(false);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: form.get("subject"), message: form.get("message"), priority: form.get("priority") })
    });
    const data = await response.json() as { ticket?: StudioTicket; error?: string };
    if (!response.ok || !data.ticket) {
      setError(data.error || "Kunne ikke sende henvendelsen.");
      return;
    }
    setTickets((items) => [data.ticket!, ...items]);
    setSent(true);
    event.currentTarget.reset();
  }

  return (
    <div className="support-layout">
      <section className="support-form-card">
        <div className="support-person"><span>EL</span><div><small>PERSONLIG SUPPORT</small><h2>Hei — hva står du fast på?</h2><p>Beskriv problemet med vanlige ord. Du trenger ikke vite hva det tekniske heter.</p></div></div>
        <form onSubmit={submit}>
          <label><span>Emne</span><input name="subject" placeholder="For eksempel: domenet peker feil" required minLength={3} /></label>
          <label><span>Hva skjer?</span><textarea name="message" rows={7} placeholder="Hva prøvde du å gjøre, og hva skjedde i stedet?" required minLength={10} /></label>
          <label><span>Prioritet</span><select name="priority" defaultValue="normal"><option value="low">Kan vente</option><option value="normal">Normal</option><option value="high">Haster</option></select></label>
          {error && <p className="form-error">{error}</p>}
          {sent && <p className="form-success">Henvendelsen er sendt. Du finner den i listen til høyre.</p>}
          <button className="button button--dark">Send til Vedøy Assist</button>
        </form>
      </section>
      <section className="ticket-card">
        <div className="panel-heading"><div><small>DINE HENVENDELSER</small><h2>Åpne saker</h2></div><span>{tickets.filter((ticket) => ticket.status !== "resolved").length} aktive</span></div>
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <article key={ticket.id}>
              <div><strong>{ticket.subject}</strong><p>{ticket.message}</p></div>
              <div className="ticket-meta"><span className={`status-chip status-chip--${ticket.status}`}><i />{ticket.status === "open" ? "Åpen" : ticket.status === "in-progress" ? "Pågår" : "Løst"}</span><small>{formatDateTime(ticket.createdAt)}</small></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { ContactRequest } from "@/lib/types";

export function RequestStatusControl({ id, initialStatus }: { id: string; initialStatus: ContactRequest["status"] }) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function change(nextStatus: ContactRequest["status"]) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/requests/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      if (!response.ok) throw new Error("Kunne ikke oppdatere status.");
      setStatus(nextStatus);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Kunne ikke oppdatere status.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="request-status-control">
    <label htmlFor={`status-${id}`} className="sr-only">Status</label>
    <select id={`status-${id}`} value={status} disabled={saving} onChange={(event) => change(event.target.value as ContactRequest["status"])}>
      <option value="pending">Venter godkjenning</option>
      <option value="contacted">Kontaktet</option>
      <option value="approved">Godkjent</option>
      <option value="rejected">Avvist</option>
      <option value="closed">Lukket</option>
    </select>
    {error ? <small role="alert">{error}</small> : null}
  </div>;
}

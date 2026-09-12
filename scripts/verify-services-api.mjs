import { createHmac } from "node:crypto";

const base = process.env.VERIFY_BASE_URL || "http://127.0.0.1:3013";
const secret = process.env.SESSION_SECRET || "vedoy-local-development-session-secret-please-change";
const encode = (value) => Buffer.from(value).toString("base64url");
const encoded = encode(JSON.stringify({ email: "qa@vedoy.no", name: "QA", organizationId: "org_vedoy", role: "owner", expiresAt: Math.floor(Date.now() / 1000) + 300 }));
const token = `${encoded}.${createHmac("sha256", secret).update(encoded).digest("base64url")}`;
const headers = { "Content-Type": "application/json", Origin: base, Cookie: `vedoy_studio_session=${token}` };
const suffix = Date.now();
const service = { number: "99", slug: `qa-service-${suffix}`, title: "QA tjeneste", cardText: "Midlertidig tjeneste for automatisk test.", eyebrow: "QA · TEST", lead: "Verifiserer oppretting, redigering og sletting.", introduction: "Denne raden slettes automatisk når testen er ferdig.", deliverables: ["Oppretting"], focus: ["API"], process: ["Opprett", "Rediger", "Slett"], nextStep: "Ingen.", renderType: "general", published: false, sortOrder: 9999 };
let id;

try {
  const createdResponse = await fetch(`${base}/api/services`, { method: "POST", headers, body: JSON.stringify(service) });
  const created = await createdResponse.json();
  if (!createdResponse.ok || !created.service?.id) throw new Error(created.error || `POST feilet med ${createdResponse.status}`);
  id = created.service.id;
  const updatedResponse = await fetch(`${base}/api/services/${id}`, { method: "PATCH", headers, body: JSON.stringify({ ...service, title: "QA tjeneste oppdatert" }) });
  const updated = await updatedResponse.json();
  if (!updatedResponse.ok || updated.service?.title !== "QA tjeneste oppdatert") throw new Error(updated.error || `PATCH feilet med ${updatedResponse.status}`);
  const deletedResponse = await fetch(`${base}/api/services/${id}`, { method: "DELETE", headers });
  if (!deletedResponse.ok) throw new Error(`DELETE feilet med ${deletedResponse.status}`);
  id = undefined;
  console.log("✓ Admin-API: opprett, rediger og slett fungerer.");
} finally {
  if (id) await fetch(`${base}/api/services/${id}`, { method: "DELETE", headers }).catch(() => undefined);
}

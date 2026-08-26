import process from "node:process";

const baseUrl = (process.env.TEST_BASE_URL || "http://localhost:3010").replace(/\/$/, "");
const email = process.env.ADMIN_EMAIL || "demo@vedoy.no";
const password = process.env.ADMIN_PASSWORD || "vedoydemo";
let cookie = "";
let noteId = "";

async function json(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { ...(options.headers || {}), ...(cookie ? { Cookie: cookie } : {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${options.method || "GET"} ${path} ga ${response.status}: ${data.error || "ukjent feil"}`);
  return { response, data };
}

try {
  const login = await json("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  cookie = login.response.headers.get("set-cookie")?.split(";", 1)[0] || "";
  if (!cookie) throw new Error("Innlogging ga ingen sesjonscookie.");

  const created = await json("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "Codex Notes kontroll", content: "- [ ] Test", color: "mint", pinned: false, notebook: "Kontroll", section: "API", tags: ["verifisering"] }) });
  noteId = created.data.note?.id;
  if (!noteId) throw new Error("Notatet mangler id.");

  await json(`/api/notes/${noteId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: "- [x] Test\nAlt fungerer." }) });
  const history = await json(`/api/notes/${noteId}/history`);
  if (!history.data.versions?.length) throw new Error("Versjonshistorikken er tom.");

  const form = new FormData(); form.set("file", new Blob(["Vedøy Notes vedleggstest"], { type: "text/plain" }), "kontroll.txt");
  const uploaded = await json(`/api/notes/${noteId}/attachments`, { method: "POST", body: form });
  const attachmentId = uploaded.data.attachment?.id;
  if (!attachmentId) throw new Error("Vedlegget mangler id.");
  const download = await fetch(`${baseUrl}/api/notes/${noteId}/attachments/${attachmentId}`, { headers: { Cookie: cookie } });
  if (!download.ok || (await download.text()) !== "Vedøy Notes vedleggstest") throw new Error("Vedlegget kunne ikke leses tilbake.");

  const shared = await json(`/api/notes/${noteId}/share`, { method: "POST" });
  const token = shared.data.share?.token;
  if (!token) throw new Error("Delingslenken mangler token.");
  const publicPage = await fetch(`${baseUrl}/shared/notes/${token}`);
  if (!publicPage.ok || !(await publicPage.text()).includes("Codex Notes kontroll")) throw new Error("Den delte lesesiden virker ikke.");
  await json(`/api/notes/${noteId}/share`, { method: "DELETE" });
  const revoked = await fetch(`${baseUrl}/shared/notes/${token}`);
  if (revoked.status !== 404) throw new Error(`Deaktivert lenke ga ${revoked.status}, forventet 404.`);

  console.log("✓ Notes E2E: innlogging, lagring, historikk, vedlegg, deling og tilbakekalling fungerer.");
} finally {
  if (noteId && cookie) await fetch(`${baseUrl}/api/notes/${noteId}`, { method: "DELETE", headers: { Cookie: cookie } }).catch(() => undefined);
}

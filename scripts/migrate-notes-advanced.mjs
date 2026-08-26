import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL mangler.");
const sql = postgres(url, { max: 1, prepare: false, ssl: url.includes("localhost") ? false : "require" });
try {
  const migration = await fs.readFile(path.join(process.cwd(), "data", "migrations", "20260826_notes_advanced.sql"), "utf8");
  await sql.unsafe(migration);
  const rows = await sql`select to_regclass('public.studio_note_versions') as versions, to_regclass('public.studio_note_attachments') as attachments, to_regclass('public.studio_note_shares') as shares`;
  if (!rows[0]?.versions || !rows[0]?.attachments || !rows[0]?.shares) throw new Error("De avanserte notattabellene ble ikke opprettet.");
  console.log("✓ Historikk, vedlegg og deling er klare i Vedøy Notes.");
} finally {
  await sql.end();
}

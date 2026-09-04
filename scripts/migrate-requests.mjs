import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL mangler.");
const sql = postgres(url, { max: 1, prepare: false, ssl: url.includes("localhost") ? false : "require" });
try {
  const migration = await fs.readFile(path.join(process.cwd(), "data", "migrations", "20260823_requests.sql"), "utf8");
  await sql.unsafe(migration);
  const rows = await sql`select to_regclass('public.contact_requests') as contacts, to_regclass('public.clothing_requests') as clothing`;
  if (!rows[0]?.contacts || !rows[0]?.clothing) throw new Error("Tabellene ble ikke opprettet.");
  console.log("✓ Kontakthenvendelser og bedriftsklær er klare i databasen.");
} finally {
  await sql.end();
}

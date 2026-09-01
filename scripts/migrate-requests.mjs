import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL mangler.");
const sql = postgres(url, { max: 1, prepare: false, ssl: url.includes("localhost") ? false : "require" });
try {
  const migrations = await Promise.all([
    fs.readFile(path.join(process.cwd(), "data", "migrations", "20260823_requests.sql"), "utf8"),
    fs.readFile(path.join(process.cwd(), "data", "migrations", "20260901_hosting_requests.sql"), "utf8")
  ]);
  for (const migration of migrations) await sql.unsafe(migration);
  const rows = await sql`select to_regclass('public.contact_requests') as contacts, to_regclass('public.clothing_requests') as clothing, to_regclass('public.hosting_requests') as hosting`;
  if (!rows[0]?.contacts || !rows[0]?.clothing || !rows[0]?.hosting) throw new Error("Bestillingstabellene ble ikke opprettet.");
  console.log("✓ Kontakt-, bedriftsklær- og hostingforespørsler er klare i databasen.");
} finally {
  await sql.end();
}

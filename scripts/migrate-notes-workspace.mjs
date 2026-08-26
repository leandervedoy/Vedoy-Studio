import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL mangler.");
const sql = postgres(url, { max: 1, prepare: false, ssl: url.includes("localhost") ? false : "require" });
try {
  const migration = await fs.readFile(path.join(process.cwd(), "data", "migrations", "20260826_notes_workspace.sql"), "utf8");
  await sql.unsafe(migration);
  const rows = await sql`select column_name from information_schema.columns where table_name = 'studio_notes' and column_name in ('notebook', 'section', 'tags')`;
  if (rows.length !== 3) throw new Error("Notatfeltene ble ikke opprettet.");
  console.log("✓ Vedøy Notes arbeidsområde er klart i databasen.");
} finally {
  await sql.end();
}

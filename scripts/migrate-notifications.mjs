import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL mangler.");
const sql = postgres(url, { max: 1, prepare: false, ssl: url.includes("localhost") ? false : "require" });
try {
  await sql.unsafe(await fs.readFile(path.join(process.cwd(), "data", "migrations", "20260826_growth_notifications.sql"), "utf8"));
  const rows = await sql`select to_regclass('public.growth_notifications') as notifications, to_regclass('public.growth_preferences') as preferences`;
  if (!rows[0]?.notifications || !rows[0]?.preferences) throw new Error("Varseltabellene ble ikke opprettet.");
  console.log("✓ Vedøy Growth-varsler og preferanser er klare i databasen.");
} finally { await sql.end(); }

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL mangler.");

const sql = postgres(url, { max: 1, prepare: false, ssl: url.includes("localhost") ? false : "require" });
try {
  const migration = await fs.readFile(path.join(process.cwd(), "data", "migrations", "20260912_company_onboarding.sql"), "utf8");
  await sql.unsafe(migration);
  const rows = await sql`select to_regclass('public.company_registrations') as companies, to_regclass('public.domain_email_orders') as domains`;
  if (!rows[0]?.companies || !rows[0]?.domains) throw new Error("Bedriftsoppsett-tabellene ble ikke opprettet.");
  const security = await sql`select relname, relrowsecurity from pg_class where relname in ('company_registrations', 'domain_email_orders')`;
  if (security.length !== 2 || security.some((table) => !table.relrowsecurity)) throw new Error("RLS ble ikke aktivert på oppsettsdataene.");
  console.log("✓ Bedriftsregistrering og domene-/e-postbestillinger er klare i databasen.");
} finally {
  await sql.end();
}

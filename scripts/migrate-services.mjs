import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";
import { seedServices } from "./seed-services.mjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL mangler.");
const sql = postgres(url, { max: 1, prepare: false, ssl: url.includes("localhost") ? false : "require" });

try {
  const schema = await fs.readFile(path.join(process.cwd(), "data", "schema.sql"), "utf8");
  await sql.unsafe(schema);
  await seedServices(sql);
  const [{ count }] = await sql`select count(*)::int as count from studio_services where organization_id = 'org_vedoy'`;
  console.log(`✓ Tjenestekatalogen er klar med ${count} tjenester.`);
} finally {
  await sql.end();
}

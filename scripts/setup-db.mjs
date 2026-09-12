import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";
import { seedServices } from "./seed-services.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL mangler. Kopier .env.example til .env.local og legg inn PostgreSQL-adressen.");
  process.exit(1);
}

const sql = postgres(url, {
  max: 1,
  prepare: false,
  ssl: url.includes("localhost") ? false : "require"
});

try {
  const schema = await fs.readFile(path.join(process.cwd(), "data", "schema.sql"), "utf8");
  const seed = await fs.readFile(path.join(process.cwd(), "data", "seed.sql"), "utf8");
  await sql.unsafe(schema);
  await sql.unsafe(seed);
  await seedServices(sql);
  console.log("✓ Vedøy Studio-databasen er satt opp og fylt med demodata.");
} catch (error) {
  console.error("Databaseoppsett feilet:", error);
  process.exitCode = 1;
} finally {
  await sql.end();
}

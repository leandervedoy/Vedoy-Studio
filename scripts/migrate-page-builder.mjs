import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL mangler.");

const sql = postgres(url, { max: 1, prepare: false, ssl: url.includes("localhost") ? false : "require" });

try {
  const schema = await fs.readFile(path.join(process.cwd(), "data", "schema.sql"), "utf8");
  await sql.unsafe(schema);
  const [{ pages, blocks }] = await sql`
    select
      (select count(*)::int from studio_pages where organization_id = 'org_vedoy') as pages,
      (select count(*)::int from studio_page_blocks where organization_id = 'org_vedoy') as blocks
  `;
  console.log(`✓ Sidebygger-databasen er klar (${pages} sider, ${blocks} blokker).`);
} finally {
  await sql.end();
}

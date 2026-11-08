import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is missing. Never apply to production without approval.");
const sql = postgres(url, {max:1,prepare:false,ssl:url.includes("localhost")?false:"require"});
try {
  const schema = await fs.readFile(path.join(process.cwd(),"data","vedoy-pay-schema.sql"),"utf8");
  await sql.unsafe(schema);
  const rows = await sql`select table_name from information_schema.tables
    where table_schema = 'public' and table_name like 'vedoy_pay_%' order by table_name`;
  console.log("Vedoy Pay schema verified:",rows.map(x=>x.table_name).join(", "));
} finally { await sql.end(); }

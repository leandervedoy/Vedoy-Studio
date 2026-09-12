import process from "node:process";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL mangler.");
const sql = postgres(url, { max: 1, prepare: false, ssl: url.includes("localhost") ? false : "require" });

try {
  const [catalog] = await sql`select count(*)::int as count, bool_and(published) as "allPublished" from studio_services where organization_id = 'org_vedoy'`;
  const [security] = await sql`select relrowsecurity as rls from pg_class where oid = 'studio_services'::regclass`;
  const [grants] = await sql`select count(*)::int as count from information_schema.role_table_grants where table_name = 'studio_services' and grantee in ('anon', 'authenticated')`;
  if (catalog.count < 1 || !security.rls || grants.count !== 0) throw new Error("Tjenestekatalogens sikkerhetssjekk feilet.");
  console.log(`✓ ${catalog.count} tjenester, RLS aktiv, ingen direkte klientrettigheter.`);
} finally {
  await sql.end();
}

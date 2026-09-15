import postgres from "postgres";
const url = process.env.DATABASE_URL;
if (!url) { console.log("DATABASE_URL mangler; team-tabellen opprettes ved db:setup."); process.exit(0); }
const sql = postgres(url, { ssl: url.includes("localhost") ? false : "require", prepare: false });
await sql`create table if not exists growth_team_members (id text primary key, organization_id text not null references organizations(id) on delete cascade, email text not null, name text not null, avatar_url text, role text not null default 'member' check (role in ('owner','admin','manager','editor','member')), team_name text not null default 'Vedøy Studio', sort_order integer not null default 100, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, email))`;
await sql`alter table growth_team_members add column if not exists team_name text not null default 'Vedøy Studio'`;
await sql`create index if not exists growth_team_members_org_role_idx on growth_team_members (organization_id, sort_order, role)`;
const ownerEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
if (ownerEmail) await sql`insert into growth_team_members (id, organization_id, email, name, role, sort_order) values ('team_owner_vedoy', 'org_vedoy', ${ownerEmail}, 'Vedøy Administrator', 'owner', 0) on conflict (organization_id, email) do update set role = 'owner', sort_order = 0, updated_at = now()`;
console.log("Vedøy Team-tabellen er klar."); await sql.end();

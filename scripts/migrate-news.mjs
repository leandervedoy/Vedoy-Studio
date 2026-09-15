import postgres from "postgres";
const url = process.env.DATABASE_URL;
if (!url) { console.log("DATABASE_URL mangler; news-tabellen opprettes ved db:setup."); process.exit(0); }
const sql = postgres(url, { ssl: url.includes("localhost") ? false : "require", prepare: false });
await sql`create table if not exists vedoy_news_posts (id text primary key, organization_id text not null references organizations(id) on delete cascade, slug text not null, title text not null, excerpt text not null default '', content text not null default '', category text not null default 'Announcements', status text not null default 'draft' check (status in ('draft','published')), author_type text not null default 'user' check (author_type in ('user','vedi')), author_name text not null, author_avatar_url text, sort_order integer not null default 0, published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, slug))`;
await sql`create index if not exists vedoy_news_posts_org_status_idx on vedoy_news_posts (organization_id, status, sort_order, published_at desc)`;
console.log("Vedøy News-tabellen er klar."); await sql.end();

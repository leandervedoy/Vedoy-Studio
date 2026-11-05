import postgres from "postgres";
const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL mangler; kan ikke migrere Vedoy News."); process.exit(1); }
const sql = postgres(url, { ssl: url.includes("localhost") ? false : "require", prepare: false });
try {
  await sql`create table if not exists vedoy_news_comments (
    id text primary key, post_id text not null references vedoy_news_posts(id) on delete cascade,
    user_id text not null, username text not null, body text not null,
    status text not null default 'approved' check (status in ('approved', 'flagged', 'removed')),
    flagged_reason text,
    created_at timestamptz not null default now(), updated_at timestamptz not null default now())`;
  await sql`create index if not exists vedoy_news_comments_post_idx on vedoy_news_comments(post_id, status, created_at desc)`;
  await sql`create index if not exists vedoy_news_comments_moderation_idx on vedoy_news_comments(status, created_at desc)`;
  await sql`create index if not exists vedoy_news_comments_user_idx on vedoy_news_comments(user_id, created_at desc)`;
  await sql`create table if not exists vedoy_news_shield_terms (
    id text primary key, phrase text not null unique, active boolean not null default true,
    created_at timestamptz not null default now())`;
  await sql`create table if not exists vedoy_news_shield_bans (
    user_id text primary key, username text not null, expires_at timestamptz not null,
    reason text not null, moderator_id text not null, created_at timestamptz not null default now())`;
  await sql`create table if not exists vedoy_news_shield_rate (
    id text primary key, period_start timestamptz not null default now(), hits integer not null default 0)`;
  await sql`create index if not exists vedoy_news_shield_rate_age_idx on vedoy_news_shield_rate(period_start)`;
  await sql`create table if not exists vedoy_news_shield_audit (
    id text primary key, actor_id text not null, action text not null, subject_id text not null,
    details text not null default '', created_at timestamptz not null default now())`;
  await sql`create table if not exists vedoy_news_advertisements (
    id text primary key, sponsor text not null, headline text not null, body text not null,
    destination_url text not null, placement text not null check (placement in ('index','article','all')),
    status text not null default 'draft' check (status in ('draft','active','paused')),
    created_at timestamptz not null default now(), updated_at timestamptz not null default now())`;
  for (const phrase of ["hold kjeft", "du er en idiot", "dra til helvete", "jeg skal drepe deg", "kill yourself"]) {
    await sql`insert into vedoy_news_shield_terms (id, phrase) values (${"term_" + phrase.replace(/[^a-z]+/g, "_")}, ${phrase}) on conflict (phrase) do nothing`;
  }
  console.log("Vedoy News community, Vedoy Shield og Vedoy Advertisement er migrert.");
} finally { await sql.end(); }

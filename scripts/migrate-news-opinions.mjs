import postgres from "postgres";
const url=process.env.DATABASE_URL;
if(!url){console.error("DATABASE_URL må være konfigurert.");process.exit(1);}
const sql=postgres(url,{ssl:url.includes("localhost")?false:"require",prepare:false});
try {
  await sql`create table if not exists vedoy_news_opinions (
    id text primary key,
    author_id text not null, author_name text not null,
    title text not null, excerpt text not null, body text not null,
    status text not null default 'pending_review'
      check (status in ('pending_review','changes_requested','author_approval','rejected','published')),
    feedback text,
    proposed_title text, proposed_excerpt text, proposed_body text,
    approved_post_id text references vedoy_news_posts(id) on delete set null,
    author_license_confirmed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    published_at timestamptz
  )`;
  await sql`create index if not exists vedoy_news_opinions_author_idx on vedoy_news_opinions(author_id,created_at desc)`;
  await sql`create index if not exists vedoy_news_opinions_queue_idx on vedoy_news_opinions(status,created_at desc)`;
  await sql`create table if not exists vedoy_news_opinion_events (
    id text primary key, opinion_id text not null references vedoy_news_opinions(id) on delete cascade,
    actor_id text not null, event text not null, note text,
    created_at timestamptz not null default now()
  )`;
  await sql`create index if not exists vedoy_news_opinion_events_parent_idx on vedoy_news_opinion_events(opinion_id,created_at desc)`;
  console.log("Meninger-modulen er klar.");
} finally { await sql.end(); }

import postgres from "postgres";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL mangler. Avbryter uten å endre databasen.");
const sql = postgres(url, { max: 1, prepare: false, ssl: url.includes("localhost") ? false : "require" });
try {
  await sql`create table if not exists studio_page_preview_access (
    page_id text not null references studio_pages(id) on delete cascade,
    viewer_email text not null,
    granted_by text not null,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null default (now() + interval '30 days'),
    primary key (page_id, viewer_email),
    constraint valid_preview_email check (viewer_email = lower(viewer_email))
  )`;
  await sql`create index if not exists studio_page_preview_access_email_idx
    on studio_page_preview_access (viewer_email, expires_at)`;
  console.log("✓ Tilgang for private kundepreviews er klar.");
} finally {
  await sql.end();
}

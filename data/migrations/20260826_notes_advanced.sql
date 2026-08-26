create table if not exists studio_note_versions (
  id text primary key,
  note_id text not null references studio_notes(id) on delete cascade,
  organization_id text not null references organizations(id) on delete cascade,
  title text not null,
  content text not null,
  color text not null,
  notebook text not null,
  section text not null,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists studio_note_versions_note_idx on studio_note_versions (organization_id, note_id, created_at desc);

create table if not exists studio_note_attachments (
  id text primary key,
  note_id text not null references studio_notes(id) on delete cascade,
  organization_id text not null references organizations(id) on delete cascade,
  filename text not null,
  content_type text not null,
  size_bytes integer not null check (size_bytes between 1 and 2097152),
  data bytea not null,
  created_at timestamptz not null default now()
);
create index if not exists studio_note_attachments_note_idx on studio_note_attachments (organization_id, note_id, created_at desc);

create table if not exists studio_note_shares (
  token text primary key,
  note_id text not null unique references studio_notes(id) on delete cascade,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table studio_note_versions enable row level security;
alter table studio_note_attachments enable row level security;
alter table studio_note_shares enable row level security;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table studio_note_versions, studio_note_attachments, studio_note_shares from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table studio_note_versions, studio_note_attachments, studio_note_shares from authenticated;
  end if;
end $$;

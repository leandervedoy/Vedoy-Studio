create table if not exists studio_notes (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  title text not null default 'Uten tittel',
  content text not null default '',
  color text not null default 'sand' check (color in ('sand', 'lemon', 'mint', 'lavender', 'coral')),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists studio_notes_org_updated_idx on studio_notes (organization_id, pinned desc, updated_at desc);
alter table studio_notes enable row level security;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table studio_notes from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table studio_notes from authenticated;
  end if;
end $$;

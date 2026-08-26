create table if not exists work_time_entries (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  owner_email text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  note text not null default '',
  check (ended_at is null or ended_at >= started_at)
);
create index if not exists work_time_entries_org_owner_idx on work_time_entries (organization_id, owner_email, started_at desc);
create unique index if not exists work_time_entries_one_open_idx on work_time_entries (organization_id, owner_email) where ended_at is null;
alter table work_time_entries enable row level security;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then revoke all on table work_time_entries from anon; end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then revoke all on table work_time_entries from authenticated; end if;
end $$;

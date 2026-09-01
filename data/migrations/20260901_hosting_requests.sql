create table if not exists hosting_requests (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  name text not null,
  company text,
  email text not null,
  phone text,
  server_count integer not null check (server_count between 1 and 5),
  ram_gb integer not null check (ram_gb in (4, 8, 16, 32)),
  storage_gb integer not null check (storage_gb in (80, 160, 320, 640)),
  region text not null,
  backups boolean not null default true,
  domain_mode text not null check (domain_mode in ('new', 'existing', 'none')),
  domain text,
  monthly_nok integer not null check (monthly_nok >= 0),
  setup_nok integer not null check (setup_nok >= 0),
  details text,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists hosting_requests_org_created_idx on hosting_requests (organization_id, created_at desc);
alter table hosting_requests enable row level security;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table hosting_requests from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table hosting_requests from authenticated;
  end if;
end $$;

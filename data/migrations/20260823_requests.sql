create table if not exists contact_requests (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  name text not null,
  company text,
  email text not null,
  phone text,
  need text not null,
  message text,
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);
create index if not exists contact_requests_org_created_idx on contact_requests (organization_id, created_at desc);

create table if not exists clothing_requests (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  name text not null,
  company text,
  email text not null,
  phone text,
  product_name text not null,
  product_code text not null,
  quantity integer not null check (quantity between 1 and 10000),
  details text,
  logo_filename text,
  logo_content_type text,
  logo_data bytea,
  status text not null default 'new' check (status in ('new','contacted','quoted','closed')),
  created_at timestamptz not null default now()
);
create index if not exists clothing_requests_org_created_idx on clothing_requests (organization_id, created_at desc);

alter table contact_requests enable row level security;
alter table clothing_requests enable row level security;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table contact_requests, clothing_requests from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table contact_requests, clothing_requests from authenticated;
  end if;
end $$;

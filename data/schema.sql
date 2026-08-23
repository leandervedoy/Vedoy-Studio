create table if not exists organizations (
  id text primary key,
  name text not null,
  plan text not null default 'Studio Growth',
  location text,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  framework text not null,
  status text not null check (status in ('healthy','building','attention','paused')),
  production_url text not null,
  region text not null,
  last_deploy_at timestamptz not null,
  monthly_requests integer not null default 0,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists domains (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  name text not null,
  status text not null check (status in ('active','pending','expiring')),
  auto_renew boolean not null default true,
  expires_at timestamptz not null,
  project_id text references projects(id) on delete set null,
  dns_provider text not null,
  unique (organization_id, name)
);

create table if not exists bookings (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  service_id text not null,
  service_name text not null,
  plan_id text,
  staff_id text,
  location text,
  custom_fields jsonb not null default '{}'::jsonb,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  notes text,
  status text not null check (status in ('pending','confirmed','in-progress','completed','cancelled','no-show')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
alter table bookings drop constraint if exists bookings_status_check;
alter table bookings add constraint bookings_status_check
  check (status in ('pending','confirmed','in-progress','completed','cancelled','no-show'));
create index if not exists bookings_org_starts_idx on bookings (organization_id, starts_at);

create table if not exists customers (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  company text,
  value_nok integer not null default 0,
  last_activity_at timestamptz not null default now(),
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists api_keys (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  name text not null,
  prefix text not null,
  secret_hash text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  scopes jsonb not null default '[]'::jsonb
);

create table if not exists support_tickets (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  subject text not null,
  message text not null,
  priority text not null check (priority in ('low','normal','high')),
  status text not null check (status in ('open','in-progress','resolved')),
  created_at timestamptz not null default now()
);

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

insert into organizations (id, name, plan, location)
values ('org_vedoy', 'Vedøy', 'Studio Growth', 'Haugesund')
on conflict (id) do update set name = excluded.name, plan = excluded.plan, location = excluded.location;

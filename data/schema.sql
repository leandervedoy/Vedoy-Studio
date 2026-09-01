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
alter table organizations add column if not exists organization_number text;
alter table organizations add column if not exists timezone text not null default 'Europe/Oslo';
alter table organizations add column if not exists description text not null default '';

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

create table if not exists studio_notes (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  title text not null default 'Uten tittel',
  content text not null default '',
  color text not null default 'sand' check (color in ('sand', 'lemon', 'mint', 'lavender', 'coral')),
  pinned boolean not null default false,
  notebook text not null default 'Arbeidsområde',
  section text not null default 'Generelt',
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists studio_notes_org_updated_idx on studio_notes (organization_id, pinned desc, updated_at desc);
create index if not exists studio_notes_org_notebook_idx on studio_notes (organization_id, notebook, section, updated_at desc);

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

create table if not exists growth_notifications (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  user_email text not null,
  type text not null check (type in ('lead', 'booking', 'system')),
  title text not null,
  detail text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists growth_notifications_user_idx on growth_notifications (organization_id, user_email, read_at, created_at desc);

create table if not exists growth_preferences (
  organization_id text not null references organizations(id) on delete cascade,
  user_email text not null,
  in_app_notifications boolean not null default true,
  email_booking boolean not null default true,
  email_system boolean not null default true,
  daily_digest boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_email)
);

alter table contact_requests enable row level security;
alter table clothing_requests enable row level security;
alter table hosting_requests enable row level security;
alter table studio_notes enable row level security;
alter table studio_note_versions enable row level security;
alter table studio_note_attachments enable row level security;
alter table studio_note_shares enable row level security;
alter table work_time_entries enable row level security;
alter table growth_notifications enable row level security;
alter table growth_preferences enable row level security;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table contact_requests, clothing_requests, hosting_requests, studio_notes, studio_note_versions, studio_note_attachments, studio_note_shares, work_time_entries, growth_notifications, growth_preferences from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table contact_requests, clothing_requests, hosting_requests, studio_notes, studio_note_versions, studio_note_attachments, studio_note_shares, work_time_entries, growth_notifications, growth_preferences from authenticated;
  end if;
end $$;

insert into organizations (id, name, plan, location)
values ('org_vedoy', 'Vedøy', 'Studio Growth', 'Haugesund')
on conflict (id) do update set name = excluded.name, plan = excluded.plan, location = excluded.location;

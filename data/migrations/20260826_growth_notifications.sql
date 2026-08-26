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
alter table organizations add column if not exists organization_number text;
alter table organizations add column if not exists timezone text not null default 'Europe/Oslo';
alter table organizations add column if not exists description text not null default '';
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
alter table growth_notifications enable row level security;
alter table growth_preferences enable row level security;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then revoke all on table growth_notifications, growth_preferences from anon; end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then revoke all on table growth_notifications, growth_preferences from authenticated; end if;
end $$;

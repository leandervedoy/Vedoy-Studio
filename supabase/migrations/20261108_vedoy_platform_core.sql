-- Vedøy Platform Core: tenant-safe control data. Run with the existing Studio database migration process.
create table if not exists platform_feature_flags (
  organization_id text not null references organizations(id) on delete cascade,
  flag text not null check (flag in ('forge','calendar','vedi','payments')),
  enabled boolean not null default false, updated_at timestamptz not null default now(),
  primary key (organization_id, flag)
);
create table if not exists platform_jobs (
  id text primary key, organization_id text not null references organizations(id) on delete cascade,
  type text not null check (type in ('email','webhook','domain_check','ssl_check','notification')),
  payload jsonb not null default '{}'::jsonb, status text not null default 'queued' check (status in ('queued','running','completed','failed')),
  attempts integer not null default 0, run_at timestamptz not null default now(), locked_at timestamptz, last_error text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists platform_jobs_ready_idx on platform_jobs (status, run_at) where status = 'queued';
create table if not exists platform_api_key_audit (
  id text primary key, organization_id text not null references organizations(id) on delete cascade,
  api_key_id text not null, action text not null, actor_email text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
alter table api_keys add column if not exists revoked_at timestamptz;
alter table api_keys add column if not exists expires_at timestamptz;
alter table api_keys add column if not exists rate_limit_per_minute integer not null default 60 check (rate_limit_per_minute between 1 and 10000);
create index if not exists api_keys_active_org_idx on api_keys (organization_id, prefix) where revoked_at is null;
insert into platform_feature_flags (organization_id, flag, enabled) values ('org_vedoy', 'forge', true) on conflict do nothing;

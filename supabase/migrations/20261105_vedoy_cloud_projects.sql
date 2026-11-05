-- Vedoy Cloud beta: separate customer project catalog and private object metadata.
-- Cloud server validates authenticated OIDC subject and ownership on every operation.
-- Only service_role has table privileges; browser has no direct Data API access.
create table if not exists public.vedoy_cloud_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null check (char_length(owner_id) between 3 and 200),
  name text not null check (char_length(name) between 2 and 100),
  source text not null default 'manual' check (source in ('manual','github','folder')),
  github_url text,
  github_owner text,
  github_repo text,
  github_default_branch text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vedoy_cloud_projects_owner_idx on public.vedoy_cloud_projects (owner_id, created_at desc);
alter table public.vedoy_cloud_projects enable row level security;
revoke all on public.vedoy_cloud_projects from anon, authenticated;
grant select, insert, update, delete on public.vedoy_cloud_projects to service_role;

create table if not exists public.vedoy_cloud_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.vedoy_cloud_projects(id) on delete cascade,
  owner_id text not null check (char_length(owner_id) between 3 and 200),
  display_path text not null check (char_length(display_path) between 1 and 500),
  storage_key text not null unique,
  size_bytes bigint not null check (size_bytes >= 0 and size_bytes <= 10485760),
  mime_type text not null default 'application/octet-stream',
  status text not null default 'pending' check (status in ('pending','ready')),
  created_at timestamptz not null default now()
);
create index if not exists vedoy_cloud_files_owner_idx on public.vedoy_cloud_files (owner_id, status, created_at desc);
create index if not exists vedoy_cloud_files_project_idx on public.vedoy_cloud_files (project_id, created_at desc);
alter table public.vedoy_cloud_files enable row level security;
revoke all on public.vedoy_cloud_files from anon, authenticated;
grant select, insert, update, delete on public.vedoy_cloud_files to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vedoy-cloud-private', 'vedoy-cloud-private', false, 10485760, null)
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = null;

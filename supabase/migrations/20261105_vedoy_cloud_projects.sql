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

-- Apply the following guard to existing Cloud installations before a public beta.
-- The advisory lock serializes simultaneous reservations per owner, so both the
-- 30-project and 100 MiB/200-file limits remain effective under concurrency.
create unique index if not exists vedoy_cloud_project_id_owner_uq
  on public.vedoy_cloud_projects (id, owner_id);

do $$
begin
  if not exists (select 1 from pg_catalog.pg_constraint
                 where conrelid = 'public.vedoy_cloud_files'::regclass
                   and conname = 'vedoy_cloud_files_project_owner_fkey') then
    alter table public.vedoy_cloud_files
      add constraint vedoy_cloud_files_project_owner_fkey
      foreign key (project_id, owner_id)
      references public.vedoy_cloud_projects (id, owner_id)
      on delete cascade;
  end if;
end $$;

create or replace function public.vedoy_cloud_project_insert_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('vedoy-cloud:' || new.owner_id, 0));
  if (select pg_catalog.count(*) from public.vedoy_cloud_projects p where p.owner_id = new.owner_id) >= 30 then
    raise exception using errcode = '23514', message = 'CLOUD_PROJECT_LIMIT';
  end if;
  return new;
end $$;

drop trigger if exists vedoy_cloud_project_insert_guard on public.vedoy_cloud_projects;
create trigger vedoy_cloud_project_insert_guard
  before insert on public.vedoy_cloud_projects
  for each row execute function public.vedoy_cloud_project_insert_guard();

create or replace function public.vedoy_cloud_file_insert_guard()
returns trigger language plpgsql set search_path = '' as $$
declare
  used_bytes bigint;
  existing_files integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('vedoy-cloud:' || new.owner_id, 0));
  -- The composite foreign key also enforces this invariant at commit time.
  if not exists (select 1 from public.vedoy_cloud_projects p
                 where p.id = new.project_id and p.owner_id = new.owner_id) then
    raise exception using errcode = '23503', message = 'CLOUD_OWNER_MISMATCH';
  end if;
  select coalesce(pg_catalog.sum(f.size_bytes), 0) into used_bytes
    from public.vedoy_cloud_files f where f.owner_id = new.owner_id;
  if used_bytes + new.size_bytes > 104857600 then
    raise exception using errcode = '23514', message = 'CLOUD_STORAGE_LIMIT';
  end if;
  select pg_catalog.count(*) into existing_files
    from public.vedoy_cloud_files f
    where f.owner_id = new.owner_id and f.project_id = new.project_id;
  if existing_files >= 200 then
    raise exception using errcode = '23514', message = 'CLOUD_FILE_COUNT_LIMIT';
  end if;
  return new;
end $$;

drop trigger if exists vedoy_cloud_file_insert_guard on public.vedoy_cloud_files;
create trigger vedoy_cloud_file_insert_guard
  before insert on public.vedoy_cloud_files
  for each row execute function public.vedoy_cloud_file_insert_guard();

-- Keep tenant ownership and reserved byte size immutable. Only status changes
-- (pending -> ready) are part of the current Cloud API.
create or replace function public.vedoy_cloud_immutable_ownership_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_table_name = 'vedoy_cloud_projects' then
    if new.owner_id is distinct from old.owner_id then
      raise exception using errcode = '23514', message = 'CLOUD_OWNER_IMMUTABLE';
    end if;
  elsif (new.owner_id, new.project_id, new.storage_key, new.size_bytes)
        is distinct from (old.owner_id, old.project_id, old.storage_key, old.size_bytes) then
    raise exception using errcode = '23514', message = 'CLOUD_FILE_METADATA_IMMUTABLE';
  end if;
  return new;
end $$;

drop trigger if exists vedoy_cloud_project_immutable_guard on public.vedoy_cloud_projects;
create trigger vedoy_cloud_project_immutable_guard
  before update on public.vedoy_cloud_projects
  for each row execute function public.vedoy_cloud_immutable_ownership_guard();

drop trigger if exists vedoy_cloud_file_immutable_guard on public.vedoy_cloud_files;
create trigger vedoy_cloud_file_immutable_guard
  before update on public.vedoy_cloud_files
  for each row execute function public.vedoy_cloud_immutable_ownership_guard();

revoke all on function public.vedoy_cloud_project_insert_guard() from public, anon, authenticated;
revoke all on function public.vedoy_cloud_file_insert_guard() from public, anon, authenticated;
revoke all on function public.vedoy_cloud_immutable_ownership_guard() from public, anon, authenticated;

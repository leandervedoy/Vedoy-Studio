
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

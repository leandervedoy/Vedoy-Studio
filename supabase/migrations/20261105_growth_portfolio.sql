-- Vedoy Growth: private, organization-scoped project portfolio.
-- The Studio HMAC session is validated by Next.js, not by Supabase Auth.
-- These tables deliberately expose no anon/authenticated RLS policies.
create table if not exists public.growth_portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  name text not null check (char_length(name) between 2 and 180),
  description text not null default '',
  source text not null default 'manual' check (source in ('manual','github','gitea','upload','git-url')),
  repo_full_name text,
  repo_url text,
  repo_default_branch text,
  parent_id uuid references public.growth_portfolio_projects(id) on delete set null,
  progress integer not null default 0 check (progress between 0 and 100),
  progress_confirmed boolean not null default false,
  stage text not null default 'idea' check (stage in ('idea','building','testing','ready','launched','paused')),
  short_value integer not null default 3 check (short_value between 1 and 5),
  long_value integer not null default 3 check (long_value between 1 and 5),
  remaining_hours integer not null default 8 check (remaining_hours between 0 and 10000),
  manual_priority integer not null default 3 check (manual_priority between 1 and 5),
  next_action text not null default '',
  launch_url text,
  repo_health text not null default 'unknown' check (repo_health in ('unknown','success','failure','pending')),
  repo_last_push timestamptz,
  checked_at timestamptz,
  archive_path text,
  archive_bytes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, source, repo_full_name)
);
create index if not exists growth_portfolio_org_parent_idx on public.growth_portfolio_projects(organization_id, parent_id);
create index if not exists growth_portfolio_org_updated_idx on public.growth_portfolio_projects(organization_id, updated_at desc);
alter table public.growth_portfolio_projects enable row level security;
revoke all on public.growth_portfolio_projects from anon, authenticated;

create table if not exists public.growth_portfolio_preferences (
  organization_id text primary key,
  goal text not null default 'soon' check (goal in ('soon','short','long','balanced')),
  mode text not null default 'auto' check (mode in ('auto','manual')),
  updated_at timestamptz not null default now()
);
alter table public.growth_portfolio_preferences enable row level security;
revoke all on public.growth_portfolio_preferences from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vedoy-portfolio-projects', 'vedoy-portfolio-projects', false, 3145728, array['application/zip'])
on conflict (id) do update set
  public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

comment on table public.growth_portfolio_projects is 'Server-only Growth project roadmap; access via Studio signed sessions with organization checks.';
comment on table public.growth_portfolio_preferences is 'Server-only organization-level portfolio ranking preferences.';

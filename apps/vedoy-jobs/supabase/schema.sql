-- Vedoy Jobs MVP: run manually in Supabase SQL Editor before enabling writes.
-- Designed for a dedicated Supabase project. Row-level security is required.
create extension if not exists pgcrypto;
create table if not exists public.vjobs_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(display_name) between 2 and 90),
 account_type text not null check (account_type in ('worker','business')),
 age_band text not null default '' check (age_band in ('','15_17','18_20','21_25','26_plus')),
 city text not null default 'Haugesund',
 created_at timestamptz not null default now()
);
create table if not exists public.vjobs_jobs (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 8 and 120),
 description text not null check (char_length(description) between 30 and 3000),
 category text not null check(category in ('writing','digital','delivery','phone_sales','local')),
 city text not null default 'Haugesund',
 pay_ore integer not null check(pay_ore between 1000 and 20000000),
 estimated_minutes integer not null check(estimated_minutes between 15 and 480),
 min_age integer not null check (min_age in (15,18)),
 employer_name text not null check (char_length(employer_name) between 2 and 100),
 backup_enabled boolean not null default false,
 status text not null default 'pending_review' check (status in ('pending_review','open','closed','rejected')),
 created_at timestamptz not null default now(),
 constraint jobs_age_safety check (min_age=18 or (category in ('writing','digital'))),
 constraint jobs_backup_safety check (not backup_enabled or category='delivery')
);
create table if not exists public.vjobs_applications (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.vjobs_jobs(id) on delete cascade,
 applicant_id uuid not null references auth.users(id) on delete cascade,
 message text not null check (char_length(message) between 10 and 1000),
 status text not null default 'pending' check(status in ('pending','shortlisted','accepted','rejected','withdrawn')),
 created_at timestamptz not null default now(),
 unique(job_id,applicant_id)
);
create index if not exists vjobs_jobs_open_idx on public.vjobs_jobs(status,category,created_at desc);
create index if not exists vjobs_application_owner_idx on public.vjobs_applications(applicant_id,created_at desc);
create index if not exists vjobs_application_job_idx on public.vjobs_applications(job_id,created_at desc);

alter table public.vjobs_profiles enable row level security;
alter table public.vjobs_jobs enable row level security;
alter table public.vjobs_applications enable row level security;
revoke all on public.vjobs_profiles, public.vjobs_jobs, public.vjobs_applications from anon;
-- Public task discovery without exposing owner IDs or private application records.
grant select (id,title,description,category,city,pay_ore,estimated_minutes,min_age,employer_name,backup_enabled,status,created_at) on public.vjobs_jobs to anon;
grant select,insert,update on public.vjobs_profiles to authenticated;
grant select,insert,update on public.vjobs_jobs to authenticated;
grant select,insert,update on public.vjobs_applications to authenticated;

drop policy if exists vjobs_profiles_self_select on public.vjobs_profiles;
create policy vjobs_profiles_self_select on public.vjobs_profiles for select to authenticated using (user_id=auth.uid());
drop policy if exists vjobs_profiles_self_insert on public.vjobs_profiles;
create policy vjobs_profiles_self_insert on public.vjobs_profiles for insert to authenticated with check (user_id=auth.uid());
drop policy if exists vjobs_profiles_self_update on public.vjobs_profiles;
create policy vjobs_profiles_self_update on public.vjobs_profiles for update to authenticated using (user_id=auth.uid())
 with check (user_id=auth.uid() and (
   -- A business profile cannot overwrite its type after a job is created.
   account_type='business' or not exists (select 1 from public.vjobs_jobs j where j.owner_id=auth.uid())
 ));
drop policy if exists vjobs_jobs_read on public.vjobs_jobs;
create policy vjobs_jobs_read on public.vjobs_jobs for select to anon, authenticated
 using (status='open' or owner_id=auth.uid());
drop policy if exists vjobs_jobs_business_insert on public.vjobs_jobs;
create policy vjobs_jobs_business_insert on public.vjobs_jobs for insert to authenticated
 with check(owner_id=auth.uid() and status='pending_review'
 and exists(select 1 from public.vjobs_profiles p where p.user_id=auth.uid() and p.account_type='business'));
-- Do not permit browser clients to publish jobs or change pricing after applications.
drop policy if exists vjobs_jobs_owner_close on public.vjobs_jobs;
create policy vjobs_jobs_owner_close on public.vjobs_jobs for update to authenticated
 using (owner_id=auth.uid() and status='open')
 with check(owner_id=auth.uid() and status='closed');
-- Column restriction prevents edits to price, owner, status or category from bypassing editorial approval.
revoke update on public.vjobs_jobs from authenticated;
grant update (status) on public.vjobs_jobs to authenticated;
drop policy if exists vjobs_app_read on public.vjobs_applications;
create policy vjobs_app_read on public.vjobs_applications for select to authenticated using (
 applicant_id=auth.uid() or exists(select 1 from public.vjobs_jobs j where j.id=job_id and j.owner_id=auth.uid())
);
drop policy if exists vjobs_app_insert on public.vjobs_applications;
create policy vjobs_app_insert on public.vjobs_applications for insert to authenticated
 with check (applicant_id=auth.uid() and status='pending'
 and exists (
   select 1 from public.vjobs_jobs j
   join public.vjobs_profiles p on p.user_id=auth.uid()
   where j.id=job_id and j.status='open' and j.owner_id<>auth.uid()
   and p.account_type='worker'
   and (
     (p.age_band='15_17' and j.min_age=15 and j.category in ('writing','digital'))
     or (p.age_band in ('18_20','21_25','26_plus') and j.min_age<=18)
   )
 ));
-- Edits to application status require an audited server-side workflow; browser clients cannot accept applications.
revoke update on public.vjobs_applications from authenticated;

-- Admin review: use Supabase dashboard/service role. Only approve jobs after verifying employer and legal requirements.
-- update public.vjobs_jobs set status='open' where id='<reviewed-job-id>';
-- Wolt Drive fallback intentionally requires separate server credentials, availability/quote and explicit consent.

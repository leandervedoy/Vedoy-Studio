-- Unge i arbeid | separate job-posting and applications pilot
-- Run in a dedicated Supabase project before enabling the live website.
-- Every public table has RLS and grants. Never expose service-role credentials.
create extension if not exists pgcrypto;

create table if not exists public.uia_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check(char_length(display_name) between 2 and 90),
  account_type text not null check(account_type in ('candidate','employer')),
  age_band text check(age_band in ('15_17','18_20','21_25','26_plus')),
  city text not null default 'Haugesund' check(char_length(city) between 1 and 80),
  created_at timestamptz not null default now(),
  constraint uia_profile_age_required check((account_type='candidate' and age_band is not null)
    or (account_type='employer' and age_band is null))
);
create table if not exists public.uia_companies (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  company_name text not null check(char_length(company_name) between 2 and 110),
  org_number text not null check(org_number ~ '^[0-9]{9}$'),
  status text not null default 'pending' check(status in ('pending','verified','rejected')),
  created_at timestamptz not null default now()
);
create table if not exists public.uia_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null check(char_length(company_name) between 2 and 110),
  title text not null check(char_length(title) between 8 and 140),
  description text not null check(char_length(description) between 50 and 5000),
  category text not null check(category in ('butikk','servering','levering','arrangement','kontor','teknologi','annet')),
  city text not null check(char_length(city) between 1 and 80),
  work_type text not null check(work_type in ('part_time','summer','weekend','full_time')),
  work_mode text not null check(work_mode in ('onsite','hybrid','remote')),
  pay_min_ore integer not null check(pay_min_ore between 100 and 100000000),
  pay_max_ore integer not null check(pay_max_ore between 100 and 100000000),
  pay_unit text not null check(pay_unit in ('hour','month')),
  min_age integer not null check(min_age in (15,18)),
  application_deadline date,
  status text not null default 'pending_review' check(status in ('pending_review','published','closed','rejected')),
  created_at timestamptz not null default now(),
  constraint uia_pay_range check(pay_max_ore >= pay_min_ore),
  constraint uia_delivery_age check(category <> 'levering' or min_age = 18)
);
create table if not exists public.uia_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.uia_jobs(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  applicant_name text not null check(char_length(applicant_name) between 2 and 90),
  contact_email text not null check(char_length(contact_email) between 5 and 254),
  introduction text not null check(char_length(introduction) between 20 and 1500),
  availability text not null check(char_length(availability) between 5 and 300),
  status text not null default 'sent' check(status in ('sent','reviewed','shortlisted','rejected')),
  created_at timestamptz not null default now(),
  unique(job_id,applicant_id)
);

create index if not exists uia_jobs_public_idx on public.uia_jobs(status,category,created_at desc);
create index if not exists uia_jobs_owner_idx on public.uia_jobs(owner_id,created_at desc);
create index if not exists uia_applications_job_idx on public.uia_applications(job_id,created_at desc);
create index if not exists uia_applications_applicant_idx on public.uia_applications(applicant_id,created_at desc);

alter table public.uia_profiles enable row level security;
alter table public.uia_companies enable row level security;
alter table public.uia_jobs enable row level security;
alter table public.uia_applications enable row level security;

revoke all on public.uia_profiles, public.uia_companies, public.uia_jobs, public.uia_applications from anon;
grant select,insert on public.uia_profiles to authenticated;
grant select,insert on public.uia_companies to authenticated;
grant select,insert on public.uia_jobs to authenticated;
grant update(status) on public.uia_jobs to authenticated;
grant select,insert on public.uia_applications to authenticated;
grant update(status) on public.uia_applications to authenticated;

-- Anonymous users may view only explicitly public job fields.
grant select(id,company_name,title,description,category,city,work_type,work_mode,
  pay_min_ore,pay_max_ore,pay_unit,min_age,application_deadline,status,created_at)
  on public.uia_jobs to anon;

drop policy if exists uia_profiles_self_read on public.uia_profiles;
create policy uia_profiles_self_read on public.uia_profiles
 for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists uia_profiles_self_create on public.uia_profiles;
create policy uia_profiles_self_create on public.uia_profiles
 for insert to authenticated with check(user_id=(select auth.uid()));
-- Do not grant UPDATE: account type and age band need human verification to change.

drop policy if exists uia_companies_owner_read on public.uia_companies;
create policy uia_companies_owner_read on public.uia_companies
 for select to authenticated using(owner_id=(select auth.uid()));
drop policy if exists uia_companies_owner_create on public.uia_companies;
create policy uia_companies_owner_create on public.uia_companies
 for insert to authenticated with check(
  owner_id=(select auth.uid()) and status='pending'
  and exists(select 1 from public.uia_profiles p
    where p.user_id=(select auth.uid()) and p.account_type='employer')
 );
-- Companies cannot self-verify; approval is an admin-only manual step.

drop policy if exists uia_jobs_read on public.uia_jobs;
create policy uia_jobs_read on public.uia_jobs
 for select to anon,authenticated using(status='published' or owner_id=(select auth.uid()));
drop policy if exists uia_jobs_employer_create on public.uia_jobs;
create policy uia_jobs_employer_create on public.uia_jobs
 for insert to authenticated with check(
  owner_id=(select auth.uid()) and status='pending_review'
  and exists(select 1 from public.uia_companies c where c.owner_id=(select auth.uid())
   and c.status in ('pending','verified') and c.company_name=uia_jobs.company_name)
 );
drop policy if exists uia_jobs_employer_close on public.uia_jobs;
create policy uia_jobs_employer_close on public.uia_jobs
 for update to authenticated using(owner_id=(select auth.uid()) and status='published')
 with check(owner_id=(select auth.uid()) and status='closed');

drop policy if exists uia_applications_read on public.uia_applications;
create policy uia_applications_read on public.uia_applications
 for select to authenticated using(
   applicant_id=(select auth.uid()) or
   exists(select 1 from public.uia_jobs j
    where j.id=job_id and j.owner_id=(select auth.uid()))
 );
drop policy if exists uia_applications_create on public.uia_applications;
create policy uia_applications_create on public.uia_applications
 for insert to authenticated with check(
  applicant_id=(select auth.uid()) and status='sent'
  and contact_email=(select auth.jwt()->>'email')
  and exists(select 1 from public.uia_profiles p
   where p.user_id=(select auth.uid()) and p.account_type='candidate'
    and p.display_name=applicant_name)
  and exists(select 1 from public.uia_jobs j where j.id=job_id
   and j.status='published' and j.owner_id<>(select auth.uid())
   and (j.application_deadline is null or j.application_deadline>=current_date)
   and (
     j.min_age=15 and j.category<>'levering'
     or (j.min_age=18 and exists(select 1 from public.uia_profiles p
       where p.user_id=(select auth.uid()) and p.age_band in ('18_20','21_25','26_plus')))
   ))
 );
drop policy if exists uia_applications_employer_review on public.uia_applications;
create policy uia_applications_employer_review on public.uia_applications
 for update to authenticated using(
   exists(select 1 from public.uia_jobs j
    where j.id=job_id and j.owner_id=(select auth.uid()))
 )
 with check(
   exists(select 1 from public.uia_jobs j
    where j.id=job_id and j.owner_id=(select auth.uid()))
 );
-- Only the status column is writable on existing applications.
-- Employment agreements, actual age verification, payroll and employer screening
-- must take place before a hire. No automatic employment or payout occurs.

-- Example manual moderation AFTER validating organization number and job details:
-- update public.uia_companies set status='verified' where owner_id='<verified-user-uuid>';
-- update public.uia_jobs set status='published' where id='<reviewed-job-uuid>';


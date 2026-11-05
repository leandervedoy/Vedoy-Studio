-- Additional CV and employer-issued work confirmation features.
-- Apply AFTER apps/unge-i-arbeid/supabase/schema.sql.
-- Employers cannot read private CV drafts. Candidates explicitly share a snapshot per application.

create table if not exists public.uia_cvs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  headline text not null default '' check(char_length(headline)<=150),
  summary text not null default '' check(char_length(summary)<=1200),
  skills text not null default '' check(char_length(skills)<=900),
  education text not null default '' check(char_length(education)<=900),
  other_experience text not null default '' check(char_length(other_experience)<=1300),
  updated_at timestamptz not null default now()
);
alter table public.uia_cvs enable row level security;
revoke all on public.uia_cvs from anon;
grant select,insert on public.uia_cvs to authenticated;
grant update(headline,summary,skills,education,other_experience,updated_at) on public.uia_cvs to authenticated;

drop policy if exists uia_cv_self_select on public.uia_cvs;
create policy uia_cv_self_select on public.uia_cvs for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists uia_cv_self_insert on public.uia_cvs;
create policy uia_cv_self_insert on public.uia_cvs for insert to authenticated
 with check(user_id=(select auth.uid()) and exists(select 1 from public.uia_profiles p where p.user_id=(select auth.uid()) and p.account_type='candidate'));
drop policy if exists uia_cv_self_update on public.uia_cvs;
create policy uia_cv_self_update on public.uia_cvs for update to authenticated
 using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

alter table public.uia_applications add column if not exists cv_snapshot text not null default '' check(char_length(cv_snapshot)<=2200);
-- Candidate cannot edit an application after submit.
-- Employer can read cv_snapshot ONLY if the candidate shared it in this application.

-- Mark work 'completed' explicitly for testimonial issuance; this does not constitute payroll or legal contracting.
alter table public.uia_applications drop constraint if exists uia_applications_status_check;
alter table public.uia_applications add constraint uia_applications_status_check
 check(status in ('sent','reviewed','shortlisted','rejected','hired','completed'));

create table if not exists public.uia_work_confirmations (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.uia_applications(id) on delete cascade,
  job_id uuid not null references public.uia_jobs(id),
  candidate_id uuid not null references auth.users(id) on delete cascade,
  employer_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null check(char_length(company_name) between 2 and 110),
  worker_name text not null check(char_length(worker_name) between 2 and 90),
  position_title text not null check(char_length(position_title) between 3 and 140),
  start_date date not null,
  end_date date not null,
  duties text not null check(char_length(duties) between 20 and 1400),
  optional_assessment text not null default '' check(char_length(optional_assessment)<=1000),
  issued_by text not null check(char_length(issued_by) between 2 and 100),
  issuer_confirmed boolean not null check(issuer_confirmed=true),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  check(end_date>=start_date)
);
alter table public.uia_work_confirmations enable row level security;
revoke all on public.uia_work_confirmations from anon;
grant select,insert on public.uia_work_confirmations to authenticated;
drop policy if exists uia_confirmations_owner_read on public.uia_work_confirmations;
create policy uia_confirmations_owner_read on public.uia_work_confirmations
 for select to authenticated using(candidate_id=(select auth.uid()) or employer_id=(select auth.uid()));
drop policy if exists uia_confirmations_verified_employer_insert on public.uia_work_confirmations;
create policy uia_confirmations_verified_employer_insert on public.uia_work_confirmations
 for insert to authenticated with check(
  employer_id=(select auth.uid()) and issuer_confirmed=true and revoked_at is null
  and exists(select 1 from public.uia_companies c
    where c.owner_id=(select auth.uid()) and c.status='verified' and c.company_name=uia_work_confirmations.company_name)
  and exists(select 1 from public.uia_applications a
    join public.uia_jobs j on j.id=a.job_id
    join public.uia_profiles p on p.user_id=a.applicant_id
    where a.id=application_id and j.id=job_id and a.applicant_id=candidate_id
    and j.owner_id=employer_id and a.status='completed'
    and j.company_name=uia_work_confirmations.company_name and j.title=uia_work_confirmations.position_title
    and p.display_name=uia_work_confirmations.worker_name)
 );
-- Employer cannot update a published confirmation or backdate its issue time.
-- A service administrator handles corrections/revocation; no public insert/update route.

-- Signer's display name is an attestation by the account holder, not a qualified
-- electronic signature, BankID signature, or a complete statutory employment certificate.
-- Do not collect birth dates in this prototype; formal attestations may need extra fields.

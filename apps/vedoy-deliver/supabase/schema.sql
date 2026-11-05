-- Vedoy Deliver MVP: run in a dedicated Supabase project before enabling live operations.
-- GDPR: retain private delivery contact details only as long as operationally necessary.
-- Only a trusted service operator can create jobs, approve members or verify payouts.
create extension if not exists pgcrypto;

create table if not exists public.vdeliver_couriers (
 user_id uuid primary key references auth.users(id) on delete cascade,
 name text not null check(char_length(name) between 2 and 90),
 age_band text not null check(age_band in ('15_17','18_20','21_25')),
 city text not null check(char_length(city) between 2 and 80),
 mode text not null check(mode in ('walk','bike','car')),
 motivation text not null check(char_length(motivation) between 20 and 1000),
 availability text not null check(char_length(availability) between 5 and 300),
 status text not null default 'pending' check(status in ('pending','approved','declined','suspended')),
 minor_checked boolean not null default false,
 created_at timestamptz not null default now(),
 constraint vdeliver_minors_no_car check(age_band<>'15_17' or mode<>'car')
);
create table if not exists public.vdeliver_tasks (
 id uuid primary key default gen_random_uuid(),
 merchant_name text not null check(char_length(merchant_name) between 2 and 100),
 pickup_area text not null check(char_length(pickup_area) between 2 and 100),
 dropoff_area text not null check(char_length(dropoff_area) between 2 and 100),
 estimated_minutes integer not null check(estimated_minutes between 5 and 240),
 distance_km numeric(6,2) not null check(distance_km between 0.1 and 60),
 reward_ore integer not null check(reward_ore between 1000 and 100000),
 transport text not null check(transport in ('walk','bike','car','any')),
 min_age integer not null check(min_age in (15,18)),
 minor_approved boolean not null default false,
 status text not null default 'open' check(status in ('open','claimed','picked_up','delivered','verified','cancelled')),
 courier_id uuid references auth.users(id),
 scheduled_at timestamptz not null,
 claimed_at timestamptz,
 created_at timestamptz not null default now(),
 constraint vdeliver_task_minor_route check(min_age=18 or transport in ('walk','bike')),
 constraint vdeliver_claim_consistency check (
  (status='open' and courier_id is null and claimed_at is null) or
  (status<>'open' and (status='cancelled' or (courier_id is not null and claimed_at is not null)))
 )
);
create table if not exists public.vdeliver_task_private (
 task_id uuid primary key references public.vdeliver_tasks(id) on delete cascade,
 pickup_address text not null check(char_length(pickup_address) between 4 and 220),
 dropoff_address text not null check(char_length(dropoff_address) between 4 and 220),
 recipient_name text not null check(char_length(recipient_name) between 2 and 100),
 recipient_phone text not null default '' check(char_length(recipient_phone)<=30),
 delivery_note text not null default '' check(char_length(delivery_note)<=600)
);
create table if not exists public.vdeliver_business_requests (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 company_name text not null check(char_length(company_name) between 2 and 110),
 org_number text not null check(org_number ~ '^[0-9]{9}$'),
 contact_name text not null check(char_length(contact_name) between 2 and 90),
 city text not null check(char_length(city) between 2 and 80),
 note text not null check(char_length(note) between 15 and 1400),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now()
);
create index if not exists vdeliver_open_idx on public.vdeliver_tasks(status,scheduled_at);
create index if not exists vdeliver_courier_idx on public.vdeliver_tasks(courier_id,status);
alter table public.vdeliver_couriers enable row level security;
alter table public.vdeliver_tasks enable row level security;
alter table public.vdeliver_task_private enable row level security;
alter table public.vdeliver_business_requests enable row level security;
revoke all on public.vdeliver_couriers,public.vdeliver_tasks,public.vdeliver_task_private,public.vdeliver_business_requests from anon;
revoke all on public.vdeliver_couriers,public.vdeliver_tasks,public.vdeliver_task_private,public.vdeliver_business_requests from authenticated;
grant select,insert on public.vdeliver_couriers to authenticated;
grant select on public.vdeliver_tasks to authenticated;
grant update(status,courier_id,claimed_at) on public.vdeliver_tasks to authenticated;
grant select on public.vdeliver_task_private to authenticated;
grant select,insert on public.vdeliver_business_requests to authenticated;

drop policy if exists vdeliver_courier_self_select on public.vdeliver_couriers;
create policy vdeliver_courier_self_select on public.vdeliver_couriers for select to authenticated
 using(user_id=(select auth.uid()));
drop policy if exists vdeliver_courier_apply on public.vdeliver_couriers;
create policy vdeliver_courier_apply on public.vdeliver_couriers for insert to authenticated
 with check(user_id=(select auth.uid()) and status='pending' and minor_checked=false);
-- Do not allow courier to self-approve or change age/mode after registration.
drop policy if exists vdeliver_task_list on public.vdeliver_tasks;
create policy vdeliver_task_list on public.vdeliver_tasks for select to authenticated
 using(
  (status='open' and exists(select 1 from public.vdeliver_couriers c where c.user_id=(select auth.uid())
    and c.status='approved' and (c.age_band<>'15_17' or c.minor_checked)))
  or courier_id=(select auth.uid())
 );
-- Atomic reservation via UPDATE WHERE status='open' AND courier_id IS NULL.
-- Even if two workers race, exactly one UPDATE can win.
drop policy if exists vdeliver_task_claim on public.vdeliver_tasks;
create policy vdeliver_task_claim on public.vdeliver_tasks for update to authenticated
 using(
  status='open' and courier_id is null
  and exists(select 1 from public.vdeliver_couriers c
    where c.user_id=(select auth.uid()) and c.status='approved'
      and (c.age_band<>'15_17' or c.minor_checked)
      and (transport='any' or transport=c.mode)
      and (c.age_band<>'15_17' or (min_age=15 and minor_approved and c.mode<>'car')))
 )
 with check(status='claimed' and courier_id=(select auth.uid())
    and claimed_at is not null);
drop policy if exists vdeliver_task_progress on public.vdeliver_tasks;
create policy vdeliver_task_progress on public.vdeliver_tasks for update to authenticated
 using(
   status in ('claimed','picked_up')
   and courier_id=(select auth.uid())
   and exists(select 1 from public.vdeliver_couriers c where c.user_id=(select auth.uid())
     and c.status='approved')
 )
 with check(
   courier_id=(select auth.uid())
   and status in ('picked_up','delivered')
 );
-- Protect immutable task properties using trigger because RLS can combine policies.
-- Couriers cannot change reward, destination, deadlines, recipient or merchant data.
create or replace function public.vdeliver_enforce_task_transition()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 if current_setting('request.jwt.claims',true) is not null
    and current_setting('request.jwt.claims',true) <> ''
    and (current_setting('request.jwt.claims',true)::jsonb->>'role')='authenticated' then
  if old.status='open' and new.status='claimed' and old.courier_id is null
     and new.courier_id=auth.uid() and new.claimed_at is not null then
   return new;
  elsif old.status='claimed' and new.status='picked_up' and new.courier_id=old.courier_id
     and new.claimed_at=old.claimed_at then
   return new;
  elsif old.status='picked_up' and new.status='delivered' and new.courier_id=old.courier_id
     and new.claimed_at=old.claimed_at then
   return new;
  end if;
  raise exception 'Invalid courier status transition' using errcode='42501';
 end if;
 return new;
end $$;
drop trigger if exists vdeliver_task_transition on public.vdeliver_tasks;
create trigger vdeliver_task_transition before update on public.vdeliver_tasks
 for each row execute function public.vdeliver_enforce_task_transition();

drop policy if exists vdeliver_private_assignee_read on public.vdeliver_task_private;
create policy vdeliver_private_assignee_read on public.vdeliver_task_private for select to authenticated
 using(exists(select 1 from public.vdeliver_tasks t
   where t.id=task_id and t.courier_id=(select auth.uid())
    and t.status in ('claimed','picked_up','delivered')));
drop policy if exists vdeliver_business_self_read on public.vdeliver_business_requests;
create policy vdeliver_business_self_read on public.vdeliver_business_requests for select to authenticated
 using(owner_id=(select auth.uid()));
drop policy if exists vdeliver_business_apply on public.vdeliver_business_requests;
create policy vdeliver_business_apply on public.vdeliver_business_requests for insert to authenticated
 with check(owner_id=(select auth.uid()) and status='pending');

-- Administration only in Supabase Dashboard or dedicated reviewed server endpoints:
-- Verify legal age, parental consent where relevant, insurance and route safety.
-- UPDATE public.vdeliver_couriers SET status='approved',minor_checked=true WHERE user_id=...;
-- Create tasks and private addresses as a single trusted administrative transaction.
-- Never insert real jobs without a paid merchant contract and dispatch team.
-- UPDATE public.vdeliver_tasks SET status='verified' WHERE id=... AND status='delivered';
-- A 'verified' task is an earning ledger entry, NOT a payment transfer.
-- Observe Norwegian wage protections and classification. Per-task rewards do NOT replace
-- minimum applicable pay, working-time rules, holiday pay or safe employment terms.

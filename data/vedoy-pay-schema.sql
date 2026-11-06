-- Vedoy Pay: drafts, audited partner links, and program-specific loyalty points.
-- This schema creates NO monetary wallet, bank account or actual payment card.
-- All writes are trusted server-only, scoped by verified user_id and organization_id.
create table if not exists public.vedoy_pay_card_designs (
  organization_id text not null,
  user_id uuid not null,
  color text not null check (color in ('obsidian','fjord','pine','sand','plum','rose')),
  pattern text not null check (pattern in ('solid','waves','grid','diagonal','orbit')),
  label text not null check (char_length(label) between 1 and 24),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create table if not exists public.vedoy_pay_partner_links (
  organization_id text not null,
  user_id uuid not null,
  provider text not null check (provider in ('wallester','aera')),
  external_company_ref text,
  external_account_ref text,
  status text not null default 'pending' check (status in ('pending','verified','suspended')),
  verified_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id, provider),
  check (status <> 'verified' or verified_at is not null)
);
create table if not exists public.vedoy_pay_loyalty_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  user_id uuid not null,
  delta_points integer not null check (delta_points <> 0 and abs(delta_points) <= 1000000),
  source text not null check (source in ('verified_purchase','reversal','manual_approved')),
  source_event_id text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, source, source_event_id)
);
create index if not exists vedoy_pay_loyalty_user_idx
  on public.vedoy_pay_loyalty_entries(organization_id,user_id,created_at desc);
alter table public.vedoy_pay_card_designs enable row level security;
alter table public.vedoy_pay_partner_links enable row level security;
alter table public.vedoy_pay_loyalty_entries enable row level security;
-- No RLS policies: Data API clients cannot directly access these financial-adjacent records.
-- Studio uses authenticated, user-scoped server operations only.
revoke all on public.vedoy_pay_card_designs, public.vedoy_pay_partner_links,
  public.vedoy_pay_loyalty_entries from public;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on public.vedoy_pay_card_designs, public.vedoy_pay_partner_links, public.vedoy_pay_loyalty_entries from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on public.vedoy_pay_card_designs, public.vedoy_pay_partner_links, public.vedoy_pay_loyalty_entries from authenticated';
  end if;
end $$;

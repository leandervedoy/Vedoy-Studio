-- Vedoy Studio: organization-scoped cashback ledger.
-- Values in minor currency units (ore for NOK). Only trusted server-side jobs may write.
create table if not exists public.vedoy_cashback_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  source text not null check (source in ('vedoy-pay','vedoy-store','vedoy-collective','vedoy-studio','other')),
  customer_ref text not null,
  order_ref text not null,
  event_ref text not null,
  amount_ore bigint not null check (amount_ore >= 0),
  currency text not null default 'NOK',
  state text not null check (state in ('pending','confirmed','reversed')),
  created_at timestamptz not null default now(),
  unique (organization_id, source, event_ref)
);
create index if not exists vedoy_cashback_org_created_idx on public.vedoy_cashback_entries (organization_id, created_at desc);
alter table public.vedoy_cashback_entries enable row level security;
-- No anon/authenticated direct access. Studio reads through authenticated server with organization filter.
revoke all on public.vedoy_cashback_entries from anon, authenticated;

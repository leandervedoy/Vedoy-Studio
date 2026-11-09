-- Apply after schema.sql. This migration has not been executed.
-- Identity session and verification tables are private; only the server service role may access them.
create table if not exists public.vdeliver_identity_sessions(
 state text primary key check(state ~ '^[a-f0-9]{64}$'),
 user_id uuid not null references auth.users(id) on delete cascade,
 session_id text not null,
 expires_at timestamptz not null,
 used_at timestamptz
);
create table if not exists public.vdeliver_identity_verifications(
 user_id uuid primary key references auth.users(id) on delete cascade,
 provider text not null check(provider='nbid'),
 subject_hash text not null,
 age_band text not null check(age_band in ('15_17','18_20','21_25')),
 verified_at timestamptz not null default now()
);
create unique index if not exists vdeliver_identity_unique_subject on public.vdeliver_identity_verifications(subject_hash);
create index if not exists vdeliver_identity_expiry on public.vdeliver_identity_sessions(expires_at);
alter table public.vdeliver_identity_sessions enable row level security;
alter table public.vdeliver_identity_verifications enable row level security;
revoke all on public.vdeliver_identity_sessions,public.vdeliver_identity_verifications from anon,authenticated;
-- No public RLS policies. Service role only.
-- Admin approval MUST require a valid verification AND separate employment, route, insurance, and minor safety checks.
-- Existing vdeliver_couriers status is NOT changed automatically by identity verification.

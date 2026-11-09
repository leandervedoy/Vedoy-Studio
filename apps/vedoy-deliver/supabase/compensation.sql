-- Apply after schema.sql and identity.sql. NOT deployed.
-- No client writes. Payroll and coin awards require trusted server-side verification.
create table if not exists public.vdeliver_youth_rates(
 age_tier text primary key check(age_tier in ('15_16','17','18_plus')),
 hourly_nok numeric(10,2) not null check(hourly_nok>=0),
 delivery_coins integer not null check(delivery_coins>=0),
 mailbox_photo_coins integer not null check(mailbox_photo_coins>=0),
 updated_at timestamptz not null default now()
);
insert into public.vdeliver_youth_rates(age_tier,hourly_nok,delivery_coins,mailbox_photo_coins) values
 ('15_16',150,10,5),('17',160,20,10),('18_plus',170,35,25)
on conflict(age_tier) do nothing;
create table if not exists public.vdeliver_work_sessions(
 id uuid primary key default gen_random_uuid(),
 courier_id uuid not null references auth.users(id) on delete cascade,
 started_at timestamptz not null,
 ended_at timestamptz,
 approved_at timestamptz,
 approved_by uuid references auth.users(id),
 age_tier text not null references public.vdeliver_youth_rates(age_tier),
 hourly_rate_nok numeric(10,2) not null check(hourly_rate_nok>=0),
 check(ended_at is null or ended_at>=started_at)
);
create table if not exists public.vdeliver_coin_events(
 id uuid primary key default gen_random_uuid(),
 courier_id uuid not null references auth.users(id) on delete cascade,
 event_type text not null check(event_type in ('delivery','mailbox_photo','adjustment')),
 reference_id uuid,
 coins integer not null,
 age_tier text not null references public.vdeliver_youth_rates(age_tier),
 approved_at timestamptz not null default now(),
 approved_by uuid references auth.users(id),
 created_at timestamptz not null default now()
);
create unique index if not exists vdeliver_coin_unique_reward on public.vdeliver_coin_events(courier_id,event_type,reference_id) where reference_id is not null;
create table if not exists public.vdeliver_mailbox_photo_reviews(
 id uuid primary key default gen_random_uuid(),
 courier_id uuid not null references auth.users(id) on delete cascade,
 submitted_at timestamptz not null default now(),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 photo_storage_path text not null,
 reviewer_id uuid references auth.users(id),
 reviewed_at timestamptz,
 privacy_checked boolean not null default false
);
alter table public.vdeliver_youth_rates enable row level security;
alter table public.vdeliver_work_sessions enable row level security;
alter table public.vdeliver_coin_events enable row level security;
alter table public.vdeliver_mailbox_photo_reviews enable row level security;
revoke all on public.vdeliver_youth_rates,public.vdeliver_work_sessions,public.vdeliver_coin_events,public.vdeliver_mailbox_photo_reviews from anon,authenticated;
-- The server service role manages all writes after authorization, verification and audit.
-- Do not issue coins from the browser or from unverified photo uploads.
-- Photo uploads must be private, remove EXIF and reject addresses/names/people.
-- Respect No unaddressed advertising notices; no proof of delivery solely by mailbox photo.
-- Coin tax and redemption value must be reviewed before launch.

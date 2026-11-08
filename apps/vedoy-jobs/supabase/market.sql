-- Vedoy Marked extension: run AFTER the vedoy-jobs schema.sql. New tables isolated.
create table if not exists public.vmarket_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check(char_length(display_name) between 2 and 80),
  city text not null default 'Haugesund' check(char_length(city) between 1 and 80),
  created_at timestamptz not null default now()
);
create table if not exists public.vmarket_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  seller_name text not null check(char_length(seller_name) between 2 and 80),
  title text not null check(char_length(title) between 5 and 120),
  description text not null check(char_length(description) between 20 and 4000),
  category text not null check(category in ('electronics','fashion','home','vehicles','property','sports','services','other')),
  condition text not null check(condition in ('new','like_new','good','used','not_applicable')),
  listing_type text not null check(listing_type in ('sell','give','wanted','service')),
  price_ore bigint not null check(price_ore>=0 and price_ore<=99999999999),
  city text not null check(char_length(city) between 1 and 80),
  photos text[] not null default '{}'::text[] check(cardinality(photos)<=8),
  status text not null default 'pending_review' check(status in ('pending_review','active','reserved','sold','rejected')),
  created_at timestamptz not null default now(),
  constraint vmarket_free_zero check(listing_type<>'give' or price_ore=0)
);
create table if not exists public.vmarket_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.vmarket_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,listing_id)
);
create table if not exists public.vmarket_threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.vmarket_listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(listing_id,buyer_id),
  check(buyer_id<>seller_id)
);
create table if not exists public.vmarket_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.vmarket_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check(char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists vmarket_listings_live on public.vmarket_listings(status,category,created_at desc);
create index if not exists vmarket_threads_seller on public.vmarket_threads(seller_id,created_at desc);
create index if not exists vmarket_threads_buyer on public.vmarket_threads(buyer_id,created_at desc);
create index if not exists vmarket_messages_thread on public.vmarket_messages(thread_id,created_at asc);
alter table public.vmarket_profiles enable row level security;
alter table public.vmarket_listings enable row level security;
alter table public.vmarket_favorites enable row level security;
alter table public.vmarket_threads enable row level security;
alter table public.vmarket_messages enable row level security;
revoke all on public.vmarket_profiles,public.vmarket_listings,public.vmarket_favorites,public.vmarket_threads,public.vmarket_messages from anon;
grant select (id,owner_id,seller_name,title,description,category,condition,listing_type,price_ore,city,photos,status,created_at) on public.vmarket_listings to anon;
grant select,insert on public.vmarket_profiles to authenticated;
grant select,insert on public.vmarket_listings to authenticated;
grant update (status) on public.vmarket_listings to authenticated;
grant select,insert,delete on public.vmarket_favorites to authenticated;
grant select,insert on public.vmarket_threads to authenticated;
grant select,insert on public.vmarket_messages to authenticated;
drop policy if exists vmarket_profiles_read on public.vmarket_profiles;
create policy vmarket_profiles_read on public.vmarket_profiles for select to authenticated using(user_id=auth.uid());
drop policy if exists vmarket_profiles_insert on public.vmarket_profiles;
create policy vmarket_profiles_insert on public.vmarket_profiles for insert to authenticated with check(user_id=auth.uid());
drop policy if exists vmarket_listings_read on public.vmarket_listings;
create policy vmarket_listings_read on public.vmarket_listings for select to anon,authenticated using(status='active' or owner_id=auth.uid());
drop policy if exists vmarket_listings_insert on public.vmarket_listings;
create policy vmarket_listings_insert on public.vmarket_listings for insert to authenticated with check(owner_id=auth.uid() and status='pending_review' and exists(select 1 from public.vmarket_profiles p where p.user_id=auth.uid()));
drop policy if exists vmarket_listings_close on public.vmarket_listings;
create policy vmarket_listings_close on public.vmarket_listings for update to authenticated using(owner_id=auth.uid() and status='active') with check(owner_id=auth.uid() and status in ('sold','reserved'));
drop policy if exists vmarket_favorites_select on public.vmarket_favorites;
create policy vmarket_favorites_select on public.vmarket_favorites for select to authenticated using(user_id=auth.uid());
drop policy if exists vmarket_favorites_insert on public.vmarket_favorites;
create policy vmarket_favorites_insert on public.vmarket_favorites for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.vmarket_listings l where l.id=listing_id and l.status='active'));
drop policy if exists vmarket_favorites_delete on public.vmarket_favorites;
create policy vmarket_favorites_delete on public.vmarket_favorites for delete to authenticated using(user_id=auth.uid());
drop policy if exists vmarket_threads_select on public.vmarket_threads;
create policy vmarket_threads_select on public.vmarket_threads for select to authenticated using(buyer_id=auth.uid() or seller_id=auth.uid());
drop policy if exists vmarket_threads_insert on public.vmarket_threads;
create policy vmarket_threads_insert on public.vmarket_threads for insert to authenticated with check(buyer_id=auth.uid() and exists (select 1 from public.vmarket_listings l where l.id=listing_id and l.status='active' and l.owner_id=seller_id and l.owner_id<>auth.uid()));
drop policy if exists vmarket_messages_select on public.vmarket_messages;
create policy vmarket_messages_select on public.vmarket_messages for select to authenticated using(exists(select 1 from public.vmarket_threads t where t.id=thread_id and (t.buyer_id=auth.uid() or t.seller_id=auth.uid())));
drop policy if exists vmarket_messages_insert on public.vmarket_messages;
create policy vmarket_messages_insert on public.vmarket_messages for insert to authenticated with check(sender_id=auth.uid() and exists(select 1 from public.vmarket_threads t where t.id=thread_id and (t.buyer_id=auth.uid() or t.seller_id=auth.uid())));
-- No client publication rights: all ads remain in pending_review until admin-approved.
-- No payment, ID verification, escrow or shipping automation in this release.
-- Supabase storage should use separate private bucket and signed/read-access rules before real user uploads.

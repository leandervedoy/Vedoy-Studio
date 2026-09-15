create table if not exists company_registrations (
  id text primary key,
  company_name text not null,
  organization_number text,
  owner_name text not null,
  owner_email text not null,
  owner_title text not null check (owner_title in ('owner','managing-director')),
  phone text,
  subscription_plan text not null check (subscription_plan in ('trial','start','team','plus')),
  seat_limit integer not null check (seat_limit between 1 and 100),
  invited_members jsonb not null default '[]'::jsonb,
  status text not null default 'received' check (status in ('received','reviewing','activated','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists company_registrations_status_created_idx on company_registrations (status, created_at desc);
alter table company_registrations enable row level security;

create table if not exists domain_email_orders (
  id text primary key,
  company_name text not null,
  contact_name text not null,
  contact_email text not null,
  phone text,
  domain text not null,
  domain_mode text not null check (domain_mode in ('new','transfer','existing')),
  mailbox_count integer not null check (mailbox_count between 0 and 100),
  requested_addresses jsonb not null default '[]'::jsonb,
  email_package text not null check (email_package in ('standard','none')),
  notes text,
  status text not null default 'received' check (status in ('received','reviewing','ordered','ready','needs-info','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists domain_email_orders_status_created_idx on domain_email_orders (status, created_at desc);
alter table domain_email_orders enable row level security;

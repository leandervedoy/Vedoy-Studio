-- Apply manually to the DATABASE_URL Postgres database before enabling checkout.
-- Never store provider credentials or operating-system passwords.
create table if not exists gigahost_hosting_orders (
  id uuid primary key,
  customer_name text not null,
  customer_email text not null,
  product_id integer not null,
  price_id integer not null,
  region_id integer not null,
  backups boolean not null default false,
  retail_monthly_nok integer not null check (retail_monthly_nok > 0),
  retail_setup_nok integer not null default 0 check (retail_setup_nok >= 0),
  supplier_monthly_nok numeric(12,2) not null check (supplier_monthly_nok > 0),
  status text not null default 'pending_checkout'
    check (status in ('pending_checkout','pending_payment','paid','provisioning','active','needs_review','cancelled','failed')),
  stripe_session_id text unique,
  stripe_subscription_id text,
  gigahost_order_id bigint unique,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists gigahost_hosting_orders_customer_idx on gigahost_hosting_orders(customer_email, created_at desc);
create unique index if not exists gigahost_hosting_orders_subscription_idx on gigahost_hosting_orders(stripe_subscription_id) where stripe_subscription_id is not null;
revoke all on gigahost_hosting_orders from public;

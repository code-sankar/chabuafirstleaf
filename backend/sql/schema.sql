-- ════════════════════════════════════════════════════════════════
-- Chabua First Leaf — Phase 3 schema additions
-- Run this in the Supabase SQL editor. Safe to re-run (idempotent).
-- ════════════════════════════════════════════════════════════════

-- ─── Orders: add breakdown + linkage columns ──────────────────────
alter table orders add column if not exists user_id uuid references auth.users(id);
alter table orders add column if not exists subtotal numeric(10,2);
alter table orders add column if not exists shipping numeric(10,2) default 0;
alter table orders add column if not exists tax numeric(10,2) default 0;
alter table orders add column if not exists currency text default 'INR';
alter table orders add column if not exists payment_method text;
alter table orders add column if not exists customer_phone text;
alter table orders add column if not exists estimated_delivery text;

-- created_at should already exist from the original table; ensure index for sort
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_email on orders(customer_email);
create index if not exists idx_orders_order_number on orders(order_number);

-- ─── Order items: snapshot product details at time of purchase ────
alter table order_items add column if not exists product_name text;
alter table order_items add column if not exists product_image text;
alter table order_items add column if not exists product_weight text;

create index if not exists idx_order_items_order_id on order_items(order_id);

-- ─── Payments: snapshot the cost breakdown at initiation time ─────
alter table payments add column if not exists order_id uuid references orders(id);
alter table payments add column if not exists subtotal_usd numeric(10,2);
alter table payments add column if not exists shipping_usd numeric(10,2);
alter table payments add column if not exists tax_usd numeric(10,2);
alter table payments add column if not exists total_usd numeric(10,2);

create index if not exists idx_payments_razorpay_order_id on payments(razorpay_order_id);

-- ─── Order number sequence (per-call, year is applied in app code) ─
create sequence if not exists order_number_seq start 1;

create or replace function get_next_order_seq_value()
returns bigint
language sql
as $$
  select nextval('order_number_seq');
$$;

-- ─── Addresses ─────────────────────────────────────────────────────
create table if not exists addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text,
  name        text not null,
  phone       text not null,
  address     text not null,
  city        text not null,
  state       text not null,
  postal_code text not null,
  country     text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_addresses_user_id on addresses(user_id);

-- Row Level Security: customers can only see/manage their own addresses.
-- The backend uses the service-role key (bypasses RLS) but enabling this
-- protects against any future direct-from-client Supabase usage.
alter table addresses enable row level security;

drop policy if exists "Users manage own addresses" on addresses;
create policy "Users manage own addresses"
  on addresses
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Shipping tracking ─────────────────────────────────────────────
create table if not exists shipping_tracking (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references orders(id) on delete cascade,
  tracking_number  text,
  tracking_url     text,
  carrier          text,
  shiprocket_shipment_id text,
  events           jsonb default '[]'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index if not exists idx_shipping_tracking_order_id on shipping_tracking(order_id);
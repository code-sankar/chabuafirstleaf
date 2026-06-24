-- ════════════════════════════════════════════════════════════════
-- Chabua First Leaf — base schema (the "original" Phase 1/2 tables)
-- Creates orders / order_items / payments.
-- RUN THIS FIRST, before schema.sql (Phase 3a). Idempotent.
--
-- These were assumed to "already exist" by every later migration but
-- were never committed as a file. Columns added by Phase 3a are NOT
-- declared here — that migration adds them with `add column if not
-- exists`, so the two files compose cleanly in either fresh or
-- partially-migrated databases.
-- ════════════════════════════════════════════════════════════════

-- ─── Orders ────────────────────────────────────────────────────────
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique,
  customer_name    text,
  customer_email   text,
  total_amount     numeric(10,2),
  status           text not null default 'Pending',
  shipping_address jsonb,
  created_at       timestamptz not null default now()
);

-- ─── Order items ───────────────────────────────────────────────────
-- product_id is plain text (matches products.id) and intentionally NOT
-- a foreign key: order history must survive a product being deleted.
-- Phase 3a adds product_name / product_image / product_weight snapshots
-- for the same reason.
create table if not exists order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid references orders(id) on delete cascade,
  product_id        text,
  quantity          integer not null default 1,
  price_at_purchase numeric(10,2),
  created_at        timestamptz not null default now()
);

-- ─── Payments ──────────────────────────────────────────────────────
-- Created at checkout initiation (status 'created'), updated to
-- 'captured' / 'failed' by /checkout/verify and the Razorpay webhook.
create table if not exists payments (
  id                  uuid primary key default gen_random_uuid(),
  razorpay_order_id   text,
  razorpay_payment_id text,
  razorpay_signature  text,
  amount_paid_paise   integer,
  status              text not null default 'created',
  notes               jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now()
);
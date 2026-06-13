-- ════════════════════════════════════════════════════════════════
-- Chabua First Leaf — Phase 3b schema additions
-- Run after Phase 3a's schema.sql. Idempotent.
-- ════════════════════════════════════════════════════════════════

-- ─── Refunds ───────────────────────────────────────────────────────
-- A single payment can have multiple partial refunds, so this is its
-- own table rather than columns on the payments table.

create table if not exists refunds (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete cascade,
  payment_id          uuid references payments(id),
  razorpay_refund_id  text unique,
  razorpay_payment_id text,
  amount_paise        integer not null,
  reason              text,
  status              text not null default 'pending', -- pending | processed | failed
  notes               jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  processed_at        timestamptz
);

create index if not exists idx_refunds_order_id on refunds(order_id);
create index if not exists idx_refunds_razorpay_payment_id on refunds(razorpay_payment_id);
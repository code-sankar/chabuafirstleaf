-- ════════════════════════════════════════════════════════════════
-- Chabua First Leaf — waitlist subscribers
-- Standalone; no dependency on the other migrations. Idempotent.
--
-- Backs the home-page waitlist form (POST /api/subscribers/subscribe)
-- and the admin Waitlist Vault.
-- ════════════════════════════════════════════════════════════════

create table if not exists subscribers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_subscribers_created_at on subscribers(created_at desc);

-- The waitlist is private: reads and writes flow only through the
-- service-role backend, so RLS is enabled with no public policy at all.
alter table subscribers enable row level security;

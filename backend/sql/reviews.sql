-- ════════════════════════════════════════════════════════════════
-- Chabua First Leaf — product ratings & reviews
-- Run after products.sql and schema-base.sql. Idempotent.
--
-- One review per patron per reserve, enforced by a unique index.
-- Aggregates (rating_average / rating_count) are denormalised onto
-- the products table by a trigger so the catalogue grid can render
-- stars without a second round trip.
-- ════════════════════════════════════════════════════════════════

create table if not exists product_reviews (
  id                uuid primary key default gen_random_uuid(),
  product_id        text not null references products(id) on delete cascade,
  user_id           uuid references auth.users(id) on delete set null,
  author_name       text not null,
  author_email      text,
  rating            smallint not null check (rating between 1 and 5),
  title             text,
  body              text not null,
  verified_purchase boolean not null default false,
  status            text not null default 'published'
                      check (status in ('published', 'hidden')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_product_reviews_product
  on product_reviews(product_id, created_at desc);
create index if not exists idx_product_reviews_user
  on product_reviews(user_id);

-- One review per signed-in patron per product. Partial, so historical
-- rows with a null user_id (deleted accounts) never collide.
create unique index if not exists idx_product_reviews_one_per_patron
  on product_reviews(product_id, user_id)
  where user_id is not null;

-- Public read of published reviews only. Writes flow through the
-- service-role backend (which bypasses RLS), so no write policy.
alter table product_reviews enable row level security;
drop policy if exists "Public read published reviews" on product_reviews;
create policy "Public read published reviews"
  on product_reviews for select using (status = 'published');

-- ─── Denormalised aggregates on products ──────────────────────────
alter table products add column if not exists rating_average numeric(3,2) not null default 0;
alter table products add column if not exists rating_count   integer      not null default 0;

create or replace function refresh_product_rating()
returns trigger
language plpgsql
as $$
declare
  pid text;
begin
  -- On update the product_id never changes in practice, but coalescing
  -- both tuples keeps the trigger correct if it ever does.
  pid := coalesce(new.product_id, old.product_id);

  update products p
  set
    rating_average = coalesce((
      select round(avg(r.rating)::numeric, 2)
      from product_reviews r
      where r.product_id = pid and r.status = 'published'
    ), 0),
    rating_count = (
      select count(*)
      from product_reviews r
      where r.product_id = pid and r.status = 'published'
    )
  where p.id = pid;

  return null;
end;
$$;

drop trigger if exists trg_product_reviews_aggregate on product_reviews;
create trigger trg_product_reviews_aggregate
after insert or update or delete on product_reviews
for each row execute function refresh_product_rating();

-- ─── Backfill (safe to re-run; syncs any pre-existing rows) ────────
update products p
set
  rating_average = coalesce((
    select round(avg(r.rating)::numeric, 2)
    from product_reviews r
    where r.product_id = p.id and r.status = 'published'
  ), 0),
  rating_count = (
    select count(*)
    from product_reviews r
    where r.product_id = p.id and r.status = 'published'
  );

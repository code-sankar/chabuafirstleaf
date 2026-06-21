-- ════════════════════════════════════════════════════════════════
-- Chabua First Leaf — products catalogue
-- ════════════════════════════════════════════════════════════════

create table if not exists products (
  id              text primary key,
  name            text not null,
  slug            text unique not null,
  tagline         text,
  price           numeric(10,2) not null,
  currency        text not null default 'USD',
  weight          text,
  sku             text unique,
  story           text,
  tasting_notes   jsonb default '[]'::jsonb,
  brewing_notes   jsonb default '{}'::jsonb,
  images          jsonb default '[]'::jsonb,
  inventory_count integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists idx_products_slug on products(slug);

-- Public catalogue: anyone may read. Writes go only through the
-- service-role backend (which bypasses RLS), so no write policy needed.
alter table products enable row level security;
drop policy if exists "Public read products" on products;
create policy "Public read products" on products for select using (true);

-- ─── Seed (mirrors the former hardcoded store seed) ───────────────
insert into products (id, name, slug, tagline, price, currency, weight, sku, story, tasting_notes, brewing_notes, images, inventory_count) values
(
  'prod_orthodox_gold', 'Assam Orthodox Gold', 'assam-orthodox-gold', 'The Imperial Standard',
  180.00, 'USD', '100g', 'CFL-001-GOLD',
  'Harvested during the absolute peak of the second flush cycle, this selection is composed almost entirely of downy, golden tips. It delivers an incredibly rich, amber liquor characterized by a profound malt density and delicate natural cacao undertones.',
  '["Rich Malt","Sun-Dried Raisin","Dark Honey"]'::jsonb,
  '{"temp":"95°C","time":"4-5 Mins","ratio":"2.5g / 200ml"}'::jsonb,
  '["https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=1200","https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&q=80&w=1200","https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=1200"]'::jsonb,
  60
),
(
  'prod_chabua_clonal', 'Chabua Clonal Imperial', 'chabua-clonal-imperial', 'The Artisan Micro-Lot',
  210.00, 'USD', '100g', 'CFL-002-CLONAL',
  'Culled from our oldest single-estate clonal plots, this reserve represents an unblended expression of pure terroir. It undergoes a slow, 18-hour ambient nocturnal wither to lock in high concentrations of volatile floral aromatic compounds.',
  '["Orchid Blossom","Toasted Walnut","Muscatel"]'::jsonb,
  '{"temp":"90°C","time":"3-4 Mins","ratio":"2g / 200ml"}'::jsonb,
  '["https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&q=80&w=1200","https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&q=80&w=1200","https://images.unsplash.com/photo-1464254786740-b97e5420c299?auto=format&fit=crop&q=80&w=1200"]'::jsonb,
  45
),
(
  'prod_reserve_tippy', 'Tippy Golden Flowery Orange Pekoe', 'tippy-gfop', 'The Connoisseur''s Selection',
  245.00, 'USD', '75g', 'CFL-003-TGFOP',
  'An ultra-exclusive harvest comprising solely the downy vegetative terminal buds. Plucked by hand during a three-day seasonal window, it yields an incredibly bright, golden-hued cup with zero astringency and a creamy, velvet-like body.',
  '["Honeyed Apricot","Marzipan","Cream"]'::jsonb,
  '{"temp":"90°C","time":"3 Mins","ratio":"2g / 200ml"}'::jsonb,
  '["https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=1200","https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&q=80&w=1200"]'::jsonb,
  20
)
on conflict (id) do nothing;
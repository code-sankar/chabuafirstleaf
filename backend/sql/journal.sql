-- ════════════════════════════════════════════════════════════════
-- Chabua First Leaf — journal posts
-- ════════════════════════════════════════════════════════════════

create table if not exists journal_posts (
  id            text primary key,
  slug          text unique not null,
  tag           text,
  title         text not null,
  excerpt       text,
  date_label    text,                          -- display string e.g. "May 2026"
  image         text,
  featured      boolean not null default false,
  subtitle      text,
  read_time     text,
  content       jsonb default '[]'::jsonb,      -- [{ type: "paragraph"|"heading", text }]
  related_slugs jsonb default '[]'::jsonb,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists idx_journal_slug on journal_posts(slug);
create index if not exists idx_journal_published on journal_posts(published_at desc);

alter table journal_posts enable row level security;
drop policy if exists "Public read journal" on journal_posts;
create policy "Public read journal" on journal_posts for select using (true);

-- ─── Seed: list metadata for the six existing posts ───────────────
insert into journal_posts (id, slug, tag, title, excerpt, date_label, image, featured, published_at) values
('post_01','genesis-camellia-assamica','Heritage Account','The Genesis of Camellia Assamica: Deep in the Chabua Basin','An historical investigation into the pristine 1830s expeditions, revealing the tribal heritage and rare soil chemistry that forged the identity of India''s foundational orthodox tea strain.','May 2026','https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=1200',true,'2026-05-01'),
('post_02','thermal-calibration-infusions','Technical Ritual','The Physics of Thermal Calibration in Wholistic Infusions','How structural changes in temperature alter molecular cell rupture, and why cooling spring water down to exactly 92°C saves delicate honey aromatics.','April 2026','https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800',false,'2026-04-01'),
('post_03','nocturnal-aeration-withering','Estate Chronicles','Nocturnal Aeration: The Chemistry Behind Small-Batch Withering','An inside look into our 18-hour nocturnal bamboo drying frameworks, where humidity variables are monitored to reduce moisture down to fractional margins.','March 2026','https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&q=80&w=800',false,'2026-03-01'),
('post_04','singpho-tribe-tea-origins','Heritage Account','The Singpho Connection: Indigenous Custodians of Assam Tea','Long before the British arrived, the Singpho tribe of Upper Assam cultivated and consumed wild tea in rituals and daily life — a story seldom told in the global narrative.','February 2026','https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&q=80&w=800',false,'2026-02-01'),
('post_05','second-flush-season','Estate Chronicles','Second Flush Season: The Peak of Assam Orthodox Production','Between May and June, Assam''s tea gardens produce their most distinctive, full-bodied leaves. We document the harvest cycle from bud to sealed tin.','January 2026','https://images.unsplash.com/photo-1464254786740-b97e5420c299?auto=format&fit=crop&q=80&w=800',false,'2026-01-01'),
('post_06','gaiwan-versus-teapot','Technical Ritual','Gaiwan vs. Teapot: Which Vessel Reveals More in Assam Orthodox?','A side-by-side comparative steeping analysis examining how vessel material, volume, and pour dynamics alter the extraction profile of our Assam Orthodox Gold.','December 2025','https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=800',false,'2025-12-01')
on conflict (id) do nothing;
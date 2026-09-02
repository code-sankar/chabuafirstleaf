<div align="center">

# Chabua First Leaf

**_Where India's Tea Story Began_**

A luxury single-origin Assam tea house, built for a global audience.

`React 19` · `Vite` · `Node.js` · `Express` · `Supabase` · `Razorpay` · `Shiprocket` · `Resend`

</div>

---

## Overview

Chabua First Leaf is a heritage-led, single-origin tea brand originating from Chabua, Assam — the birthplace of India's commercial tea industry. This repository contains the full-stack e-commerce platform: a React storefront and a Node/Express commerce API, engineered to present the brand as a world-class luxury house (in the spirit of Mariage Frères and Fortnum & Mason) rather than a conventional online store.

The platform serves primary markets in the **United Kingdom, United States, UAE, and Europe**, with a secondary focus on premium domestic Indian consumers.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Database Migrations](#database-migrations)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [SEO & Prerendering](#seo--prerendering)
- [Security Model](#security-model)
- [Deployment](#deployment)
- [Brand & Design System](#brand--design-system)
- [Pre-Launch Checklist](#pre-launch-checklist)
- [License](#license)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Framer Motion, React Router 7, react-helmet-async |
| Styling | Tailwind CSS |
| Backend | Node.js, Express |
| Database / Auth | Supabase (PostgreSQL) |
| Payments | Razorpay (USD pricing, INR settlement) |
| Fulfillment | Shiprocket |
| Transactional Email | Resend |
| Business Email | Zoho Mail |
| Frontend Hosting | Cloudflare Pages |
| Backend Hosting | Railway |
| CDN / DNS / Domain | Cloudflare (`chabuafirstleaf.com`) |
| CI/CD | GitHub Actions |
| SEO Prerendering | Puppeteer |

## Architecture

The project is a monorepo with two independently deployed applications:

- **Storefront** — a React 19 + Vite single-page application served from Cloudflare Pages. Product, journal, and static routes are prerendered to static HTML at build time via Puppeteer for search-engine visibility and fast first paint.
- **Commerce API** — a Node.js + Express service on Railway that owns all sensitive operations: payment order creation and verification, inventory management, fulfillment, and email dispatch. The backend directory is the Railway service root.
- **Data & Auth** — Supabase provides the PostgreSQL database and authentication. Row-Level Security is enforced on all transactional tables, and mutating stock operations run through an atomic Postgres RPC to eliminate oversell race conditions.

```
Browser ──▶ Cloudflare Pages (React SPA, prerendered)
                     │
                     ▼
             Express API (Railway)
             ├── Razorpay  (payment order + HMAC verification)
             ├── Supabase  (orders, inventory RPC, RLS)
             ├── Shiprocket (fulfillment + tracking webhooks)
             └── Resend    (transactional email)
```

## Repository Structure

```
chabua-first-leaf/
├── backend/                # Node.js + Express API (Railway service root)
│   ├── src/
│   │   ├── routes/         # Payments, orders, webhooks, admin
│   │   ├── middleware/     # requireAdmin, auth, validation
│   │   ├── services/       # Razorpay, Shiprocket, Resend, Supabase
│   │   └── db/             # RPCs, rls-lockdown.sql
│   └── package.json
├── src/                    # React 19 storefront
│   ├── components/         # Reusable UI (buttons, layout, product cards)
│   ├── pages/              # Home, ProductDetail, JournalPost, NotFound
│   ├── lib/                # Supabase client, API client, helpers
│   └── App.jsx             # Routing
├── scripts/
│   └── prerender.js        # Puppeteer SEO prerendering
├── public/
│   └── sitemap.xml
└── package.json
```

## Prerequisites

- **Node.js** 20 LTS or newer
- **npm** 10+
- Accounts/keys for Supabase, Razorpay, Shiprocket, and Resend
- Chrome/Chromium available for Puppeteer prerendering (installed automatically in CI)

## Getting Started

Clone and install both applications:

```bash
git clone https://github.com/<your-org>/chabua-first-leaf.git
cd chabua-first-leaf

# Storefront
npm install

# Commerce API
cd backend
npm install
cd ..
```

Run locally in two terminals:

```bash
# Terminal 1 — API
cd backend
npm run dev

# Terminal 2 — Storefront
npm run dev
```

The storefront runs on Vite's dev server (default `http://localhost:5173`) and proxies API calls to the Express backend.

## Database Migrations

The SQL in `backend/sql/` is applied by hand in the Supabase SQL editor. Every file is idempotent and safe to re-run, but they are order-dependent — later files assume the tables earlier ones create:

| Order | File | Creates |
|---|---|---|
| 1 | `schema-base.sql` | `orders`, `order_items`, `payments` |
| 2 | `schema.sql` | Phase 3 columns, `addresses`, `shipping_tracking`, order-number sequence |
| 3 | `schema-3b.sql` | `refunds` |
| 4 | `products.sql` | `products` catalogue + seed |
| 5 | `journal.sql` | `journal_posts` + seed |
| 6 | `inventory.sql` | `decrement_product_inventory` RPC |
| 7 | `reviews.sql` | `product_reviews`, plus `products.rating_average` / `rating_count` and the trigger that maintains them |

Until `reviews.sql` is applied, the storefront's ratings section renders its empty state rather than failing — but no impression can be recorded.

## Environment Variables

Never commit secrets. Set these in `.env` locally, and in Railway, Cloudflare Pages, and GitHub Actions secrets for deployment.

**Storefront** (`.env`, exposed to the browser — public keys only):

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_API_BASE_URL=https://<railway-app>.up.railway.app
VITE_RAZORPAY_KEY_ID=rzp_live_...
```

**Commerce API** (`backend/.env`, server-side secrets):

```
SUPABASE_URL=https://<project>.supabase.co     # base domain only, no trailing slash or path
SUPABASE_SECRET_KEY=sb_secret_...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
SHIPROCKET_EMAIL=...
SHIPROCKET_PASSWORD=...
RESEND_API_KEY=re_...
FRONTEND_URL=https://chabuafirstleaf.com
```

> The `sb_publishable_` key ships in the frontend bundle by design — which is exactly why Row-Level Security is mandatory on every sensitive table. See [Security Model](#security-model).

## Scripts

**Storefront**

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Standard production build |
| `npm run build:seo` | Production build **with** Puppeteer prerendering — **use this for deployment** |
| `npm run preview` | Preview the production build locally |

**Commerce API**

| Script | Purpose |
|---|---|
| `npm run dev` | Start Express with hot reload |
| `npm start` | Start Express in production |

## SEO & Prerendering

The storefront prerenders routes to static HTML at build time so that crawlers receive fully populated markup, not an empty SPA shell.

- Meta tags and titles are managed per-page with `react-helmet-async`.
- **Dynamic routes must be registered in two places** — the sitemap generator *and* the prerender route list — or product and journal pages will be silently excluded from SEO output. This is the single most common regression; verify both when adding a new dynamic route type.
- The production deploy command is `npm run build:seo`.

## Security Model

Commerce integrity rests on four guarantees, all of which must remain intact:

1. **HMAC payment verification** — Razorpay signatures are verified server-side before any order is fulfilled. The frontend is never trusted to confirm payment.
2. **Atomic inventory** — stock is decremented through a `SELECT ... FOR UPDATE` Postgres RPC (`decrement_product_inventory`), not a read-modify-write, preventing oversell under concurrent checkout.
3. **Idempotent webhooks** — Razorpay and Shiprocket webhooks are safe to retry; duplicate deliveries do not double-process orders.
4. **Row-Level Security everywhere** — RLS is enabled on `orders`, `order_items`, `payments`, `subscribers`, `refunds`, and `shipping_tracking`. `products`, `journal_posts`, and `product_reviews` are publicly readable by policy (reviews only while published) and writable only through the service-role backend. The `requireAdmin` middleware guards every admin route, and the admin gate fails closed in production. The lockdown policy lives in `backend/src/db/rls-lockdown.sql`.

## Deployment

- **Storefront → Cloudflare Pages**
  - Build command: `npm run build:seo`
  - Security headers and caching are managed at the Cloudflare edge.
- **Commerce API → Railway**
  - Service root: `backend/`
  - All server-side environment variables configured in the Railway dashboard.
- **CI/CD → GitHub Actions**, deploying to Cloudflare via `wrangler-action`.
- **Domain & DNS → Cloudflare Registrar** (`chabuafirstleaf.com`), including SPF/DKIM/DMARC records for Resend and Zoho Mail.

## Brand & Design System

The experience is intentionally quiet. Luxury brands speak less: generous whitespace, one clear action per view, restrained motion, and mobile-first layout throughout.

**Palette**

| Token | Hex | Use |
|---|---|---|
| Primary | `#0F2E25` | Deep estate green — surfaces, headers |
| Secondary | `#F5F0E6` | Warm ivory — backgrounds |
| Accent | `#C8A96B` | Aged gold — highlights, fine detail |
| Text | `#1D1D1D` | Body copy |

**Typography**

- Headings — *Cormorant Garamond*
- Body — *Inter*

**Voice** — sophisticated, timeless, heritage-focused. Favor language like *heritage, legacy, origin, craftsmanship, single-origin, small-batch, curated*. Avoid hype, discount-led messaging, and pushy sales copy.

**Avoid** — bright colors, generic e-commerce layouts, clutter, and excessive animation.

## Pre-Launch Checklist

- [ ] Apply pending SEO wiring on `ProductDetail.jsx`, `JournalPost.jsx`, `NotFound.jsx`, and routing in `App.jsx`
- [ ] Fill all legal pages — Privacy Policy, Terms of Service, Shipping Policy, Returns Policy
- [ ] Apply every migration in `backend/sql/` in order — including `reviews.sql`, without which ratings cannot be recorded
- [ ] Confirm RLS is enabled on all sensitive tables (`rls-lockdown.sql`)
- [ ] Verify all environment variables on Railway, Cloudflare Pages, and GitHub secrets
- [ ] Set the deploy build command to `npm run build:seo`
- [ ] Complete one live end-to-end test transaction in production
- [ ] Razorpay KYC and international payments activated
- [ ] Resend domain verified (SPF/DKIM); Zoho Mail DNS configured

## License

Proprietary — © Chabua First Leaf. All rights reserved.

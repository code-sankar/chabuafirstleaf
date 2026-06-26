/**
 * Shared route source of truth for prerender + sitemap.
 *
 *   STATIC_ROUTES     — data-independent, indexable pages. Prerendered AND
 *                       listed in the sitemap.
 *   getDynamicRoutes  — product + journal slugs, pulled from Supabase at
 *                       build time. Used by BOTH the sitemap and prerender.
 *
 * Deliberately excluded everywhere: /account/*, /admin, /checkout, /login,
 * /signup, /forgot-password, /reset-password — none should be indexed.
 *
 * Build-env requirements (set these wherever `build:seo` runs):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */

export const STATIC_ROUTES = [
  '/',
  '/our-story',
  '/collection',
  '/journal',
  '/track',
  '/privacy',
  '/terms',
  '/shipping',
  '/returns',
];

export async function getDynamicRoutes() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  // No credentials → skip dynamic routes but don't kill the build.
  // (Lets you build static-only previews without DB access.)
  if (!url || !anonKey) {
    console.warn(
      '[routes] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — ' +
      'skipping product & journal slugs. Static routes only.'
    );
    return [];
  }

  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(url, anonKey);

  // Credentials ARE present, so a query failure is a real error — throw,
  // don't silently ship a sitemap missing every product page.
  const [{ data: products, error: pErr }, { data: posts, error: jErr }] =
    await Promise.all([
      sb.from('products').select('slug'),
      sb.from('journal_posts').select('slug').not('published_at', 'is', null),
    ]);

  if (pErr) throw new Error(`[routes] products query failed: ${pErr.message}`);
  if (jErr) throw new Error(`[routes] journal_posts query failed: ${jErr.message}`);

  const productRoutes = (products ?? [])
    .filter((p) => p.slug)
    .map((p) => `/product/${p.slug}`);

  const journalRoutes = (posts ?? [])
    .filter((p) => p.slug)
    .map((p) => `/journal/${p.slug}`);

  return [...productRoutes, ...journalRoutes];
}
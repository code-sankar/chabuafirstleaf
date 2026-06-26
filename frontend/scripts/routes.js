/**
 * Shared route source of truth for prerender + sitemap.
 *
 *   STATIC_ROUTES     — data-independent, indexable pages. Prerendered AND
 *                       listed in the sitemap.
 *   getDynamicRoutes  — product / journal slugs. Off by default; enable the
 *                       Supabase block to include them in the sitemap (and,
 *                       if you wish, the prerender).
 *
 * Deliberately excluded everywhere: /account/*, /admin, /checkout, /login,
 * /signup, /forgot-password, /reset-password — none should be indexed.
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
  // Default: nothing. Uncomment to enumerate product + journal slugs.
  // Requires VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in the build env.
  //
  // const { createClient } = await import('@supabase/supabase-js');
  // const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  // const { data: products } = await sb.from('products').select('slug');
  // return (products ?? []).map((p) => `/product/${p.slug}`);

  return [];
}
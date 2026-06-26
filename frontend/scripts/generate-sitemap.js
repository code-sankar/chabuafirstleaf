/**
 * Sitemap generator — runs after `vite build`, writes dist/sitemap.xml.
 *
 * Lists every indexable URL (static + any dynamic slugs from routes.js).
 * Note: pages don't need to be prerendered to belong in the sitemap —
 * Google renders CSR pages too — so dynamic routes can be listed here even
 * if you skip prerendering them.
 */
import { STATIC_ROUTES, getDynamicRoutes } from './routes.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFile } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const ORIGIN = (process.env.VITE_SITE_URL || 'https://chabuafirstleaf.com').replace(/\/$/, '');
const lastmod = new Date().toISOString().split('T')[0];

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function urlEntry(path) {
  const loc = esc(`${ORIGIN}${path === '/' ? '' : path}`);
  const priority = path === '/' ? '1.0' : '0.7';
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
}

async function run() {
  const dynamic = await getDynamicRoutes();
  const unique = [...new Set([...STATIC_ROUTES, ...dynamic])];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    unique.map(urlEntry).join('\n') +
    `\n</urlset>\n`;

  await writeFile(join(DIST, 'sitemap.xml'), xml, 'utf8');
  console.log(`[sitemap] wrote ${unique.length} urls -> dist/sitemap.xml (origin ${ORIGIN})`);
}

run().catch((err) => { console.error('[sitemap] failed:', err); process.exit(1); });
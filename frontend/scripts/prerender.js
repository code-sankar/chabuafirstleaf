/**
 * Static prerender — runs after `vite build`.
 *
 * Boots `vite preview` against dist/, drives a headless browser to every
 * route (static + product/journal slugs), lets the app + react-helmet-async
 * render, then writes the resulting HTML to dist/<route>/index.html.
 *
 * Result: crawlers and link-preview scrapers that don't run JS receive real
 * content and correct per-route OG/meta tags. Real users still boot the full
 * SPA after first paint.
 *
 * A static-route failure is fatal (those pages must exist). A dynamic-route
 * failure is logged but non-fatal — one bad slug shouldn't break a deploy.
 */
import { preview } from 'vite';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { STATIC_ROUTES, getDynamicRoutes } from './routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = 4173;

async function renderRoute(browser, route) {
  const page = await browser.newPage();
  try {
    // Tall viewport so more framer-motion `whileInView` sections reveal.
    await page.setViewport({ width: 1280, height: 2000 });

    const url = `http://localhost:${PORT}${route}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 400)); // let helmet + paint settle

    const html = await page.content();
    const outDir = route === '/' ? DIST : join(DIST, route);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'index.html'), html, 'utf8');

    console.log(`[prerender] ${route} -> ${join(outDir, 'index.html').replace(DIST, 'dist')}`);
  } finally {
    await page.close();
  }
}

async function run() {
  const dynamicRoutes = await getDynamicRoutes();
  console.log(
    `[prerender] ${STATIC_ROUTES.length} static + ${dynamicRoutes.length} dynamic routes`
  );

  const server = await preview({ preview: { port: PORT, strictPort: true } });
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const dynamicFailures = [];

  try {
    // Static routes — failure here is fatal.
    for (const route of STATIC_ROUTES) {
      await renderRoute(browser, route);
    }

    // Dynamic routes — failure here is logged, not fatal.
    for (const route of dynamicRoutes) {
      try {
        await renderRoute(browser, route);
      } catch (err) {
        console.warn(`[prerender] dynamic route failed: ${route} — ${err.message}`);
        dynamicFailures.push(route);
      }
    }
  } finally {
    await browser.close();
    server.httpServer.close();
  }

  if (dynamicFailures.length > 0) {
    console.warn(`[prerender] ${dynamicFailures.length} dynamic route(s) skipped.`);
  }
}

run().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
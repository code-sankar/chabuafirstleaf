/**
 * Static prerender — runs after `vite build`.
 *
 * Boots `vite preview` against dist/, drives a headless browser to each
 * static route, lets the app + react-helmet-async render, then writes the
 * resulting HTML to dist/<route>/index.html.
 *
 * Result: crawlers and link-preview scrapers (WhatsApp, iMessage, LinkedIn,
 * Slack) that don't run JS receive real content and correct per-route OG/meta
 * tags. Real users still boot the full SPA after first paint.
 *
 * NOTE: dynamic routes (/product/:slug, /journal/:slug) are NOT covered here —
 * they need their slugs enumerated first. See the commented block at the bottom.
 */
import { preview } from 'vite';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { STATIC_ROUTES as ROUTES } from './routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = 4173;


async function run() {
  const server = await preview({ preview: { port: PORT, strictPort: true } });
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
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
      await page.close();
    }
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

run().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
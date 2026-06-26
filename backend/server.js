import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import apiRouter from './src/routes/api.routes.js';
import webhooksRouter from './src/routes/webhooks.routes.js';
import { globalErrorHandler } from './src/middleware/error.middleware.js';
import { initializeFxService } from './src/services/fx.service.js';
import { generalLimiter } from './src/middleware/rateLimit.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

/* ─── Trust proxy ──────────────────────────────────────────────────
   Behind Nginx / Vercel / Render, read the real client IP from
   X-Forwarded-For so express-rate-limit keys on the visitor, not the
   load balancer. */
app.set('trust proxy', 1);

/* ─── Security headers (helmet) ────────────────────────────────────
   Sends X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.
   as real HTTP headers — the things meta tags cannot do. */
app.use(helmet({
  // Our media/og images are served cross-origin to the SPA; relax this
  // one policy so they aren't blocked. Tighten if you self-host all assets.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
if (isProduction) {
  // HSTS is only meaningful over HTTPS — enable in production only.
  app.use(helmet.hsts({ maxAge: 15552000, includeSubDomains: true, preload: true }));
}

/* ─── CORS — explicit allow-list ───────────────────────────────────
   FRONTEND_URL may be a comma-separated list, e.g.
     FRONTEND_URL=https://chabuafirstleaf.com,https://www.chabuafirstleaf.com
   Requests with no Origin (server-to-server, curl, health checks) pass. */
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin '${origin}' is not permitted by CORS policy.`));
  },
  credentials: true,
}));

/* ─── Webhooks — raw body required for HMAC verification ────────────
   Mounted BEFORE express.json() so req.body is a Buffer for these
   routes only, and BEFORE the /api limiter so Razorpay is never
   rate-limited. */
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);

/* ─── Standard parsers (with sane body size caps) ──────────────────── */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/* ─── Static media if any ──────────────────────────────────────────── */
app.use('/uploads', express.static('uploads'));

/* ─── Health check (uptime monitors / platform probes) ─────────────── */
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

/* ─── Primary API gateway (general limiter across all /api routes) ──── */
app.use('/api', generalLimiter, apiRouter);

/* ─── 404 fallback ─────────────────────────────────────────────────── */
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Resource pathway '${req.originalUrl}' inside our vintage reserves is undefined.`));
});

/* ─── Global error interceptor ─────────────────────────────────────── */
app.use(globalErrorHandler);

/* ─── Boot (single listen) ─────────────────────────────────────────── */
app.listen(PORT, () => {
  initializeFxService();
  console.log(`[Chabua Core Server]: Handshake active on port ${PORT}`);
});
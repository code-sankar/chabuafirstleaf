import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './src/routes/api.routes.js';
import webhooksRouter from './src/routes/webhooks.routes.js';
import { globalErrorHandler } from './src/middleware/error.middleware.js';
import { initializeFxService } from './src/services/fx.service.js';
import { generalLimiter } from './src/middleware/rateLimit.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ─── Trust proxy ──────────────────────────────────────────────────
   When deployed behind a reverse proxy (Nginx / Vercel / Render),
   tells Express to read the real client IP from X-Forwarded-For.
   Required for express-rate-limit to limit correctly per real IP. */
app.set('trust proxy', 1);

/* ─── CORS ─────────────────────────────────────────────────────── */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

/* ─── Webhooks — raw body required for HMAC signature verification
   Mounted BEFORE express.json() so req.body is a Buffer for these
   routes only. All other /api routes get parsed JSON normally. ─── */
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);

/* ─── Standard parsers for all other routes ────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─── Static media if any ──────────────────────────────────────── */
app.use('/uploads', express.static('uploads'));

/* ─── Primary API gateway ──────────────────────────────────────── */
app.use('/api', apiRouter);

/* ─── 404 fallback ─────────────────────────────────────────────── */
app.use((req, res, next) => {
  const error = new Error(`Resource pathway '${req.originalUrl}' inside our vintage reserves is undefined.`);
  res.status(404);
  next(error);
});

/* ─── Global error interceptor ─────────────────────────────────── */
app.use(globalErrorHandler);

/* ─── Boot ─────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  // Kick off the live-FX cache once the server is listening
  initializeFxService();
  console.log(`[Chabua Core Server]: Handshake active across secure link portal port:${PORT}`);
});

app.use('/api', generalLimiter, apiRouter); 

/* ─── 404 fallback ─────────────────────────────────────────────── */
app.use((req, res, next) => {
  const error = new Error(`Resource pathway '${req.originalUrl}' inside our vintage reserves is undefined.`);
  res.status(404);
  next(error);
});

/* ─── Global error interceptor ─────────────────────────────────── */
app.use(globalErrorHandler);

/* ─── Boot ─────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  initializeFxService();
  console.log(`[Chabua Core Server]: Handshake active across secure link portal port:${PORT}`);
});
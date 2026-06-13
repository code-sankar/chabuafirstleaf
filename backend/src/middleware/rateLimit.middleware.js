import rateLimit from 'express-rate-limit';

/**
 * Rate limiters — applied as route-level middleware.
 *
 *   - checkoutLimiter: prevents order spam (and Razorpay quota burn)
 *   - trackLimiter: prevents order-number enumeration attacks
 *   - generalLimiter: a wide safety net for all other /api/* routes
 *
 * Limits are per IP. For production behind a reverse proxy, set
 * app.set('trust proxy', 1) in server.js so the limiter sees the
 * client's real IP rather than the load balancer's.
 */

export const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // 8 checkout initiations per IP per window — generous for legitimate retry
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many checkout attempts from this address. Please wait a few minutes before trying again.',
  },
});

export const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 lookups per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many tracking lookups. Please wait a few minutes before trying again.',
  },
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // safety net — well above normal browsing patterns
  standardHeaders: true,
  legacyHeaders: false,
});
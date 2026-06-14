import { supabase } from '../config/supabase.js';

/**
 * Auth middleware
 *
 *   - requireAuth   : protected customer routes (orders, addresses)
 *   - optionalAuth  : guest-friendly routes (checkout)
 *   - requireAdmin  : admin-only routes (refunds, customers, status updates)
 *
 * All three pull the bearer token from Authorization, validate it via
 * Supabase, and attach `req.user`. `requireAdmin` additionally checks
 * the user's email against the ADMIN_EMAILS allow-list (comma-separated
 * in your backend .env — mirrors the frontend's VITE_ADMIN_EMAILS).
 */

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
}

/**
 * Reads ADMIN_EMAILS from the environment and returns a lowercased Set.
 * Computed fresh each call so reading the env at runtime always works,
 * but cheap enough not to matter.
 */
function getAdminEmailSet() {
  const raw = process.env.ADMIN_EMAILS || '';
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

/* ─── requireAuth ───────────────────────────────────────────── */
export async function requireAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ success: false, error: 'Your session has expired. Please sign in again.' });
  }

  req.user = data.user;
  next();
}

/* ─── optionalAuth ─────────────────────────────────────────── */
export async function optionalAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  const { data } = await supabase.auth.getUser(token);
  req.user = data?.user || null;
  next();
}

/* ─── requireAdmin ─────────────────────────────────────────── */
/**
 * Three checks, in order, with distinct status codes so the frontend
 * can show the right message:
 *
 *   401 — no token / invalid token (sign in or session expired)
 *   503 — ADMIN_EMAILS is not configured on the server (deploy issue)
 *   403 — valid user, but not on the admin allow-list (insufficient privileges)
 *
 * The 503 vs 403 distinction matters operationally: a 503 means "fix
 * your env"; a 403 means "this user isn't supposed to be here."
 *
 * TODO (future): when the team grows, swap the env-var allow-list for
 * an `admin_users` table that supports roles (e.g. super_admin, ops,
 * support). The middleware's interface stays the same.
 */
export async function requireAdmin(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ success: false, error: 'Your session has expired. Please sign in again.' });
  }

  const adminSet = getAdminEmailSet();
  if (adminSet.size === 0) {
    console.error('[Auth] ADMIN_EMAILS is not configured — refusing all admin access.');
    return res.status(503).json({ success: false, error: 'Admin gateway is not configured.' });
  }

  const userEmail = (data.user.email || '').toLowerCase();
  if (!adminSet.has(userEmail)) {
    console.warn(`[Auth] Non-admin user attempted admin access: ${userEmail || '<unknown>'}`);
    return res.status(403).json({ success: false, error: 'You do not have admin privileges.' });
  }

  req.user = data.user;
  req.isAdmin = true;
  next();
}
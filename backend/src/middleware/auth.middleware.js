import { supabase } from '../config/supabase.js';

/**
 * Auth middleware
 *
 * The frontend's `api.js` interceptor attaches the Supabase access token
 * as `Authorization: Bearer <token>` on every request when the customer
 * is signed in. Because our Supabase client here is initialized with the
 * SERVICE ROLE key, `supabase.auth.getUser(token)` can validate any
 * user's token and return their identity.
 */

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
}

/**
 * requireAuth — for routes that must have a signed-in customer.
 * Responds 401 if no valid token is present.
 */
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

/**
 * optionalAuth — for routes that work for guests AND signed-in customers
 * (e.g. checkout). If a valid token is present, req.user is populated;
 * otherwise req.user is null and the request proceeds as a guest.
 */
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
import { supabase } from '../config/supabase.js';
import { isAdminEmail } from '../middleware/auth.middleware.js';

/**
 * Product ratings & reviews.
 *
 * Public reads return only 'published' rows and never expose the
 * reviewer's email or user_id. Writes require a signed-in patron —
 * one review per patron per reserve, enforced by a unique index —
 * and the 'verified purchase' badge is derived server-side from the
 * order ledger, never trusted from the client.
 */

const RATING_VALUES = [5, 4, 3, 2, 1];
const MAX_TITLE_LENGTH = 120;
const MAX_BODY_LENGTH = 2000;
const MIN_BODY_LENGTH = 10;
const MAX_NAME_LENGTH = 60;

/* Statuses that mean the patron actually took delivery of (or at least
   paid for) the reserve. 'Pending' is money not yet captured; cancelled
   and refunded orders do not earn the badge. */
const PURCHASED_STATUSES = ['Paid', 'Processing', 'Packed', 'Shipped', 'Delivered'];

const SORT_ORDERS = {
  recent:  { column: 'created_at', ascending: false },
  oldest:  { column: 'created_at', ascending: true },
  highest: { column: 'rating',     ascending: false },
  lowest:  { column: 'rating',     ascending: true },
};

/* Fields safe to send to the storefront — no email, no user_id. */
const PUBLIC_COLUMNS = 'id, product_id, author_name, rating, title, body, verified_purchase, created_at, updated_at';

/** Strips angle brackets so a review can never inject markup downstream. */
function cleanText(value, maxLength) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

/** Resolves a slug to the product row, or null when it does not exist. */
async function findProductBySlug(slug) {
  const { data } = await supabase
    .from('products')
    .select('id, slug, name')
    .eq('slug', slug)
    .single();
  return data || null;
}

/**
 * Counts published reviews per star value for one product.
 * Five head-only count queries — exact, and bounded regardless of how
 * many reviews a reserve accumulates.
 */
async function buildDistribution(productId) {
  const counts = await Promise.all(
    RATING_VALUES.map(async (value) => {
      const { count } = await supabase
        .from('product_reviews')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId)
        .eq('status', 'published')
        .eq('rating', value);
      return [value, count || 0];
    })
  );
  return Object.fromEntries(counts);
}

function summarize(distribution) {
  const count = RATING_VALUES.reduce((sum, value) => sum + distribution[value], 0);
  if (count === 0) return { average: 0, count: 0, distribution };
  const total = RATING_VALUES.reduce((sum, value) => sum + value * distribution[value], 0);
  return { average: Number((total / count).toFixed(2)), count, distribution };
}

/** True when this patron has an order containing the product. */
async function hasPurchased(userId, productId) {
  const { data, error } = await supabase
    .from('order_items')
    .select('id, orders!inner(user_id, status)')
    .eq('product_id', productId)
    .eq('orders.user_id', userId)
    .in('orders.status', PURCHASED_STATUSES)
    .limit(1);

  if (error) {
    // A missing badge is cosmetic — never fail a review submission over it.
    console.warn('[Reviews] Verified-purchase lookup failed:', error.message);
    return false;
  }
  return (data || []).length > 0;
}

/**
 * Validates a submitted review. Returns { error } on failure, or the
 * normalized { rating, title, body } on success.
 */
function parseReviewPayload(rawBody, { partial = false } = {}) {
  // A JSON body of `null` or a bare string would otherwise throw on property
  // access; treat anything that is not an object as an empty submission.
  const body = rawBody && typeof rawBody === 'object' ? rawBody : {};
  const result = {};

  if (body.rating != null || !partial) {
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { error: 'Please select a rating between 1 and 5 leaves.' };
    }
    result.rating = rating;
  }

  if (body.body != null || !partial) {
    const text = cleanText(body.body, MAX_BODY_LENGTH);
    if (text.length < MIN_BODY_LENGTH) {
      return { error: `Please share at least ${MIN_BODY_LENGTH} characters about this reserve.` };
    }
    result.body = text;
  }

  if (body.title != null || !partial) {
    result.title = cleanText(body.title, MAX_TITLE_LENGTH) || null;
  }

  return { value: result };
}

/* ─── GET /api/products/:slug/reviews (public) ──────────────── */
export const listProductReviews = async (req, res, next) => {
  try {
    const product = await findProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const order = SORT_ORDERS[req.query.sort] || SORT_ORDERS.recent;

    let query = supabase
      .from('product_reviews')
      .select(PUBLIC_COLUMNS, { count: 'exact' })
      .eq('product_id', product.id)
      .eq('status', 'published');

    // Optional star filter, driven by the distribution bars.
    const ratingFilter = Number(req.query.rating);
    if (Number.isInteger(ratingFilter) && ratingFilter >= 1 && ratingFilter <= 5) {
      query = query.eq('rating', ratingFilter);
    }

    const { data, error, count } = await query
      .order(order.column, { ascending: order.ascending })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const summary = summarize(await buildDistribution(product.id));

    return res.status(200).json({
      success: true,
      productId: product.id,
      summary,
      reviews: data || [],
      total: count || 0,
    });
  } catch (err) {
    next(err);
  }
};

/* ─── POST /api/products/:slug/reviews (authenticated) ──────── */
export const createProductReview = async (req, res, next) => {
  try {
    const product = await findProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    const { error: invalid, value } = parseReviewPayload(req.body);
    if (invalid) {
      return res.status(400).json({ success: false, error: invalid });
    }

    const fallbackName =
      req.user.user_metadata?.full_name ||
      (req.user.email || '').split('@')[0] ||
      'Patron';
    const authorName = cleanText(req.body.authorName, MAX_NAME_LENGTH) || fallbackName;

    const { data, error } = await supabase
      .from('product_reviews')
      .insert([{
        product_id: product.id,
        user_id: req.user.id,
        author_name: authorName,
        author_email: req.user.email || null,
        rating: value.rating,
        title: value.title,
        body: value.body,
        verified_purchase: await hasPurchased(req.user.id, product.id),
      }])
      .select(PUBLIC_COLUMNS)
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'You have already recorded an impression of this reserve. You may edit it instead.',
        });
      }
      throw error;
    }

    return res.status(201).json({ success: true, review: data });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/reviews/mine?productId= (authenticated) ──────── */
/* Lets the product page show the patron their own review — including
   one an admin has hidden — so the form knows whether to create or edit. */
export const getMyReviewForProduct = async (req, res, next) => {
  try {
    const productId = req.query.productId;
    if (!productId) {
      return res.status(400).json({ success: false, error: 'A productId is required.' });
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .select(`${PUBLIC_COLUMNS}, status`)
      .eq('product_id', productId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    return res.status(200).json({ success: true, review: data || null });
  } catch (err) {
    next(err);
  }
};

/* ─── PATCH /api/reviews/:id (author only) ──────────────────── */
export const updateMyReview = async (req, res, next) => {
  try {
    const { data: existing } = await supabase
      .from('product_reviews')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }
    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You may only edit your own review.' });
    }

    const { error: invalid, value } = parseReviewPayload(req.body, { partial: true });
    if (invalid) {
      return res.status(400).json({ success: false, error: invalid });
    }
    if (Object.keys(value).length === 0) {
      return res.status(400).json({ success: false, error: 'No editable fields supplied.' });
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .update({ ...value, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select(PUBLIC_COLUMNS)
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, review: data });
  } catch (err) {
    next(err);
  }
};

/* ─── DELETE /api/reviews/:id (author or admin) ─────────────── */
export const deleteReview = async (req, res, next) => {
  try {
    const { data: existing } = await supabase
      .from('product_reviews')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    const isOwner = existing.user_id === req.user.id;
    if (!isOwner && !isAdminEmail(req.user.email)) {
      return res.status(403).json({ success: false, error: 'You may only remove your own review.' });
    }

    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Review removed.' });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/reviews/admin/list (admin) ───────────────────── */
export const listReviewsForAdmin = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    let query = supabase
      .from('product_reviews')
      .select('*', { count: 'exact' });

    if (req.query.status === 'published' || req.query.status === 'hidden') {
      query = query.eq('status', req.query.status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Attach product names so the panel reads as a ledger, not a list of ids.
    const { data: products } = await supabase.from('products').select('id, name, slug');
    const nameById = Object.fromEntries((products || []).map((p) => [p.id, p]));

    const shaped = (data || []).map((row) => ({
      ...row,
      product_name: nameById[row.product_id]?.name || row.product_id,
      product_slug: nameById[row.product_id]?.slug || null,
    }));

    return res.status(200).json({ success: true, reviews: shaped, total: count || 0 });
  } catch (err) {
    next(err);
  }
};

/* ─── PATCH /api/reviews/admin/:id/status (admin) ───────────── */
export const setReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (status !== 'published' && status !== 'hidden') {
      return res.status(400).json({
        success: false,
        error: "Status must be either 'published' or 'hidden'.",
      });
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }
    return res.status(200).json({ success: true, review: data });
  } catch (err) {
    next(err);
  }
};

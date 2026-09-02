import api from './api';

/**
 * Review service — ratings & written impressions on a reserve.
 *
 * Reading is public. Writing, editing, and removing require a signed-in
 * patron; the 'verified purchase' badge is decided server-side from the
 * order ledger and is never sent from here.
 */

function toUiReview(row) {
  return {
    id: row.id,
    productId: row.product_id,
    authorName: row.author_name,
    rating: Number(row.rating),
    title: row.title || '',
    body: row.body,
    verifiedPurchase: Boolean(row.verified_purchase),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const EMPTY_SUMMARY = {
  average: 0,
  count: 0,
  distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
};

function toUiSummary(summary) {
  if (!summary) return EMPTY_SUMMARY;
  return {
    average: Number(summary.average) || 0,
    count: Number(summary.count) || 0,
    distribution: { ...EMPTY_SUMMARY.distribution, ...(summary.distribution || {}) },
  };
}

/* ─── Public reads ──────────────────────────────────────────── */

export async function listProductReviews(slug, { sort = 'recent', limit = 6, offset = 0, rating } = {}) {
  const params = { sort, limit, offset };
  if (rating) params.rating = rating;

  const { data } = await api.get(`/api/products/${slug}/reviews`, { params });
  return {
    productId: data.productId,
    summary: toUiSummary(data.summary),
    reviews: (data.reviews || []).map(toUiReview),
    total: Number(data.total) || 0,
  };
}

/* ─── Patron writes ─────────────────────────────────────────── */

export async function getMyReview(productId) {
  const { data } = await api.get('/api/reviews/mine', { params: { productId } });
  return data.review ? toUiReview(data.review) : null;
}

export async function createProductReview(slug, { rating, title, body, authorName }) {
  const { data } = await api.post(`/api/products/${slug}/reviews`, {
    rating,
    title,
    body,
    authorName,
  });
  return toUiReview(data.review);
}

export async function updateReview(reviewId, { rating, title, body }) {
  const { data } = await api.patch(`/api/reviews/${reviewId}`, { rating, title, body });
  return toUiReview(data.review);
}

export async function deleteReview(reviewId) {
  await api.delete(`/api/reviews/${reviewId}`);
}

/* ─── Admin moderation ──────────────────────────────────────── */

export async function listReviewsForAdmin({ status, limit = 50, offset = 0 } = {}) {
  const params = { limit, offset };
  if (status) params.status = status;

  const { data } = await api.get('/api/reviews/admin/list', { params });
  return {
    reviews: (data.reviews || []).map((row) => ({
      ...toUiReview(row),
      authorEmail: row.author_email,
      productName: row.product_name,
      productSlug: row.product_slug,
    })),
    total: Number(data.total) || 0,
  };
}

export async function setReviewStatus(reviewId, status) {
  const { data } = await api.patch(`/api/reviews/admin/${reviewId}/status`, { status });
  return toUiReview(data.review);
}

export { EMPTY_SUMMARY };

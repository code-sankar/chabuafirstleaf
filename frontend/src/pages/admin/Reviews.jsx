import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle, BadgeCheck, Eye, EyeOff, Loader, Star, Trash2,
} from 'lucide-react';

import { deleteReview, listReviewsForAdmin, setReviewStatus } from '../../services/reviewService';

/**
 * Reviews — moderation of patron impressions.
 *
 * Hiding withdraws a review from the storefront and from the product's
 * rating average without destroying it; removal is permanent. Both
 * recalculate the denormalised aggregate via the database trigger.
 */

const FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'hidden',    label: 'Withheld' },
];

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listReviewsForAdmin({
        status: filter === 'all' ? undefined : filter,
      });
      setReviews(result.reviews);
      setTotal(result.total);
      setError('');
    } catch (err) {
      setError(err?.message || 'Impressions could not be loaded.');
      setReviews([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(''), 6000);
    return () => clearTimeout(timer);
  }, [error]);

  const toggleStatus = async (review) => {
    setBusyId(review.id);
    try {
      const next = review.status === 'published' ? 'hidden' : 'published';
      await setReviewStatus(review.id, next);
      setReviews((prev) =>
        filter === 'all'
          ? prev.map((r) => (r.id === review.id ? { ...r, status: next } : r))
          : prev.filter((r) => r.id !== review.id)
      );
    } catch (err) {
      setError(err?.message || 'The status could not be changed.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (review) => {
    setBusyId(review.id);
    try {
      await deleteReview(review.id);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      setError(err?.message || 'The impression could not be removed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-brand-charcoal/10 pb-6">
        <p className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-1">
          Patron Voices
        </p>
        <h1 className="font-serif text-3xl text-brand-forest tracking-wide">Review Moderation</h1>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 text-red-700 font-sans text-xs"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-sans text-[11px] uppercase tracking-widest text-brand-muted/70">
          {total} {total === 1 ? 'Impression' : 'Impressions'}
        </p>
        <div className="flex items-center gap-5">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`font-sans text-[10px] uppercase tracking-widest transition-colors cursor-pointer ${
                filter === option.id
                  ? 'text-brand-forest border-b border-brand-gold pb-1'
                  : 'text-brand-muted/60 hover:text-brand-forest'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center text-brand-muted">
          <Loader className="w-5 h-5 animate-spin mr-2 stroke-[1.5]" />
          <span className="font-sans text-xs uppercase tracking-widest">Loading impressions…</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-brand-forest/5 p-12 text-center">
          <div className="w-10 h-[0.5px] bg-brand-gold/30 mx-auto mb-6" />
          <p className="font-serif italic text-brand-muted">
            No impressions in this view.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => {
            const isHidden = review.status === 'hidden';
            const busy = busyId === review.id;

            return (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                className={`bg-white border p-6 shadow-sm ${
                  isHidden ? 'border-brand-muted/25 opacity-70' : 'border-brand-forest/5'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-serif text-base text-brand-forest font-semibold">
                      {review.productName}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      <span className="inline-flex items-center gap-1 font-sans text-xs text-brand-gold font-semibold tabular-nums">
                        <Star className="w-3.5 h-3.5" fill="currentColor" strokeWidth={0} />
                        {review.rating}/5
                      </span>
                      <span className="font-sans text-[11px] text-brand-muted">
                        {review.authorName}
                        {review.authorEmail ? ` · ${review.authorEmail}` : ''}
                      </span>
                      <span className="font-sans text-[10px] uppercase tracking-widest text-brand-muted/60">
                        {formatDate(review.createdAt)}
                      </span>
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 font-sans text-[10px] uppercase tracking-widest text-emerald-600">
                          <BadgeCheck className="w-3.5 h-3.5 stroke-[1.5]" />
                          Verified
                        </span>
                      )}
                      {isHidden && (
                        <span className="font-sans text-[10px] uppercase tracking-widest text-amber-600 font-bold">
                          Withheld
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(review)}
                      disabled={busy}
                      title={isHidden ? 'Publish to the storefront' : 'Withhold from the storefront'}
                      className="p-2 border border-brand-forest/10 text-brand-muted hover:text-brand-forest hover:border-brand-gold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {busy
                        ? <Loader className="w-3.5 h-3.5 animate-spin stroke-[1.5]" />
                        : isHidden
                          ? <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
                          : <EyeOff className="w-3.5 h-3.5 stroke-[1.5]" />}
                    </button>
                    <button
                      onClick={() => remove(review)}
                      disabled={busy}
                      title="Remove permanently"
                      className="p-2 border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                  </div>
                </div>

                {review.title && (
                  <p className="font-serif text-lg text-brand-forest tracking-wide mb-1.5">
                    {review.title}
                  </p>
                )}
                <p className="font-sans text-sm text-brand-charcoal/80 leading-relaxed whitespace-pre-line">
                  {review.body}
                </p>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}

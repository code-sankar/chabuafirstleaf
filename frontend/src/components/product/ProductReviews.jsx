import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, EyeOff, Loader, PenLine } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import {
  EMPTY_SUMMARY,
  createProductReview,
  deleteReview,
  getMyReview,
  listProductReviews,
  updateReview,
} from '../../services/reviewService';
import RatingSummary from './RatingSummary';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const PAGE_SIZE = 6;

const SORT_OPTIONS = [
  { id: 'recent',  label: 'Most Recent' },
  { id: 'highest', label: 'Highest Rated' },
  { id: 'lowest',  label: 'Lowest Rated' },
];

/**
 * ProductReviews — the ratings & impressions section of a reserve page.
 *
 * Reading is open to everyone. Writing requires a signed-in patron, and
 * each patron holds exactly one impression per reserve, which they may
 * revise or withdraw at any time.
 *
 * `onSummaryChange` lifts the summary and the first page of reviews back
 * to the page so the header rating and the Product structured data stay
 * in step with what is actually shown here.
 */
export default function ProductReviews({ slug, productId, productName, onSummaryChange }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [sort, setSort] = useState('recent');
  const [ratingFilter, setRatingFilter] = useState(null);

  const [myReview, setMyReview] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const defaultAuthorName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  /* ─── Load a page of impressions ────────────────────────────── */
  const loadPage = useCallback(
    async ({ offset = 0, append = false } = {}) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const result = await listProductReviews(slug, {
          sort,
          limit: PAGE_SIZE,
          offset,
          rating: ratingFilter,
        });
        setSummary(result.summary);
        setTotal(result.total);
        setReviews((prev) => (append ? [...prev, ...result.reviews] : result.reviews));
        setLoadError('');
        return result;
      } catch (err) {
        // A catalogue without the reviews migration applied should degrade
        // to a quiet empty section, not a broken page.
        setLoadError(err?.message || 'Impressions could not be loaded.');
        if (!append) {
          setSummary(EMPTY_SUMMARY);
          setReviews([]);
          setTotal(0);
        }
        return null;
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [slug, sort, ratingFilter]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadPage({ offset: 0 });
      if (!cancelled && result && !ratingFilter) {
        onSummaryChange?.({ summary: result.summary, reviews: result.reviews });
      }
    })();
    return () => { cancelled = true; };
    // onSummaryChange is intentionally omitted — the parent passes a stable callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPage]);

  /* ─── The patron's own impression, hidden ones included ─────── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isAuthenticated || !productId) {
        if (!cancelled) setMyReview(null);
        return;
      }
      try {
        const mine = await getMyReview(productId);
        if (!cancelled) setMyReview(mine);
      } catch {
        // Not being able to read your own review is not worth an error state.
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, productId]);

  /* ─── Write / revise / withdraw ─────────────────────────────── */
  const handleSubmit = async (values) => {
    setSubmitting(true);
    setFormError('');
    try {
      if (myReview?.id) {
        await updateReview(myReview.id, values);
      } else {
        await createProductReview(slug, values);
      }
      setFormOpen(false);
      setRatingFilter(null);
      const [refreshed] = await Promise.all([
        loadPage({ offset: 0 }),
        productId ? getMyReview(productId).then(setMyReview).catch(() => {}) : Promise.resolve(),
      ]);
      if (refreshed) onSummaryChange?.({ summary: refreshed.summary, reviews: refreshed.reviews });
    } catch (err) {
      setFormError(err?.message || 'Your impression could not be saved. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview?.id) return;
    setDeleting(true);
    try {
      await deleteReview(myReview.id);
      setMyReview(null);
      setFormOpen(false);
      const refreshed = await loadPage({ offset: 0 });
      if (refreshed) onSummaryChange?.({ summary: refreshed.summary, reviews: refreshed.reviews });
    } catch (err) {
      setLoadError(err?.message || 'Your impression could not be removed.');
    } finally {
      setDeleting(false);
    }
  };

  const hasMore = reviews.length < total;
  const signInHref = `/login?returnTo=${encodeURIComponent(`${location.pathname}#reviews`)}`;

  /* Your own impression may sit beyond the loaded page (or be hidden by a
     filter) — surface it above the list so it is never lost from view. */
  const ownIsListed = useMemo(
    () => Boolean(myReview && reviews.some((r) => r.id === myReview.id)),
    [myReview, reviews]
  );

  return (
    <section id="reviews" className="scroll-mt-28 mt-32 border-t border-brand-gold/10 pt-20">

      {/* ─── Heading ─────────────────────────────────────────── */}
      <div className="text-center mb-14">
        <p className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-3">
          Patron Impressions
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-brand-forest tracking-wide">
          Ratings &amp; Reviews
        </h2>
        <div className="w-12 h-[0.5px] bg-brand-gold/40 mx-auto mt-6" />
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center gap-3 text-brand-muted">
          <Loader className="w-4 h-4 animate-spin stroke-[1.5]" />
          <span className="font-sans text-[11px] uppercase tracking-widest">Gathering impressions…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-start">

          {/* ─── LEFT: summary + write CTA ───────────────────── */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-10">
            {summary.count > 0 ? (
              <RatingSummary
                summary={summary}
                activeFilter={ratingFilter}
                onFilterChange={setRatingFilter}
              />
            ) : (
              <div>
                <p className="font-serif italic text-lg text-brand-muted leading-relaxed">
                  No impressions have been recorded for {productName} yet.
                </p>
                <p className="font-sans text-xs text-brand-muted/70 mt-3 leading-relaxed">
                  Yours would be the first entry in this reserve's ledger.
                </p>
              </div>
            )}

            {/* Write / revise affordance */}
            {!formOpen && (
              <div className="pt-2">
                {!isAuthenticated ? (
                  <div className="border border-brand-forest/10 bg-white p-6">
                    <p className="font-sans text-xs text-brand-muted leading-relaxed mb-4">
                      Impressions are recorded by signed-in patrons, so that every entry
                      traces back to a genuine acquisition.
                    </p>
                    <Link
                      to={signInHref}
                      className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-1 hover:text-brand-gold transition-colors"
                    >
                      <PenLine className="w-3.5 h-3.5 stroke-[1.5]" />
                      Sign in to write a review
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => { setFormError(''); setFormOpen(true); }}
                      className="inline-flex items-center gap-2.5 border border-brand-forest/20 bg-white px-6 py-4 font-sans text-[11px] uppercase tracking-widest text-brand-forest hover:border-brand-gold hover:text-brand-gold transition-colors cursor-pointer"
                    >
                      <PenLine className="w-3.5 h-3.5 stroke-[1.5]" />
                      {myReview ? 'Revise your impression' : 'Write a review'}
                    </button>

                    {myReview?.status === 'hidden' && (
                      <p className="flex items-start gap-2 font-sans text-[11px] text-brand-muted leading-relaxed">
                        <EyeOff className="w-3.5 h-3.5 shrink-0 mt-0.5 stroke-[1.5]" />
                        Your impression is currently withheld from public view by the estate.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── RIGHT: the impressions themselves ───────────── */}
          <div className="lg:col-span-7">

            <AnimatePresence mode="wait">
              {formOpen && (
                <motion.div
                  key="review-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-10 overflow-hidden"
                >
                  <ReviewForm
                    initial={myReview}
                    defaultAuthorName={defaultAuthorName}
                    onSubmit={handleSubmit}
                    onCancel={() => { setFormOpen(false); setFormError(''); }}
                    submitting={submitting}
                    error={formError}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {loadError && (
              <div className="flex items-start gap-2.5 p-3 mb-6 bg-red-50 border border-red-200 text-red-700 font-sans text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{loadError}</span>
              </div>
            )}

            {/* Sort bar — only meaningful once impressions exist */}
            {summary.count > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-brand-forest/8">
                <p className="font-sans text-[11px] uppercase tracking-widest text-brand-muted/70">
                  {ratingFilter
                    ? `${total} at ${ratingFilter} ★`
                    : `${total} ${total === 1 ? 'Impression' : 'Impressions'}`}
                </p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSort(option.id)}
                      className={`font-sans text-[10px] uppercase tracking-widest transition-colors cursor-pointer ${
                        sort === option.id
                          ? 'text-brand-forest border-b border-brand-gold pb-1'
                          : 'text-brand-muted/60 hover:text-brand-forest'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Your own impression, when it is not part of the current page */}
            {myReview && !ownIsListed && (
              <ReviewCard
                review={myReview}
                isOwn
                onEdit={() => { setFormError(''); setFormOpen(true); }}
                onDelete={handleDelete}
                deleting={deleting}
              />
            )}

            {reviews.length === 0 && !myReview ? (
              <div className="py-16 text-center">
                <div className="w-10 h-[0.5px] bg-brand-gold/30 mx-auto mb-6" />
                <p className="font-serif italic text-brand-muted">
                  {ratingFilter
                    ? 'No impressions at this rating.'
                    : 'This reserve is awaiting its first impression.'}
                </p>
              </div>
            ) : (
              <div>
                {reviews.map((review, index) => {
                  const isOwn = myReview?.id === review.id;
                  return (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      index={index}
                      isOwn={isOwn}
                      onEdit={isOwn ? () => { setFormError(''); setFormOpen(true); } : undefined}
                      onDelete={isOwn ? handleDelete : undefined}
                      deleting={isOwn && deleting}
                    />
                  );
                })}
              </div>
            )}

            {hasMore && (
              <div className="pt-10 text-center">
                <button
                  type="button"
                  onClick={() => loadPage({ offset: reviews.length, append: true })}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2.5 font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold/40 pb-1 hover:text-brand-gold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loadingMore && <Loader className="w-3.5 h-3.5 animate-spin stroke-[1.5]" />}
                  Read further impressions
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

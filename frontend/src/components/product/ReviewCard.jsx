import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Pencil, Trash2 } from 'lucide-react';
import StarRating from './StarRating';

/**
 * ReviewCard — one patron's impression, set as editorial copy rather
 * than a boxed comment. Owners get quiet edit / remove affordances.
 */

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ReviewCard({ review, isOwn = false, onEdit, onDelete, deleting = false, index = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="py-8 border-b border-brand-forest/8 last:border-b-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <StarRating value={review.rating} size="sm" label={`Rated ${review.rating} out of 5`} />
        <time
          dateTime={review.createdAt}
          className="font-sans text-[10px] uppercase tracking-widest text-brand-muted/60"
        >
          {formatDate(review.createdAt)}
        </time>
      </div>

      {review.title && (
        <h4 className="font-serif text-xl text-brand-forest tracking-wide leading-snug mb-2">
          {review.title}
        </h4>
      )}

      <p className="font-sans text-sm text-brand-charcoal/85 leading-relaxed whitespace-pre-line">
        {review.body}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
        <span className="font-sans text-[11px] uppercase tracking-widest text-brand-forest font-medium">
          {review.authorName}
        </span>

        {review.verifiedPurchase && (
          <span className="inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest text-brand-gold">
            <BadgeCheck className="w-3.5 h-3.5 stroke-[1.5]" />
            Verified Acquisition
          </span>
        )}

        {isOwn && (
          <span className="font-sans text-[10px] uppercase tracking-widest text-brand-muted/60 italic">
            Your impression
          </span>
        )}

        {isOwn && (
          <span className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors cursor-pointer"
            >
              <Pencil className="w-3 h-3 stroke-[1.5]" />
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest text-brand-muted hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3 stroke-[1.5]" />
              {deleting ? 'Removing…' : 'Remove'}
            </button>
          </span>
        )}
      </div>
    </motion.article>
  );
}

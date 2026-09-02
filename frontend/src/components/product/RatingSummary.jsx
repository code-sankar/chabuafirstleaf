import React from 'react';
import { motion } from 'framer-motion';
import StarRating from './StarRating';

/**
 * RatingSummary — the average, the volume, and the shape of opinion.
 *
 * The distribution bars double as filters: selecting one narrows the
 * list below to that star value, selecting it again clears the filter.
 */
export default function RatingSummary({ summary, activeFilter, onFilterChange }) {
  const { average, count, distribution } = summary;

  return (
    /* Two explicit tracks rather than a 12-column grid: inside a column this
       narrow, eleven column gaps would consume more width than the container
       has, and the distribution would spill over the reviews beside it. */
    <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] gap-8 sm:gap-10 items-center">

      {/* Average */}
      <div className="text-center sm:text-left">
        <p className="font-serif text-6xl text-brand-forest leading-none tabular-nums font-light">
          {average.toFixed(1)}
        </p>
        <div className="mt-4 flex justify-center sm:justify-start">
          <StarRating value={average} size="md" label={`Rated ${average.toFixed(1)} out of 5`} />
        </div>
        <p className="font-sans text-[11px] uppercase tracking-widest text-brand-muted mt-3">
          {count} {count === 1 ? 'Impression' : 'Impressions'}
        </p>
      </div>

      {/* Distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const value = distribution[star] || 0;
          const percent = count > 0 ? (value / count) * 100 : 0;
          const isActive = activeFilter === star;
          const isEmpty = value === 0;

          return (
            <button
              key={star}
              type="button"
              disabled={isEmpty}
              onClick={() => onFilterChange(isActive ? null : star)}
              aria-pressed={isActive}
              className={`w-full flex items-center gap-4 group ${
                isEmpty ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span
                className={`font-sans text-[11px] tabular-nums w-10 text-left tracking-wider transition-colors ${
                  isActive ? 'text-brand-gold font-semibold' : 'text-brand-muted group-hover:text-brand-forest'
                }`}
              >
                {star} ★
              </span>

              <span className="flex-1 h-[3px] bg-brand-forest/8 overflow-hidden">
                <motion.span
                  className={`block h-full origin-left ${isActive ? 'bg-brand-gold' : 'bg-brand-gold/50'}`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: percent / 100 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{ width: '100%' }}
                />
              </span>

              <span className="font-sans text-[11px] tabular-nums text-brand-muted/70 w-8 text-right">
                {value}
              </span>
            </button>
          );
        })}

        {activeFilter && (
          <button
            type="button"
            onClick={() => onFilterChange(null)}
            className="font-sans text-[10px] uppercase tracking-widest text-brand-gold border-b border-brand-gold/40 pb-0.5 mt-3 cursor-pointer"
          >
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}

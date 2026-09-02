import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating — the house's rating mark, in two modes.
 *
 *   Display   <StarRating value={4.3} />
 *   Input     <StarRating value={rating} onChange={setRating} />
 *
 * Fractional values are rendered by overlaying a gold star row on a
 * muted one and clipping it to the exact percentage, so 4.3 reads as
 * 4.3 rather than rounding away a third of a star.
 */

const SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-7 h-7',
};

const RATING_LABELS = {
  1: 'Disappointing',
  2: 'Below expectation',
  3: 'Agreeable',
  4: 'Excellent',
  5: 'Exceptional',
};

export default function StarRating({
  value = 0,
  size = 'sm',
  onChange,
  label,
  className = '',
}) {
  const [hovered, setHovered] = useState(0);
  const iconSize = SIZES[size] || SIZES.sm;
  const interactive = typeof onChange === 'function';

  /* ─── Input mode: five buttons, keyboard reachable ─────────── */
  if (interactive) {
    const shown = hovered || value;
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHovered(0)}
          role="radiogroup"
          aria-label={label || 'Rating'}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} of 5 — ${RATING_LABELS[star]}`}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              className="p-0.5 transition-transform duration-200 hover:scale-110 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold"
            >
              <Star
                className={`${iconSize} stroke-[1.25] transition-colors duration-200 ${
                  star <= shown ? 'text-brand-gold' : 'text-brand-forest/20'
                }`}
                fill={star <= shown ? 'currentColor' : 'none'}
              />
            </button>
          ))}
        </div>
        {shown > 0 && (
          <span className="font-sans text-[10px] uppercase tracking-widest text-brand-muted">
            {RATING_LABELS[shown]}
          </span>
        )}
      </div>
    );
  }

  /* ─── Display mode: clipped gold overlay for fractions ─────── */
  const clamped = Math.max(0, Math.min(5, Number(value) || 0));
  const fillPercent = (clamped / 5) * 100;

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      role="img"
      aria-label={label || `Rated ${clamped.toFixed(1)} out of 5`}
    >
      {/* Empty row. Spacing comes from per-star padding rather than a
          flex gap so each star occupies exactly one fifth of the width
          and the clip below lands where the arithmetic says it should. */}
      <span className="flex items-center" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="px-[1.5px]">
            <Star className={`${iconSize} text-brand-forest/20 stroke-[1.25]`} fill="none" />
          </span>
        ))}
      </span>

      {/* Gold row, clipped to the exact average */}
      <span
        className="absolute inset-y-0 left-0 flex items-center overflow-hidden"
        style={{ width: `${fillPercent}%` }}
        aria-hidden="true"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="px-[1.5px] shrink-0">
            <Star className={`${iconSize} text-brand-gold stroke-[1.25]`} fill="currentColor" />
          </span>
        ))}
      </span>
    </span>
  );
}

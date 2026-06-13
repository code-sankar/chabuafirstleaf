import React from 'react';

/**
 * Status visual treatments. Kept restrained — no bright fills, no shadows.
 *   - Resting palette: forest/gold/muted (brand-native)
 *   - Edge cases: a quiet amber for warning, a desaturated red for cancelled
 */
const STATUS_STYLES = {
  Pending:    { dot: 'bg-brand-muted/50',     text: 'text-brand-muted',    label: 'Pending' },
  Paid:       { dot: 'bg-brand-gold',         text: 'text-brand-gold',     label: 'Paid' },
  Processing: { dot: 'bg-amber-500/80',       text: 'text-amber-700',      label: 'Processing' },
  Packed:     { dot: 'bg-amber-500/80',       text: 'text-amber-700',      label: 'Packed' },
  Shipped:    { dot: 'bg-sky-600/80',         text: 'text-sky-700',        label: 'Shipped' },
  Delivered:  { dot: 'bg-emerald-600',        text: 'text-emerald-700',    label: 'Delivered' },
  Cancelled:  { dot: 'bg-red-500/70',         text: 'text-red-700',        label: 'Cancelled' },
  Refunded:   { dot: 'bg-brand-muted',        text: 'text-brand-muted',    label: 'Refunded' },
};

export default function OrderStatusBadge({ status, size = 'md' }) {
  const cfg = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]';

  return (
    <span className={`inline-flex items-center gap-2 font-sans uppercase tracking-widest ${textSize} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span>{cfg.label}</span>
    </span>
  );
}

export { STATUS_STYLES };
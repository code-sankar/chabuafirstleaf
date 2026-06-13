import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency } from '../../utils/currency';

/**
 * `order` is expected to come from the backend in this shape:
 *
 *   {
 *     id:           'uuid',
 *     orderNumber:  'CFL-2027-000001',
 *     status:       'Shipped',
 *     placedAt:     '2027-03-14T08:42:00Z',
 *     totalAmount:  4275.00,        // already in display currency
 *     currency:     'INR',
 *     itemCount:    2,
 *     items:        [{ id, name, images, quantity }]  // optional preview
 *   }
 */
export default function OrderCard({ order }) {
  const placedDate = order.placedAt
    ? new Date(order.placedAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return (
    <Link
      to={`/account/orders/${order.id || order.orderNumber}`}
      className="block bg-white border border-brand-forest/5 hover:border-brand-gold/30 transition-colors group"
    >
      <article className="p-6 md:p-7">
        {/* Top row — order number, status, chevron */}
        <header className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-1">
              Order
            </p>
            <p className="font-serif text-lg text-brand-forest tabular-nums tracking-wider truncate">
              {order.orderNumber}
            </p>
            {placedDate && (
              <p className="font-sans text-[11px] text-brand-muted mt-1">
                Placed {placedDate}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <OrderStatusBadge status={order.status} />
            <ChevronRight className="w-4 h-4 text-brand-muted/40 group-hover:text-brand-forest transition-colors" strokeWidth={1.5} />
          </div>
        </header>

        {/* Item thumbnails (optional preview) */}
        {order.items?.length > 0 && (
          <div className="flex items-center gap-2 mb-5">
            {order.items.slice(0, 4).map((item, idx) => (
              <img
                key={item.id || idx}
                src={item.images?.[0]}
                alt={item.name}
                className="w-12 h-14 object-cover border border-brand-forest/5"
                loading="lazy"
              />
            ))}
            {order.items.length > 4 && (
              <span className="font-sans text-xs text-brand-muted ml-1">
                + {order.items.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer — items count + total */}
        <footer className="flex items-baseline justify-between pt-4 border-t border-brand-forest/5">
          <p className="font-sans text-[11px] tracking-wide text-brand-muted">
            {order.itemCount || order.items?.length || 0} {(order.itemCount === 1) ? 'item' : 'items'}
          </p>
          <p className="font-serif text-lg text-brand-forest tabular-nums">
            {formatCurrency(order.totalAmount, order.currency || 'INR')}
          </p>
        </footer>
      </article>
    </Link>
  );
}
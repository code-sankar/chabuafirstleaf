import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Edit2 } from 'lucide-react';
import { priceFromUSD } from '../../utils/currency';

/**
 * Cost breakdown rules (display only — backend is authoritative):
 *   - Subtotal: sum of item.price * item.quantity (USD source)
 *   - Shipping: free above $200, else $15 (or local equivalent)
 *   - Tax: 5% on subtotal+shipping for India, 0 for international (handled at customs)
 *   - Total: sum of the above
 */
function computeBreakdown(items) {
  const subtotalUSD = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingUSD = subtotalUSD >= 200 ? 0 : 15;
  const taxUSD = (subtotalUSD + shippingUSD) * 0.05; // simplified
  const totalUSD = subtotalUSD + shippingUSD + taxUSD;
  return { subtotalUSD, shippingUSD, taxUSD, totalUSD };
}

export default function ReviewStep({ items, form, currency, onBack, onEditShipping, onPay, isProcessing }) {
  const { subtotalUSD, shippingUSD, taxUSD, totalUSD } = computeBreakdown(items);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-12"
    >
      <header className="text-center max-w-xl mx-auto">
        <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-3">
          Step Three
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-brand-forest tracking-wide">
          Review Your Order
        </h1>
        <div className="w-12 h-[0.5px] bg-brand-gold/40 mx-auto mt-6" />
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT: Items + Shipping */}
        <div className="lg:col-span-3 space-y-6">
          <section className="bg-white border border-brand-forest/5 p-6 md:p-8">
            <h2 className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-5">
              Items ({items.reduce((c, i) => c + i.quantity, 0)})
            </h2>
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 pb-5 border-b border-brand-forest/5 last:border-0 last:pb-0">
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="w-16 h-20 object-cover border border-brand-forest/5 shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base text-brand-forest leading-snug">{item.name}</h3>
                    <p className="font-sans text-[11px] text-brand-muted mt-1">
                      Quantity {item.quantity} · {item.weight}
                    </p>
                  </div>
                  <p className="font-serif text-base text-brand-charcoal tabular-nums">
                    {priceFromUSD(item.price * item.quantity, currency)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-brand-forest/5 p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70">
                Shipping To
              </h2>
              <button
                onClick={onEditShipping}
                className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors"
              >
                <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                <span>Edit</span>
              </button>
            </div>
            <div className="space-y-1.5 font-sans text-sm text-brand-charcoal">
              <p className="font-medium text-brand-forest">{form.name}</p>
              <p>{form.address}</p>
              <p>{form.city}, {form.state} {form.postalCode}</p>
              <p>{form.country}</p>
              <p className="text-brand-muted pt-2">{form.email}</p>
              <p className="text-brand-muted">{form.phone}</p>
            </div>
          </section>
        </div>

        {/* RIGHT: Cost Breakdown */}
        <aside className="lg:col-span-2 lg:sticky lg:top-32 self-start">
          <div className="bg-white border border-brand-forest/5 p-6 md:p-8 space-y-5">
            <h2 className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 pb-3 border-b border-brand-forest/5">
              Order Summary
            </h2>

            <dl className="space-y-3 font-sans text-sm">
              <Row label="Subtotal" value={priceFromUSD(subtotalUSD, currency)} />
              <Row
                label="Shipping"
                value={shippingUSD === 0 ? 'Complimentary' : priceFromUSD(shippingUSD, currency)}
                emphasis={shippingUSD === 0}
              />
              <Row label="Taxes & Duties" value={priceFromUSD(taxUSD, currency)} />
            </dl>

            <div className="border-t border-brand-forest/10 pt-4 flex items-baseline justify-between">
              <dt className="font-sans text-[10px] uppercase tracking-widest text-brand-muted">
                Total
              </dt>
              <dd className="font-serif text-2xl text-brand-forest tabular-nums">
                {priceFromUSD(totalUSD, currency)}
              </dd>
            </div>

            <button
              onClick={() => onPay(totalUSD)}
              disabled={isProcessing}
              className="w-full gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase py-4 flex items-center justify-center gap-2.5 rounded-none disabled:opacity-50 cursor-pointer mt-2"
            >
              <Lock className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{isProcessing ? 'Preparing Payment…' : 'Proceed to Payment'}</span>
            </button>

            <p className="font-sans text-[10px] text-brand-muted/60 tracking-wide text-center">
              By placing this order you agree to our{' '}
              <a href="/terms" className="text-brand-forest underline">Terms</a> and{' '}
              <a href="/privacy" className="text-brand-forest underline">Privacy Policy</a>.
            </p>
          </div>
        </aside>
      </div>

      <div className="max-w-4xl mx-auto pt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shipping</span>
        </button>
      </div>
    </motion.div>
  );
}

function Row({ label, value, emphasis }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-brand-muted">{label}</dt>
      <dd className={`tabular-nums ${emphasis ? 'text-brand-gold font-medium' : 'text-brand-charcoal'}`}>
        {value}
      </dd>
    </div>
  );
}

export { computeBreakdown };
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, Search, Loader, AlertCircle, Check, ExternalLink, Truck, MapPin, Mail,
} from 'lucide-react';

import OrderStatusBadge from '../../components/account/OrderStatusBadge';
import { trackOrderByNumber } from '../../services/orderService';
import { formatCurrency } from '../../utils/currency';
import { validateEmail } from '../../utils/validation';

const PIPELINE = ['Pending', 'Paid', 'Processing', 'Packed', 'Shipped', 'Delivered'];

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const initialOrder = searchParams.get('order') || '';

  const [form, setForm] = useState({ orderNumber: initialOrder, email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  /* If the URL has both order and email, auto-look-up (rare but possible) */
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (initialOrder && emailParam) {
      setForm({ orderNumber: initialOrder, email: emailParam });
      handleLookup({ orderNumber: initialOrder, email: emailParam });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookup = async (override) => {
    const payload = override || form;
    setError('');

    if (!payload.orderNumber.trim()) { setError('Please enter your order number.'); return; }
    const emailErr = validateEmail(payload.email);
    if (emailErr) { setError(emailErr); return; }

    setLoading(true);
    try {
      const data = await trackOrderByNumber({
        orderNumber: payload.orderNumber.trim(),
        email: payload.email.trim().toLowerCase(),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'We couldn\'t find an order matching those details.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLookup();
  };

  return (
    <>
      <Helmet>
        <title>Track Your Order · Chabua First Leaf</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-brand-cream pt-24 md:pt-28 pb-32 text-brand-charcoal">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </Link>

          <header className="mb-12">
            <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-3">
              Order Status
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-brand-forest tracking-wide">
              Track Your Order
            </h1>
            <div className="w-12 h-[0.5px] bg-brand-gold/40 mt-6" />
            <p className="font-serif italic text-brand-muted mt-6 max-w-xl">
              Enter your order number and the email used at checkout to view current status and tracking details.
            </p>
          </header>

          {/* Lookup form */}
          <form onSubmit={handleSubmit} className="bg-white border border-brand-forest/5 p-6 md:p-8 mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="track-order" className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
                  Order Number
                </label>
                <input
                  id="track-order"
                  type="text"
                  required
                  placeholder="CFL-2027-000001"
                  value={form.orderNumber}
                  onChange={(e) => { setForm((f) => ({ ...f, orderNumber: e.target.value })); if (error) setError(''); }}
                  className="bg-brand-cream/40 border border-brand-forest/10 px-4 py-3 font-sans text-sm text-brand-charcoal tabular-nums focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="track-email" className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
                  Email Address
                </label>
                <input
                  id="track-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); if (error) setError(''); }}
                  className="bg-brand-cream/40 border border-brand-forest/10 px-4 py-3 font-sans text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-2 p-3 bg-red-50/60 border border-red-200/60 text-red-700 font-sans text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full sm:w-auto gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase px-10 py-4 flex items-center justify-center gap-2 rounded-none disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? <><Loader className="w-3.5 h-3.5 animate-spin" /><span>Looking Up…</span></>
                : <><Search className="w-3.5 h-3.5" /><span>Track Order</span></>}
            </button>
          </form>

          {/* Result */}
          {result?.order && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Order header */}
              <header className="bg-white border border-brand-forest/5 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-1">
                      Order Number
                    </p>
                    <p className="font-serif text-2xl text-brand-forest tabular-nums tracking-wider">
                      {result.order.orderNumber}
                    </p>
                    {result.order.placedAt && (
                      <p className="font-sans text-sm text-brand-muted mt-2">
                        Placed {new Date(result.order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <OrderStatusBadge status={result.order.status} />
                </div>
              </header>

              {/* Timeline */}
              {PIPELINE.includes(result.order.status) && (
                <section className="bg-white border border-brand-forest/5 p-6 md:p-8">
                  <h2 className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-6 flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Tracking
                  </h2>
                  <Timeline currentStatus={result.order.status} />

                  {result.tracking?.trackingNumber && (
                    <div className="mt-8 pt-6 border-t border-brand-forest/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted/60 mb-1">
                          Tracking Number
                        </p>
                        <p className="font-sans text-sm text-brand-charcoal tabular-nums">
                          {result.tracking.trackingNumber}
                        </p>
                      </div>
                      {result.tracking.trackingUrl && (
                        <a
                          href={result.tracking.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors"
                        >
                          <span>Track with carrier</span>
                          <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                        </a>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Shipping + total summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.order.shippingAddress && (
                  <div className="bg-white border border-brand-forest/5 p-6">
                    <h2 className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-3 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Shipping To
                    </h2>
                    <address className="not-italic font-sans text-sm text-brand-charcoal leading-relaxed space-y-0.5">
                      <p className="font-medium text-brand-forest">{result.order.customer?.name}</p>
                      <p>{result.order.shippingAddress.street || result.order.shippingAddress.address}</p>
                      <p>{result.order.shippingAddress.city}, {result.order.shippingAddress.state} {result.order.shippingAddress.zip || result.order.shippingAddress.postalCode}</p>
                      <p>{result.order.shippingAddress.country}</p>
                    </address>
                  </div>
                )}

                <div className="bg-white border border-brand-forest/5 p-6">
                  <h2 className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-3 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Order Total
                  </h2>
                  <p className="font-serif text-3xl text-brand-forest tabular-nums">
                    {formatCurrency(result.order.totalAmount, result.order.currency || 'INR')}
                  </p>
                  <p className="font-sans text-xs text-brand-muted mt-2">
                    {result.order.items?.length || 0} {result.order.items?.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              {/* Account upsell */}
              <div className="bg-brand-cream/60 border border-brand-gold/15 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="font-sans text-sm text-brand-charcoal">
                  Want all your orders in one place?
                </p>
                <Link
                  to="/signup"
                  className="font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors"
                >
                  Create an Account
                </Link>
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </>
  );
}

function Timeline({ currentStatus }) {
  const currentIdx = PIPELINE.indexOf(currentStatus);
  return (
    <div className="relative">
      <div className="hidden md:block absolute top-3 left-0 right-0 h-[0.5px] bg-brand-forest/10" />
      <motion.div
        className="hidden md:block absolute top-3 left-0 h-[0.5px] bg-brand-gold"
        initial={{ width: '0%' }}
        animate={{ width: `${(currentIdx / (PIPELINE.length - 1)) * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <ol className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-0 relative">
        {PIPELINE.map((stage, idx) => {
          const isPassed = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <li key={stage} className="flex md:flex-col items-center gap-3 md:gap-2 md:text-center">
              <div className={`w-6 h-6 flex items-center justify-center bg-white border ${isPassed ? 'border-brand-gold' : 'border-brand-muted/20'}`}>
                {isPassed
                  ? <Check className={`w-3.5 h-3.5 ${isCurrent ? 'text-brand-forest' : 'text-brand-gold'}`} strokeWidth={2} />
                  : <span className="w-1.5 h-1.5 bg-brand-muted/20 rounded-full" />}
              </div>
              <p className={`font-sans text-[10px] uppercase tracking-widest ${
                isCurrent ? 'text-brand-forest font-semibold' : isPassed ? 'text-brand-charcoal' : 'text-brand-muted/40'
              }`}>
                {stage}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
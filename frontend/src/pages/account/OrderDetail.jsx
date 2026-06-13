import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, Truck, MapPin, CreditCard, Check, Mail, ExternalLink, Loader,
} from 'lucide-react';

import AccountLayout from '../../layouts/AccountLayout';
import OrderStatusBadge from '../../components/account/OrderStatusBadge';
import { getOrderById } from '../../services/orderService';
import { formatCurrency } from '../../utils/currency';

/* Order status pipeline used to render the timeline */
const PIPELINE = ['Pending', 'Paid', 'Processing', 'Packed', 'Shipped', 'Delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getOrderById(id);
        if (!cancelled) {
          setOrder(data.order);
          setTracking(data.tracking || null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <AccountLayout>
        <div className="bg-white border border-brand-forest/5 p-16 flex items-center justify-center gap-3">
          <Loader className="w-4 h-4 animate-spin text-brand-gold" strokeWidth={1.5} />
          <span className="font-sans text-[11px] uppercase tracking-widest text-brand-muted">
            Loading order details…
          </span>
        </div>
      </AccountLayout>
    );
  }

  if (error || !order) {
    return (
      <AccountLayout>
        <div className="bg-white border border-brand-forest/5 p-16 text-center">
          <p className="font-serif text-xl text-brand-forest mb-2">Order not found</p>
          <p className="font-sans text-sm text-brand-muted mb-6">
            {error || "We couldn't locate this order."}
          </p>
          <Link
            to="/account/orders"
            className="font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </AccountLayout>
    );
  }

  const currentStageIdx = PIPELINE.indexOf(order.status);
  const placedDate = order.placedAt
    ? new Date(order.placedAt).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return (
    <>
      <Helmet>
        <title>Order {order.orderNumber} · Chabua First Leaf</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <AccountLayout>
        <div className="space-y-8">
          {/* Back link */}
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>

          {/* Order header */}
          <header className="bg-white border border-brand-forest/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-1">
                  Order Number
                </p>
                <p className="font-serif text-3xl text-brand-forest tabular-nums tracking-wider">
                  {order.orderNumber}
                </p>
                {placedDate && (
                  <p className="font-sans text-sm text-brand-muted mt-2">
                    Placed on {placedDate}
                  </p>
                )}
              </div>
              <div className="md:text-right">
                <OrderStatusBadge status={order.status} />
                {order.estimatedDelivery && (
                  <p className="font-sans text-[11px] text-brand-muted mt-2">
                    Estimated delivery: {order.estimatedDelivery}
                  </p>
                )}
              </div>
            </div>
          </header>

          {/* Tracking timeline */}
          {currentStageIdx >= 0 && order.status !== 'Cancelled' && order.status !== 'Refunded' && (
            <section className="bg-white border border-brand-forest/5 p-6 md:p-8">
              <h2 className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-6">
                Tracking
              </h2>
              <div className="relative">
                <div className="hidden md:block absolute top-3 left-0 right-0 h-[0.5px] bg-brand-forest/10" />
                <motion.div
                  className="hidden md:block absolute top-3 left-0 h-[0.5px] bg-brand-gold"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(currentStageIdx / (PIPELINE.length - 1)) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />

                <ol className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-0 relative">
                  {PIPELINE.map((stage, idx) => {
                    const isPassed = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;
                    return (
                      <li key={stage} className="flex md:flex-col items-center gap-3 md:gap-2 md:text-center">
                        <div
                          className={`relative w-6 h-6 flex items-center justify-center bg-white border transition-colors duration-300 ${
                            isPassed ? 'border-brand-gold' : 'border-brand-muted/20'
                          }`}
                        >
                          {isPassed ? (
                            <Check
                              className={`w-3.5 h-3.5 ${isCurrent ? 'text-brand-forest' : 'text-brand-gold'}`}
                              strokeWidth={2}
                            />
                          ) : (
                            <span className="w-1.5 h-1.5 bg-brand-muted/20 rounded-full" />
                          )}
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

              {tracking?.trackingNumber && (
                <div className="mt-8 pt-6 border-t border-brand-forest/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted/60 mb-1">
                      Tracking Number
                    </p>
                    <p className="font-sans text-sm text-brand-charcoal tabular-nums">
                      {tracking.trackingNumber}
                    </p>
                  </div>
                  {tracking.trackingUrl && (
                    <a
                      href={tracking.trackingUrl}
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

          {/* Two columns: items + sidebar (address, payment, total) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <section className="lg:col-span-2 bg-white border border-brand-forest/5 p-6 md:p-8">
              <h2 className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-6 flex items-center gap-2">
                <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                Items ({order.items?.length || 0})
              </h2>
              <ul className="space-y-5">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex gap-4 pb-5 border-b border-brand-forest/5 last:border-0 last:pb-0">
                    <img
                      src={item.images?.[0] || item.image}
                      alt={item.name}
                      className="w-16 h-20 object-cover border border-brand-forest/5 shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-base text-brand-forest leading-snug">
                        {item.name}
                      </h3>
                      <p className="font-sans text-[11px] text-brand-muted mt-1">
                        {item.weight && `${item.weight} · `}Quantity {item.quantity}
                      </p>
                    </div>
                    <p className="font-serif text-base text-brand-charcoal tabular-nums shrink-0">
                      {formatCurrency(item.lineTotal || item.price * item.quantity, order.currency || 'INR')}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Shipping address */}
              <div className="bg-white border border-brand-forest/5 p-6">
                <h2 className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-4 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Shipping To
                </h2>
                <address className="not-italic space-y-1 font-sans text-sm text-brand-charcoal leading-relaxed">
                  <p className="font-medium text-brand-forest">{order.customer?.name}</p>
                  <p>{order.shippingAddress?.street || order.shippingAddress?.address}</p>
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip || order.shippingAddress?.postalCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                  <p className="pt-3 text-brand-muted text-xs flex items-center gap-1.5">
                    <Mail className="w-3 h-3" strokeWidth={1.5} />
                    {order.customer?.email}
                  </p>
                </address>
              </div>

              {/* Cost breakdown */}
              <div className="bg-white border border-brand-forest/5 p-6">
                <h2 className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-4 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Order Summary
                </h2>
                <dl className="space-y-2 font-sans text-sm">
                  <Row label="Subtotal" value={formatCurrency(order.subtotal || 0, order.currency || 'INR')} />
                  <Row
                    label="Shipping"
                    value={order.shipping === 0 || order.shipping == null
                      ? 'Complimentary'
                      : formatCurrency(order.shipping, order.currency || 'INR')}
                  />
                  <Row label="Taxes & Duties" value={formatCurrency(order.tax || 0, order.currency || 'INR')} />
                </dl>
                <div className="mt-4 pt-4 border-t border-brand-forest/10 flex items-baseline justify-between">
                  <dt className="font-sans text-[10px] uppercase tracking-widest text-brand-muted">Total Paid</dt>
                  <dd className="font-serif text-xl text-brand-forest tabular-nums">
                    {formatCurrency(order.totalAmount, order.currency || 'INR')}
                  </dd>
                </div>
                {order.paymentMethod && (
                  <p className="font-sans text-[11px] text-brand-muted mt-3">
                    Paid via {order.paymentMethod}
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </AccountLayout>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-brand-muted">{label}</dt>
      <dd className="text-brand-charcoal tabular-nums">{value}</dd>
    </div>
  );
}
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Package, Mail } from 'lucide-react';

export default function ConfirmationStep({ orderNumber, email, isAuthenticated }) {
  /* Confetti would be tacky for this brand — instead, a quiet entrance. */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-xl mx-auto text-center py-16"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'backOut' }}
        className="inline-flex items-center justify-center w-20 h-20 mb-10 border border-brand-gold/40 bg-brand-cream"
      >
        <Check className="w-7 h-7 text-brand-gold" strokeWidth={1} />
      </motion.div>

      <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-4">
        Order Confirmed
      </p>

      <h1 className="font-serif text-4xl md:text-5xl text-brand-forest tracking-wide mb-6 leading-tight">
        Thank you for choosing<br />Chabua First Leaf
      </h1>

      <div className="w-12 h-[0.5px] bg-brand-gold/40 mx-auto mb-8" />

      <p className="font-serif italic text-brand-muted text-lg leading-relaxed max-w-md mx-auto mb-12">
        Your tea is now being prepared from the historic tea-growing region of Chabua, Assam.
        You will receive shipping updates as your order progresses.
      </p>

      {/* Order details card */}
      <div className="bg-white border border-brand-forest/5 p-8 mb-12 max-w-md mx-auto">
        <div className="space-y-6">
          <div>
            <p className="font-sans text-[10px] tracking-widest uppercase text-brand-muted/60 mb-1">
              Order Number
            </p>
            <p className="font-serif text-2xl text-brand-forest tabular-nums tracking-wider">
              {orderNumber}
            </p>
          </div>

          <div className="h-[0.5px] bg-brand-forest/5" />

          <div className="flex items-start gap-3 text-left">
            <Mail className="w-4 h-4 text-brand-gold/60 mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="font-sans text-[10px] tracking-widest uppercase text-brand-muted/60 mb-1">
                Confirmation Sent To
              </p>
              <p className="font-sans text-sm text-brand-charcoal break-all">{email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <Package className="w-4 h-4 text-brand-gold/60 mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="font-sans text-[10px] tracking-widest uppercase text-brand-muted/60 mb-1">
                Estimated Delivery
              </p>
              <p className="font-sans text-sm text-brand-charcoal">
                Within 5–7 business days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        {isAuthenticated ? (
          <Link
            to="/account/orders"
            className="gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase px-8 py-3.5 rounded-none cursor-pointer"
          >
            View Order Details
          </Link>
        ) : (
          <Link
            to={`/track?order=${encodeURIComponent(orderNumber)}`}
            className="gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase px-8 py-3.5 rounded-none cursor-pointer"
          >
            Track Your Order
          </Link>
        )}

        <Link
          to="/collection"
          className="font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors border-b border-brand-gold/40 pb-0.5"
        >
          Continue Browsing
        </Link>
      </div>

      {!isAuthenticated && (
        <p className="mt-12 font-sans text-xs text-brand-muted/70 max-w-md mx-auto">
          We've created an account for you with this email.{' '}
          <Link to="/login" className="text-brand-forest border-b border-brand-gold pb-0.5">
            Set a password
          </Link>{' '}
          to view your full order history.
        </p>
      )}
    </motion.div>
  );
}
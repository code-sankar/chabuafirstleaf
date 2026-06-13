import React from 'react';
import { motion } from 'framer-motion';
import { Loader, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';

/**
 * Payment Step is shown briefly between Review and Confirmation.
 *
 * The actual Razorpay overlay is launched by CheckoutPage; this step
 * exists to provide a graceful waiting screen and to handle errors
 * if the overlay is dismissed or payment fails.
 */
export default function PaymentStep({ status, errorMessage, onRetry, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-xl mx-auto text-center py-16"
    >
      {status === 'processing' && (
        <>
          <div className="inline-flex items-center justify-center w-16 h-16 mb-8 border border-brand-gold/30">
            <Loader className="w-5 h-5 text-brand-gold animate-spin" strokeWidth={1.5} />
          </div>
          <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-3">
            Step Four
          </p>
          <h1 className="font-serif text-3xl text-brand-forest tracking-wide mb-4">
            Securing Your Payment
          </h1>
          <p className="font-serif italic text-brand-muted text-base max-w-md mx-auto">
            Your transaction is being prepared. The secure payment window will open in a moment.
          </p>

          <div className="mt-10 inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-brand-muted/60">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-gold/60" strokeWidth={1.5} />
            <span>Encrypted via Razorpay · 256-bit TLS</span>
          </div>
        </>
      )}

      {status === 'verifying' && (
        <>
          <div className="inline-flex items-center justify-center w-16 h-16 mb-8 border border-brand-gold/30">
            <Loader className="w-5 h-5 text-brand-gold animate-spin" strokeWidth={1.5} />
          </div>
          <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-3">
            Almost There
          </p>
          <h1 className="font-serif text-3xl text-brand-forest tracking-wide mb-4">
            Confirming Your Order
          </h1>
          <p className="font-serif italic text-brand-muted text-base max-w-md mx-auto">
            We're verifying your payment with our estate. Please don't refresh or close this window.
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="inline-flex items-center justify-center w-16 h-16 mb-8 border border-red-300/60">
            <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-3xl text-brand-forest tracking-wide mb-4">
            Payment Could Not Be Completed
          </h1>
          <p className="font-sans text-sm text-brand-muted mb-2 max-w-md mx-auto">
            {errorMessage || 'Something went wrong while processing your payment.'}
          </p>
          <p className="font-serif italic text-brand-muted text-sm max-w-md mx-auto mb-10">
            No charge has been made. You can try again, or return to review your order.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Review</span>
            </button>
            <button
              onClick={onRetry}
              className="gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase px-8 py-3.5 rounded-none cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
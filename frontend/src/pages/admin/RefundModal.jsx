import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader, CheckCircle, IndianRupee } from 'lucide-react';

import { refundOrder } from '../../services/adminService';

/**
 * RefundModal
 *
 *   - Defaults to a full refund (amount field left blank)
 *   - Admin can override with a partial amount (in rupees)
 *   - Reason is optional but recommended for audit
 *   - After Razorpay confirms (instant for most methods), the parent
 *     refetches the order list and the row's status flips to Refunded
 */
export default function RefundModal({ order, isOpen, onClose, onRefunded }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  /* Reset state whenever the modal is re-opened for a different order */
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setReason('');
      setError('');
      setSuccess(null);
      setConfirming(false);
    }
  }, [isOpen, order?.id]);

  /* ESC dismiss */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape' && !confirming) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, confirming, onClose]);

  if (!order) return null;

  const fullAmount = Number(order.subtotal || 0);

  const handleConfirm = async () => {
    setError('');
    setConfirming(true);

    const numericAmount = amount.trim() ? Number(amount) : null;
    if (numericAmount != null && (isNaN(numericAmount) || numericAmount <= 0)) {
      setError('Please enter a valid amount or leave blank for a full refund.');
      setConfirming(false);
      return;
    }
    if (numericAmount != null && numericAmount > fullAmount) {
      setError(`Refund amount cannot exceed the order total ($${fullAmount.toFixed(2)}).`);
      setConfirming(false);
      return;
    }

    try {
      const result = await refundOrder(order.id, {
        amount: numericAmount,
        reason: reason.trim() || undefined,
      });

      if (result?.success) {
        setSuccess(result.refund);
        // Notify parent after a brief pause so they see the success state
        setTimeout(() => {
          onRefunded?.();
          onClose();
        }, 1800);
      } else {
        setError(result?.error || 'Refund could not be processed.');
      }
    } catch (err) {
      setError(err?.message || 'Refund failed. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={confirming ? undefined : onClose}
            className="fixed inset-0 z-[60] bg-brand-charcoal/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="refund-title"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[92vw] max-w-md bg-brand-cream border border-brand-gold/20 shadow-2xl"
          >
            {/* Header */}
            <header className="flex items-start justify-between px-6 py-5 border-b border-brand-charcoal/10">
              <div>
                <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold mb-1">
                  Issue Refund
                </p>
                <h2 id="refund-title" className="font-serif text-xl text-brand-forest tracking-wide">
                  {order.order_number}
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={confirming}
                className="text-brand-muted hover:text-brand-forest transition-colors disabled:opacity-40 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </header>

            {/* Body */}
            {success ? (
              <SuccessBody refund={success} />
            ) : (
              <div className="px-6 py-6 space-y-5">
                {/* Customer context */}
                <div className="bg-white border border-brand-charcoal/5 p-4 space-y-1">
                  <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted">
                    Customer
                  </p>
                  <p className="font-sans text-sm text-brand-charcoal font-medium">
                    {order.customer_name}
                  </p>
                  <p className="font-sans text-[11px] text-brand-muted">
                    {order.customer_email}
                  </p>
                  <p className="font-serif text-lg text-brand-forest pt-2 tabular-nums">
                    Order Total: ${fullAmount.toFixed(2)}
                  </p>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2.5 p-3 bg-amber-50/70 border border-amber-200 text-amber-900 font-sans text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>
                    This action cannot be undone. The refund will be processed through Razorpay and the order will be marked as Refunded.
                  </span>
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="refund-amount" className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
                    Refund Amount (INR)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted/60" strokeWidth={1.5} />
                    <input
                      id="refund-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Leave blank for full refund"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); if (error) setError(''); }}
                      disabled={confirming}
                      className="w-full bg-white border border-brand-charcoal/10 pl-9 pr-4 py-3 font-sans text-sm text-brand-charcoal tabular-nums focus:outline-none focus:border-brand-gold transition-colors disabled:opacity-50"
                    />
                  </div>
                  <p className="font-sans text-[10px] text-brand-muted">
                    Enter amount in rupees. Blank = full refund of ${fullAmount.toFixed(2)} (≈ ₹{Math.round(fullAmount * 83)}).
                  </p>
                </div>

                {/* Reason */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="refund-reason" className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
                    Reason (optional)
                  </label>
                  <textarea
                    id="refund-reason"
                    rows="3"
                    placeholder="Customer requested cancellation; product damaged; etc."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={confirming}
                    className="bg-white border border-brand-charcoal/10 px-4 py-3 font-sans text-sm text-brand-charcoal resize-none focus:outline-none focus:border-brand-gold transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50/70 border border-red-200/60 text-red-700 font-sans text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            {!success && (
              <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-brand-charcoal/10 bg-white/40">
                <button
                  onClick={onClose}
                  disabled={confirming}
                  className="font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors px-4 py-2.5 disabled:opacity-40 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="font-sans text-[11px] uppercase tracking-widest font-bold text-white bg-red-700 hover:bg-red-800 px-5 py-2.5 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {confirming ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing…</span>
                    </>
                  ) : (
                    <span>Confirm Refund</span>
                  )}
                </button>
              </footer>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SuccessBody({ refund }) {
  return (
    <div className="px-6 py-10 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 border border-emerald-300 bg-emerald-50 mb-6">
        <CheckCircle className="w-5 h-5 text-emerald-700" strokeWidth={1.5} />
      </div>
      <p className="font-sans text-[10px] uppercase tracking-widest text-emerald-700 mb-2">
        Refund {refund.status === 'processed' ? 'Processed' : 'Initiated'}
      </p>
      <h3 className="font-serif text-xl text-brand-forest tracking-wide mb-3">
        ₹{Number(refund.amount).toFixed(2)} refunded
      </h3>
      <p className="font-sans text-xs text-brand-muted">
        Razorpay ID: <span className="font-medium text-brand-charcoal">{refund.id}</span>
      </p>
      <p className="font-sans text-[11px] text-brand-muted mt-3">
        Order status will update to Refunded automatically.
      </p>
    </div>
  );
}
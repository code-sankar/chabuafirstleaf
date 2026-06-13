import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';

import {
  selectCartItems,
  selectUser,
  clearCart,
  setCheckoutCurrency,
} from '../../store';
import { initiateCheckout, verifyPayment } from '../../services/orderService';
import { currencyForCountry } from '../../utils/currency';
import env from '../../config/env';

import CheckoutStepper from '../../components/checkout/CheckoutStepper';
import CartReviewStep from '../../components/checkout/CartReviewStep';
import ShippingStep from '../../components/checkout/ShippingStep';
import ReviewStep, { computeBreakdown } from '../../components/checkout/ReviewStep';
import PaymentStep from '../../components/checkout/PaymentStep';
import ConfirmationStep from '../../components/checkout/ConfirmationStep';

/* ─── Razorpay script loader (idempotent) ────────────────────── */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ─── Steps machine ──────────────────────────────────────────── */
const STEPS = ['cart', 'shipping', 'review', 'payment', 'confirmation'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const user = useSelector(selectUser);

  const [step, setStep] = useState('cart');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle | processing | verifying | error
  const [errorMessage, setErrorMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    currency: 'INR',
  });

  /* Derive currency from country selection */
  useEffect(() => {
    const currency = currencyForCountry(form.country);
    if (currency !== form.currency) {
      setForm((prev) => ({ ...prev, currency }));
      dispatch(setCheckoutCurrency(currency));
    }
  }, [form.country, form.currency, dispatch]);

  /* Bounce away if cart becomes empty after confirmation has rendered */
  useEffect(() => {
    if (items.length === 0 && step !== 'confirmation' && step !== 'cart') {
      setStep('cart');
    }
  }, [items.length, step]);

  /* Step navigation helpers */
  const goTo = (id) => {
    if (!STEPS.includes(id)) return;
    setStep(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClose = () => navigate('/');

  /* ─── Payment flow ─────────────────────────────────────────── */
  const handlePayment = useCallback(async () => {
    setErrorMessage('');

    /* Pre-flight checks */
    if (!env.RAZORPAY_KEY) {
      setErrorMessage('Payment gateway is not configured. Please contact support.');
      setStep('payment');
      setPaymentStatus('error');
      return;
    }
    if (!navigator.onLine) {
      setErrorMessage('No network connection. Please check your internet and try again.');
      setStep('payment');
      setPaymentStatus('error');
      return;
    }

    setStep('payment');
    setPaymentStatus('processing');

    /* Load Razorpay script if needed */
    const ok = await loadRazorpayScript();
    if (!ok) {
      setErrorMessage('Could not load the secure payment provider. Please try again.');
      setPaymentStatus('error');
      return;
    }

    try {
      /* Step 1: Create Razorpay order on our backend */
      const { razorpayOrderId, amount, currency } = await initiateCheckout({
        items,
        customerDetails: form,
        currency: form.currency,
      });

      /* Step 2: Open Razorpay overlay */
      const rzp = new window.Razorpay({
        key: env.RAZORPAY_KEY,
        amount,
        currency,
        name: 'Chabua First Leaf',
        description: 'Premium Tea Allocation',
        order_id: razorpayOrderId,
        theme: { color: '#0F2E25' },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          country: form.country,
          delivery_to: `${form.city}, ${form.state}`,
        },
        handler: async (paymentResponse) => {
          setPaymentStatus('verifying');
          try {
            const result = await verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              items,
              customerDetails: {
                name: form.name,
                email: form.email,
                phone: form.phone,
                addressBlock: {
                  street: form.address,
                  city: form.city,
                  state: form.state,
                  country: form.country,
                  zip: form.postalCode,
                },
              },
            });

            if (result.success) {
              setOrderNumber(result.orderNumber);
              dispatch(clearCart());
              setStep('confirmation');
            } else {
              throw new Error(result.error || 'Payment verification failed.');
            }
          } catch (verifyErr) {
            setErrorMessage(verifyErr.message || 'Payment verification failed. Please contact support.');
            setPaymentStatus('error');
          }
        },
        modal: {
          ondismiss: () => {
            /* User closed Razorpay overlay without paying — return to review */
            setStep('review');
            setPaymentStatus('idle');
          },
        },
      });

      rzp.on('payment.failed', (failure) => {
        setErrorMessage(failure.error?.description || 'Payment was declined. Please try another method.');
        setPaymentStatus('error');
      });

      rzp.open();
    } catch (err) {
      setErrorMessage(err.message || 'Could not initiate checkout. Please try again.');
      setPaymentStatus('error');
    }
  }, [items, form, dispatch]);

  /* ─── Step renderers ───────────────────────────────────────── */
  const showStepper = step !== 'confirmation';

  return (
    <>
      <Helmet>
        <title>Checkout · Chabua First Leaf</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-brand-cream text-brand-charcoal">
        {/* Sticky checkout header — separate from main navbar */}
        <header className="w-full bg-white border-b border-brand-gold/10 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Return to Store</span>
            </button>

            <span className="font-serif text-base md:text-lg tracking-[0.2em] text-brand-forest">
              CHABUA <span className="text-brand-gold/40 mx-1">·</span> FIRST LEAF
            </span>

            <div className="font-sans text-[10px] uppercase tracking-widest text-brand-gold font-medium flex items-center gap-1.5">
              <Lock className="w-3 h-3" strokeWidth={1.5} />
              <span className="hidden sm:inline">Secure Checkout</span>
            </div>
          </div>

          {showStepper && (
            <div className="border-t border-brand-forest/5 py-5 px-6">
              <CheckoutStepper currentStep={step} />
            </div>
          )}
        </header>

        <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
          <AnimatePresence mode="wait">
            {step === 'cart' && (
              <CartReviewStep
                key="cart"
                items={items}
                currency={form.currency}
                onContinue={() => goTo('shipping')}
                onClose={handleClose}
              />
            )}

            {step === 'shipping' && (
              <ShippingStep
                key="shipping"
                form={form}
                onChange={setForm}
                onBack={() => goTo('cart')}
                onContinue={() => goTo('review')}
              />
            )}

            {step === 'review' && (
              <ReviewStep
                key="review"
                items={items}
                form={form}
                currency={form.currency}
                onBack={() => goTo('shipping')}
                onEditShipping={() => goTo('shipping')}
                onPay={handlePayment}
                isProcessing={paymentStatus === 'processing'}
              />
            )}

            {step === 'payment' && (
              <PaymentStep
                key="payment"
                status={paymentStatus}
                errorMessage={errorMessage}
                onRetry={handlePayment}
                onBack={() => { setPaymentStatus('idle'); goTo('review'); }}
              />
            )}

            {step === 'confirmation' && (
              <ConfirmationStep
                key="confirmation"
                orderNumber={orderNumber}
                email={form.email}
                isAuthenticated={Boolean(user)}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
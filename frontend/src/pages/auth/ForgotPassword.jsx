import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader, AlertCircle, ArrowLeft, Mail } from 'lucide-react';

import { sendPasswordResetEmail, readableAuthError } from '../../services/authService';
import { validateEmail } from '../../utils/validation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailErr = validateEmail(email);
    if (emailErr) { setError(emailErr); return; }

    setSubmitting(true);
    const { error: authErr } = await sendPasswordResetEmail(email);
    setSubmitting(false);

    if (authErr) {
      setError(readableAuthError(authErr));
      return;
    }
    setSent(true);
  };

  return (
    <>
      <Helmet>
        <title>Reset Password · Chabua First Leaf</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-brand-cream flex">
        {/* LEFT — editorial panel */}
        <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-forest">
          <img
            src="https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&q=80&w=1400"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-forest/85 via-brand-forest/50 to-brand-forest/85" />

          <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-brand-cream w-full">
            <Link to="/" className="font-serif text-lg tracking-[0.2em] hover:opacity-80 transition-opacity">
              <span className="font-light">CHABUA</span>
              <span className="text-brand-gold/40 mx-2 font-light">·</span>
              <span className="font-light">FIRST LEAF</span>
            </Link>

            <div className="max-w-md">
              <div className="w-12 h-[0.5px] bg-brand-gold/60 mb-8" />
              <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/80 mb-3">
                Account Recovery
              </p>
              <h2 className="font-serif text-4xl xl:text-5xl tracking-wide leading-tight font-light">
                A quiet moment of restoration.
              </h2>
              <p className="font-serif italic text-brand-cream/70 mt-6 text-lg leading-relaxed">
                We'll send a secure link to your inbox so you can set a new password and return to your archive.
              </p>
            </div>

            <p className="font-sans text-[10px] tracking-widest uppercase text-brand-cream/40">
              Assam · London · New York · Dubai
            </p>
          </div>
        </aside>

        {/* RIGHT — form */}
        <section className="w-full lg:w-1/2 flex flex-col px-6 md:px-12 lg:px-16 xl:px-24 py-10 lg:py-16">
          <div className="flex items-center justify-between mb-12">
            <Link to="/login" className="font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
            <Link to="/" className="lg:hidden font-serif text-base tracking-[0.2em] text-brand-forest">
              <span className="font-light">CHABUA</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full"
          >
            {sent ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 border border-brand-gold/30 mb-8">
                  <Mail className="w-5 h-5 text-brand-gold" strokeWidth={1.5} />
                </div>
                <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-3">
                  Check Your Inbox
                </p>
                <h1 className="font-serif text-3xl text-brand-forest tracking-wide mb-4">
                  Reset Link Sent
                </h1>
                <p className="font-serif italic text-brand-muted leading-relaxed mb-8">
                  We've sent a password reset link to{' '}
                  <strong className="font-sans not-italic text-brand-charcoal">{email}</strong>.
                  Click the link to set a new password.
                </p>
                <p className="font-sans text-xs text-brand-muted/70 mb-8">
                  Didn't receive the email? Check your spam folder, or try again in a few minutes.
                </p>
                <Link
                  to="/login"
                  className="inline-block font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            ) : (
              <>
                <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-3">
                  Account Recovery
                </p>
                <h1 className="font-serif text-4xl text-brand-forest tracking-wide mb-3">
                  Reset Your Password
                </h1>
                <p className="font-serif italic text-brand-muted mb-10">
                  Enter your account email and we'll send you a secure link to choose a new password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="forgot-email" className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
                      Email Address
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                      className="bg-white border border-brand-forest/10 px-4 py-3 font-sans text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50/60 border border-red-200/60 text-red-700 font-sans text-xs">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase py-4 flex items-center justify-center gap-2 rounded-none disabled:opacity-50 cursor-pointer"
                  >
                    {submitting
                      ? <><Loader className="w-3.5 h-3.5 animate-spin" /><span>Sending Link…</span></>
                      : <span>Send Reset Link</span>}
                  </button>
                </form>

                <p className="font-sans text-xs text-brand-muted text-center mt-8">
                  Remember your password?{' '}
                  <Link to="/login" className="text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </motion.div>
        </section>
      </div>
    </>
  );
}
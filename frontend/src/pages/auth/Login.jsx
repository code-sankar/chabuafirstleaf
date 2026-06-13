import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader, AlertCircle, ArrowLeft } from 'lucide-react';

import {
  signInWithPassword,
  signInWithGoogle,
  readableAuthError,
} from '../../services/authService';
import { validateEmail } from '../../utils/validation';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || location.state?.returnTo || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailErr = validateEmail(email);
    if (emailErr) { setError(emailErr); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setSubmitting(true);
    const { error: authErr } = await signInWithPassword({ email, password });
    setSubmitting(false);

    if (authErr) {
      setError(readableAuthError(authErr));
      return;
    }
    navigate(returnTo, { replace: true });
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    const { error: authErr } = await signInWithGoogle(returnTo);
    if (authErr) {
      setError(readableAuthError(authErr));
      setGoogleLoading(false);
    }
    /* On success, Supabase redirects away from this page */
  };

  return (
    <>
      <Helmet>
        <title>Sign In · Chabua First Leaf</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-brand-cream flex">
        {/* LEFT — editorial atmosphere panel (hidden on mobile) */}
        <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-forest">
          <img
            src="https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&q=80&w=1400"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-forest/80 via-brand-forest/40 to-brand-forest/80" />

          <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-brand-cream w-full">
            <Link
              to="/"
              className="font-serif text-lg tracking-[0.2em] hover:opacity-80 transition-opacity"
            >
              <span className="font-light">CHABUA</span>
              <span className="text-brand-gold/40 mx-2 font-light">·</span>
              <span className="font-light">FIRST LEAF</span>
            </Link>

            <div className="max-w-md">
              <div className="w-12 h-[0.5px] bg-brand-gold/60 mb-8" />
              <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/80 mb-3">
                Est. 1837 · Chabua, Assam
              </p>
              <h2 className="font-serif text-4xl xl:text-5xl tracking-wide leading-tight font-light">
                Where India's tea story began.
              </h2>
              <p className="font-serif italic text-brand-cream/70 mt-6 text-lg leading-relaxed">
                The Chabua estate has been cultivating orthodox Assam since the dawn of Indian tea. Sign in to revisit your reserve.
              </p>
            </div>

            <p className="font-sans text-[10px] tracking-widest uppercase text-brand-cream/40">
              Assam · London · New York · Dubai
            </p>
          </div>
        </aside>

        {/* RIGHT — form panel */}
        <section className="w-full lg:w-1/2 flex flex-col px-6 md:px-12 lg:px-16 xl:px-24 py-10 lg:py-16">
          <div className="flex items-center justify-between mb-12">
            <Link
              to="/"
              className="font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Store</span>
            </Link>
            <Link
              to="/"
              className="lg:hidden font-serif text-base tracking-[0.2em] text-brand-forest"
            >
              <span className="font-light">CHABUA</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full"
          >
            <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-3">
              Returning Customer
            </p>
            <h1 className="font-serif text-4xl text-brand-forest tracking-wide mb-3">
              Sign In
            </h1>
            <p className="font-serif italic text-brand-muted mb-10">
              Access your account, orders, and saved reserves.
            </p>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || submitting}
              className="w-full flex items-center justify-center gap-3 border border-brand-forest/15 bg-white hover:bg-brand-cream/40 transition-colors py-3.5 font-sans text-[12px] tracking-wide text-brand-charcoal disabled:opacity-50 cursor-pointer"
            >
              {googleLoading ? (
                <Loader className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <GoogleMark />
              )}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-[0.5px] bg-brand-forest/10" />
              <span className="font-sans text-[10px] uppercase tracking-widest text-brand-muted/50">
                Or sign in with email
              </span>
              <div className="flex-1 h-[0.5px] bg-brand-forest/10" />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-email" className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  className="bg-white border border-brand-forest/10 px-4 py-3 font-sans text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <label htmlFor="login-password" className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-sans text-[10px] uppercase tracking-widest text-brand-muted/70 hover:text-brand-forest transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
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
                disabled={submitting || googleLoading}
                className="w-full gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase py-4 flex items-center justify-center gap-2 rounded-none disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing In…</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <p className="font-sans text-xs text-brand-muted text-center mt-8">
              New to Chabua First Leaf?{' '}
              <Link to="/signup" className="text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors">
                Create an account
              </Link>
            </p>
          </motion.div>
        </section>
      </div>
    </>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
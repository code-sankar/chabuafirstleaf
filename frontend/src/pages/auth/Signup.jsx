import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

import {
  signUpWithPassword,
  signInWithGoogle,
  readableAuthError,
} from '../../services/authService';
import {
  validateEmail,
  validatePassword,
  validateRequired,
} from '../../utils/validation';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/account';

  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const nameErr     = validateRequired(form.fullName, 'Full name');
    const emailErr    = validateEmail(form.email);
    const passwordErr = validatePassword(form.password);
    const firstErr = nameErr || emailErr || passwordErr;
    if (firstErr) { setError(firstErr); return; }

    setSubmitting(true);
    const { data, error: authErr } = await signUpWithPassword({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
    });
    setSubmitting(false);

    if (authErr) {
      setError(readableAuthError(authErr));
      return;
    }

    /* Supabase returns user + session immediately if email confirmation is off.
       If confirmation is on, session is null and an email is sent. */
    if (data?.session) {
      navigate(returnTo, { replace: true });
    } else {
      setEmailSent(true);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    const { error: authErr } = await signInWithGoogle(returnTo);
    if (authErr) {
      setError(readableAuthError(authErr));
      setGoogleLoading(false);
    }
  };

  /* ─── Email confirmation pending screen ────────────────────── */
  if (emailSent) {
    return (
      <SuccessScreen email={form.email} />
    );
  }

  return (
    <>
      <Helmet>
        <title>Create Account · Chabua First Leaf</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-brand-cream flex">
        {/* LEFT — editorial image */}
        <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-forest">
          <img
            src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=1400"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-forest/80 via-brand-forest/40 to-brand-forest/85" />

          <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-brand-cream w-full">
            <Link to="/" className="font-serif text-lg tracking-[0.2em] hover:opacity-80 transition-opacity">
              <span className="font-light">CHABUA</span>
              <span className="text-brand-gold/40 mx-2 font-light">·</span>
              <span className="font-light">FIRST LEAF</span>
            </Link>

            <div className="max-w-md">
              <div className="w-12 h-[0.5px] bg-brand-gold/60 mb-8" />
              <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/80 mb-3">
                Become a Patron
              </p>
              <h2 className="font-serif text-4xl xl:text-5xl tracking-wide leading-tight font-light">
                Curate your own tea archive.
              </h2>
              <p className="font-serif italic text-brand-cream/70 mt-6 text-lg leading-relaxed">
                Members receive early access to seasonal flushes, private estate releases, and the keeping of their full order history.
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
            <Link to="/" className="font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Store</span>
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
            <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-3">
              New Account
            </p>
            <h1 className="font-serif text-4xl text-brand-forest tracking-wide mb-3">
              Create Your Account
            </h1>
            <p className="font-serif italic text-brand-muted mb-10">
              For a swifter checkout and your personal archive.
            </p>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || submitting}
              className="w-full flex items-center justify-center gap-3 border border-brand-forest/15 bg-white hover:bg-brand-cream/40 transition-colors py-3.5 font-sans text-[12px] tracking-wide text-brand-charcoal disabled:opacity-50 cursor-pointer"
            >
              {googleLoading
                ? <Loader className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                : <GoogleMark />}
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-[0.5px] bg-brand-forest/10" />
              <span className="font-sans text-[10px] uppercase tracking-widest text-brand-muted/50">
                Or with email
              </span>
              <div className="flex-1 h-[0.5px] bg-brand-forest/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <FormField
                id="signup-name"
                label="Full Name"
                value={form.fullName}
                onChange={(v) => updateField('fullName', v)}
                autoComplete="name"
              />
              <FormField
                id="signup-email"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(v) => updateField('email', v)}
                autoComplete="email"
              />
              <FormField
                id="signup-password"
                label="Password"
                type="password"
                value={form.password}
                onChange={(v) => updateField('password', v)}
                autoComplete="new-password"
                hint="Minimum 8 characters"
              />

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
                {submitting
                  ? <><Loader className="w-3.5 h-3.5 animate-spin" /><span>Creating Account…</span></>
                  : <span>Create Account</span>}
              </button>
            </form>

            <p className="font-sans text-[10px] text-brand-muted/70 text-center mt-6 leading-relaxed">
              By creating an account you agree to our{' '}
              <Link to="/terms" className="text-brand-forest underline">Terms</Link> and{' '}
              <Link to="/privacy" className="text-brand-forest underline">Privacy Policy</Link>.
            </p>

            <p className="font-sans text-xs text-brand-muted text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>
        </section>
      </div>
    </>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function FormField({ id, label, type = 'text', value, onChange, autoComplete, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-brand-forest/10 px-4 py-3 font-sans text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold transition-colors"
      />
      {hint && (
        <p className="font-sans text-[10px] text-brand-muted/60 tracking-wide">{hint}</p>
      )}
    </div>
  );
}

function SuccessScreen({ email }) {
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md bg-white border border-brand-forest/5 p-10 md:p-12 text-center"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 border border-brand-gold/30 mb-8">
          <CheckCircle className="w-5 h-5 text-brand-gold" strokeWidth={1.5} />
        </div>
        <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-3">
          Almost there
        </p>
        <h1 className="font-serif text-3xl text-brand-forest tracking-wide mb-4">
          Check your inbox
        </h1>
        <p className="font-serif italic text-brand-muted leading-relaxed mb-6">
          We've sent a confirmation link to <strong className="font-sans not-italic text-brand-charcoal">{email}</strong>.
          Click it to activate your account.
        </p>
        <Link
          to="/"
          className="font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors"
        >
          Return to Store
        </Link>
      </motion.div>
    </div>
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
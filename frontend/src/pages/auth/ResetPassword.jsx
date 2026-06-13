import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader, AlertCircle, ArrowLeft, CheckCircle, Lock } from 'lucide-react';

import { supabase } from '../../services/supabaseClient';
import { updatePassword, readableAuthError } from '../../services/authService';
import { validatePassword } from '../../utils/validation';

/**
 * ResetPassword is the landing page after a user clicks the reset link
 * in their email. Supabase places them in a recovery session — they can
 * call `updateUser({ password })` while that session is active.
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [recoverySession, setRecoverySession] = useState(false);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  /* On mount, check whether Supabase placed us in a recovery session.
     The auth listener fires with PASSWORD_RECOVERY when the email link
     hash is present. */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session) {
          setRecoverySession(true);
        }
      }
    );

    /* Also check existing session in case we arrived after the event fired */
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setRecoverySession(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const pwErr = validatePassword(form.password);
    if (pwErr) { setError(pwErr); return; }
    if (form.password !== form.confirm) {
      setError('The two passwords don\'t match.');
      return;
    }

    setSubmitting(true);
    const { error: err } = await updatePassword(form.password);
    setSubmitting(false);

    if (err) {
      setError(readableAuthError(err));
      return;
    }

    setSuccess(true);
    /* Redirect to account after a brief celebration */
    setTimeout(() => navigate('/account', { replace: true }), 2500);
  };

  return (
    <>
      <Helmet>
        <title>Set New Password · Chabua First Leaf</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-brand-cream flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </Link>

          <div className="bg-white border border-brand-forest/5 p-8 md:p-10">
            {!recoverySession && !success && (
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 border border-brand-gold/30 mb-6">
                  <Lock className="w-5 h-5 text-brand-gold" strokeWidth={1.5} />
                </div>
                <h1 className="font-serif text-2xl text-brand-forest tracking-wide mb-3">
                  Verifying your link…
                </h1>
                <p className="font-serif italic text-brand-muted text-sm leading-relaxed mb-6">
                  If your reset link has expired, please request a new one.
                </p>
                <Link
                  to="/forgot-password"
                  className="font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors"
                >
                  Request a new link
                </Link>
              </>
            )}

            {recoverySession && !success && (
              <>
                <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-3">
                  Account Recovery
                </p>
                <h1 className="font-serif text-3xl text-brand-forest tracking-wide mb-3">
                  Set a New Password
                </h1>
                <p className="font-serif italic text-brand-muted mb-8 leading-relaxed">
                  Choose a new password to regain access to your account.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <Field
                    id="reset-password"
                    label="New Password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(v) => { setForm((f) => ({ ...f, password: v })); if (error) setError(''); }}
                    hint="Minimum 8 characters."
                  />
                  <Field
                    id="reset-confirm"
                    label="Confirm New Password"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={(v) => { setForm((f) => ({ ...f, confirm: v })); if (error) setError(''); }}
                  />

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
                      ? <><Loader className="w-3.5 h-3.5 animate-spin" /><span>Updating…</span></>
                      : <span>Update Password</span>}
                  </button>
                </form>
              </>
            )}

            {success && (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-14 h-14 border border-brand-gold/30 mb-6">
                  <CheckCircle className="w-5 h-5 text-brand-gold" strokeWidth={1.5} />
                </div>
                <h1 className="font-serif text-2xl text-brand-forest tracking-wide mb-3">
                  Password Updated
                </h1>
                <p className="font-serif italic text-brand-muted text-sm leading-relaxed mb-2">
                  Redirecting you to your account…
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

function Field({ id, label, type = 'text', autoComplete, value, onChange, hint }) {
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
        className="bg-brand-cream/40 border border-brand-forest/10 px-4 py-3 font-sans text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold transition-colors"
      />
      {hint && <p className="font-sans text-[10px] text-brand-muted/70 tracking-wide">{hint}</p>}
    </div>
  );
}
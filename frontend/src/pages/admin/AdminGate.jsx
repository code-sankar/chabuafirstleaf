import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Lock, Loader, Mail, AlertCircle } from 'lucide-react';
import { selectUser, selectAuthLoading } from '../../store';
import { supabase } from '../../services/supabaseClient';

/**
 * Comma-separated allow-list of admin emails, configured via env:
 *   VITE_ADMIN_EMAILS="founder@chabua.com,ops@chabua.com"
 *
 * When the list is empty (development), any authenticated user is granted access.
 * In production, populate this — or migrate to a Supabase `profiles.role` column.
 */
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAuthorizedAdmin(user) {
  if (!user?.email) return false;
  if (ADMIN_EMAILS.length === 0) return true;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export default function AdminGate({ children }) {
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);

  if (loading) return <Verifying />;
  if (!user) return <SignInPrompt />;
  if (!isAuthorizedAdmin(user)) return <UnauthorizedPrompt email={user.email} />;

  return children;
}

/* ─── Loading state ─────────────────────────────────────────── */
function Verifying() {
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center">
      <Loader className="w-5 h-5 animate-spin text-brand-gold stroke-[1.5] mr-3" />
      <span className="font-sans text-xs uppercase tracking-widest text-brand-muted">
        Verifying credentials…
      </span>
    </div>
  );
}

/* ─── Sign-in (Supabase magic link) ─────────────────────────── */
function SignInPrompt() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { error: authErr } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (authErr) throw authErr;
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send sign-in link. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-6">
      <motion.div
        className="w-full max-w-md bg-white border border-brand-forest/5 shadow-xl p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 border border-brand-gold/30 flex items-center justify-center">
            <Lock className="w-4 h-4 text-brand-gold stroke-[1.5]" />
          </div>
        </div>

        <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold text-center mb-2">
          Restricted Gateway
        </p>
        <h1 className="font-serif text-2xl text-brand-forest tracking-wide text-center mb-3 font-light">
          Admin Authentication
        </h1>
        <p className="font-serif italic text-sm text-brand-muted text-center mb-8 leading-relaxed">
          A secure sign-in link will be dispatched to your registered estate address.
        </p>

        {sent ? (
          <div className="text-center py-6">
            <Mail className="w-5 h-5 text-brand-gold mx-auto mb-4 stroke-[1.5]" />
            <p className="font-serif text-base text-brand-forest mb-2">Check your inbox</p>
            <p className="font-sans text-xs text-brand-muted leading-relaxed">
              We've sent a sign-in link to{' '}
              <strong className="text-brand-charcoal">{email}</strong>. Click the link to
              access the panel.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-email"
                className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold"
              >
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@chabuafirstleaf.com"
                className="border border-brand-forest/15 bg-brand-cream/40 px-4 py-3 font-sans text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                <p className="font-sans text-xs text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !email}
              className="w-full bg-brand-forest text-brand-cream font-sans text-[11px] tracking-widest uppercase py-4 hover:bg-brand-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin stroke-[1.5]" />
                  Dispatching link
                </>
              ) : (
                'Send Sign-In Link'
              )}
            </button>
          </form>
        )}

        <p className="font-sans text-[9px] tracking-widest uppercase text-brand-muted/40 text-center mt-8">
          256-bit Encrypted Channel · Est. 1837
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Authenticated but not allowed ─────────────────────────── */
function UnauthorizedPrompt({ email }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <Lock className="w-6 h-6 text-brand-gold mx-auto mb-6 stroke-[1.5]" />
        <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold mb-3">
          Insufficient Privileges
        </p>
        <h1 className="font-serif text-2xl text-brand-forest mb-4 tracking-wide font-light">
          Access Restricted
        </h1>
        <p className="font-serif italic text-sm text-brand-muted leading-relaxed mb-8">
          The account <strong className="text-brand-charcoal not-italic">{email}</strong> is not
          authorised to view this section.
        </p>
        <button
          onClick={handleSignOut}
          className="font-sans text-[11px] tracking-widest uppercase text-brand-forest border-b border-brand-gold/40 pb-1 hover:text-brand-gold hover:border-brand-gold transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
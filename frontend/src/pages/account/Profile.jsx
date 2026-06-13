import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';

import AccountLayout from '../../layouts/AccountLayout';
import { selectUser } from '../../store';
import {
  updateProfile,
  updatePassword,
  readableAuthError,
} from '../../services/authService';
import { validatePassword, sanitizeText } from '../../utils/validation';

export default function Profile() {
  const user = useSelector(selectUser);
  const [profile, setProfile] = useState({ fullName: '', phone: '' });
  const [profileState, setProfileState] = useState({ saving: false, success: false, error: '' });

  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirm: '' });
  const [passwordState, setPasswordState] = useState({ saving: false, success: false, error: '' });

  /* Prefill from current user metadata */
  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
      });
    }
  }, [user]);

  /* ─── Profile submit ──────────────────────────────────────── */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileState({ saving: true, success: false, error: '' });

    const { error: err } = await updateProfile({
      fullName: profile.fullName.trim(),
      phone: profile.phone.trim(),
    });

    if (err) {
      setProfileState({ saving: false, success: false, error: readableAuthError(err) });
    } else {
      setProfileState({ saving: false, success: true, error: '' });
      setTimeout(() => setProfileState((s) => ({ ...s, success: false })), 3500);
    }
  };

  /* ─── Password submit ─────────────────────────────────────── */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const pwErr = validatePassword(passwordForm.newPassword);
    if (pwErr) { setPasswordState({ saving: false, success: false, error: pwErr }); return; }
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordState({ saving: false, success: false, error: 'The two passwords don\'t match.' });
      return;
    }

    setPasswordState({ saving: true, success: false, error: '' });
    const { error: err } = await updatePassword(passwordForm.newPassword);

    if (err) {
      setPasswordState({ saving: false, success: false, error: readableAuthError(err) });
    } else {
      setPasswordState({ saving: false, success: true, error: '' });
      setPasswordForm({ newPassword: '', confirm: '' });
      setTimeout(() => setPasswordState((s) => ({ ...s, success: false })), 3500);
    }
  };

  return (
    <>
      <Helmet>
        <title>Profile · Chabua First Leaf</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <AccountLayout subtitle="Account" title="Profile">
        <div className="space-y-8 max-w-2xl">
          {/* Personal details */}
          <Card>
            <CardHeader title="Personal Details" />

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <Field
                id="profile-name"
                label="Full Name"
                value={profile.fullName}
                onChange={(v) => setProfile((p) => ({ ...p, fullName: sanitizeText(v) }))}
                autoComplete="name"
              />
              <Field
                id="profile-phone"
                label="Phone Number"
                type="tel"
                value={profile.phone}
                onChange={(v) => setProfile((p) => ({ ...p, phone: sanitizeText(v) }))}
                autoComplete="tel"
              />
              <Field
                id="profile-email"
                label="Email Address"
                value={user?.email || ''}
                onChange={() => {}}
                disabled
                hint="Contact support to change your account email."
              />

              <Feedback state={profileState} />

              <button
                type="submit"
                disabled={profileState.saving}
                className="gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase px-8 py-3.5 rounded-none disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
              >
                {profileState.saving
                  ? <><Loader className="w-3.5 h-3.5 animate-spin" /><span>Saving…</span></>
                  : <span>Save Changes</span>}
              </button>
            </form>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader title="Change Password" />

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <Field
                id="profile-new-password"
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(v) => setPasswordForm((f) => ({ ...f, newPassword: v }))}
                autoComplete="new-password"
                hint="Minimum 8 characters."
              />
              <Field
                id="profile-confirm-password"
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirm}
                onChange={(v) => setPasswordForm((f) => ({ ...f, confirm: v }))}
                autoComplete="new-password"
              />

              <Feedback state={passwordState} successMessage="Your password has been updated." />

              <button
                type="submit"
                disabled={passwordState.saving}
                className="gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase px-8 py-3.5 rounded-none disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
              >
                {passwordState.saving
                  ? <><Loader className="w-3.5 h-3.5 animate-spin" /><span>Updating…</span></>
                  : <span>Update Password</span>}
              </button>
            </form>
          </Card>
        </div>
      </AccountLayout>
    </>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function Card({ children }) {
  return (
    <section className="bg-white border border-brand-forest/5 p-6 md:p-8">
      {children}
    </section>
  );
}

function CardHeader({ title }) {
  return (
    <header className="pb-5 mb-6 border-b border-brand-forest/5">
      <h2 className="font-serif text-2xl text-brand-forest tracking-wide">{title}</h2>
    </header>
  );
}

function Field({ id, label, type = 'text', value, onChange, autoComplete, hint, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`border px-4 py-3 font-sans text-sm focus:outline-none transition-colors ${
          disabled
            ? 'bg-brand-cream/20 border-brand-forest/5 text-brand-muted cursor-not-allowed'
            : 'bg-brand-cream/40 border-brand-forest/10 text-brand-charcoal focus:border-brand-gold'
        }`}
      />
      {hint && <p className="font-sans text-[10px] text-brand-muted/70 tracking-wide">{hint}</p>}
    </div>
  );
}

function Feedback({ state, successMessage }) {
  if (state.error) {
    return (
      <div className="flex items-start gap-2 p-3 bg-red-50/60 border border-red-200/60 text-red-700 font-sans text-xs">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
        <span>{state.error}</span>
      </div>
    );
  }
  if (state.success) {
    return (
      <div className="flex items-start gap-2 p-3 bg-emerald-50/60 border border-emerald-200/60 text-emerald-700 font-sans text-xs">
        <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
        <span>{successMessage || 'Saved successfully.'}</span>
      </div>
    );
  }
  return null;
}
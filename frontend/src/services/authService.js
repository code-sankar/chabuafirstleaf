import { supabase } from './supabaseClient';

/**
 * Auth service — the single surface every UI component talks to for
 * authentication. Keeps Supabase calls out of the React tree.
 *
 * All methods resolve to { data, error } where error is null on success.
 * UI components inspect `error` and render their own messaging.
 */

/* ─── Email + password ───────────────────────────────────────── */

export async function signUpWithPassword({ email, password, fullName, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { full_name: fullName, phone: phone || null },
      emailRedirectTo: `${window.location.origin}/account`,
    },
  });
  return { data, error };
}

export async function signInWithPassword({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  return { data, error };
}

/* ─── Google OAuth ───────────────────────────────────────────── */

export async function signInWithGoogle(returnTo = '/account') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}${returnTo}`,
      queryParams: { prompt: 'select_account' },
    },
  });
  return { data, error };
}

/* ─── Password recovery ─────────────────────────────────────── */

export async function sendPasswordResetEmail(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}/reset-password` }
  );
  return { data, error };
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return { data, error };
}

/* ─── Profile ────────────────────────────────────────────────── */

export async function updateProfile({ fullName, phone }) {
  const { data, error } = await supabase.auth.updateUser({
    data: { full_name: fullName, phone: phone || null },
  });
  return { data, error };
}

/* ─── Session control ───────────────────────────────────────── */

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session ?? null, error };
}

/* ─── Friendly error mapping ────────────────────────────────── */

const SUPABASE_ERROR_MAP = {
  'Invalid login credentials': 'The email or password you entered is incorrect.',
  'Email not confirmed': 'Please confirm your email before signing in. Check your inbox.',
  'User already registered': 'An account with this email already exists. Please sign in instead.',
  'Password should be at least 6 characters': 'Your password must be at least 6 characters.',
  'Unable to validate email address: invalid format': 'Please enter a valid email address.',
};

export function readableAuthError(error) {
  if (!error) return '';
  const message = error.message || String(error);
  return SUPABASE_ERROR_MAP[message] || message;
}
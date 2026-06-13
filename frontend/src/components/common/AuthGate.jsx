import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader } from 'lucide-react';

import { selectUser, selectAuthLoading } from '../../store';

/**
 * AuthGate — wraps any page that requires a signed-in customer.
 *
 *   <Route path="/account" element={<AuthGate><Account /></AuthGate>} />
 *
 * If the auth check is still in flight, a quiet brand-aware spinner is shown
 * (much subtler than blocking the whole shell on slow connections).
 *
 * If unauthenticated, we redirect to /login and pass the current path as
 * `returnTo` so the user lands back where they were trying to go.
 */
export default function AuthGate({ children }) {
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const location = useLocation();

  if (loading) return <Verifying />;

  if (!user) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
        state={{ returnTo }}
      />
    );
  }

  return children;
}

function Verifying() {
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Loader className="w-4 h-4 animate-spin text-brand-gold" strokeWidth={1.5} />
        <span className="font-sans text-[10px] uppercase tracking-widest text-brand-muted">
          Verifying your session…
        </span>
      </div>
    </div>
  );
}
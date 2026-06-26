import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/seo/SEOHead';

export default function NotFound() {
  return (
    <>
      <SEOHead title="Page Not Found" noIndex path="/404" />
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center px-6 text-center">
        <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-5">
          Error 404
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-brand-forest leading-tight max-w-xl">
          This page has slipped from the ledger.
        </h1>
        <p className="font-sans text-sm text-brand-muted mt-5 max-w-md leading-relaxed">
          The page you are looking for may have moved or no longer exists.
          Allow us to guide you back.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <Link
            to="/"
            className="font-sans text-xs uppercase tracking-widest text-brand-forest border-b border-brand-gold/50 pb-1 hover:text-brand-gold transition-colors"
          >
            Return Home
          </Link>
          <Link
            to="/collection"
            className="font-sans text-xs uppercase tracking-widest text-brand-forest border-b border-brand-gold/50 pb-1 hover:text-brand-gold transition-colors"
          >
            Browse the Collection
          </Link>
        </div>
      </div>
    </>
  );
}
import React from 'react';
import SEOHead from '../../components/seo/SEOHead';

/**
 * LegalLayout — shared shell for policy pages.
 * Uses the existing brand tokens (brand-cream / brand-forest / brand-gold
 * / brand-charcoal / brand-muted) and the project's SEOHead component.
 */
export default function LegalLayout({ title, updated, path = '', children }) {
  return (
    <>
      <SEOHead title={title} path={path} />
      <div className="bg-brand-cream min-h-screen">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-20 md:py-28">
          <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-4">
            Chabua First Leaf
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-brand-forest leading-tight">
            {title}
          </h1>
          {updated && (
            <p className="font-sans text-xs text-brand-muted mt-4 tracking-wide">
              Last updated {updated}
            </p>
          )}

          <div className="mt-12 space-y-10">{children}</div>
        </div>
      </div>
    </>
  );
}

/** A titled section with a serif sub-heading. */
export function Section({ heading, children }) {
  return (
    <section>
      {heading && (
        <h2 className="font-serif text-2xl text-brand-forest mb-4">{heading}</h2>
      )}
      <div className="space-y-4 font-sans text-[15px] leading-relaxed text-brand-charcoal/80">
        {children}
      </div>
    </section>
  );
}
import React from 'react';
import { Helmet } from 'react-helmet-async';
import env from '../../config/env';

const DEFAULTS = {
  title: 'Chabua First Leaf — Where India\'s Tea Story Began',
  description:
    'Luxury single-origin orthodox tea from the historic estates of Chabua, Assam. Hand-plucked, small-batch crafted, and refined for connoisseurs worldwide.',
  image: `${env.SITE_URL}/og-image.jpg`,
  type: 'website',
};

/**
 * SEOHead
 *
 *   A note on security headers:
 *
 *   You may be tempted to add <meta httpEquiv="X-Frame-Options" /> or
 *   <meta httpEquiv="X-Content-Type-Options" /> here. Don't — browsers
 *   ignore both when set via meta and Chrome explicitly warns about
 *   X-Frame-Options. These must be sent as real HTTP response headers
 *   from your hosting provider:
 *
 *     • Vercel    → vercel.json  (headers array)
 *     • Netlify   → public/_headers
 *     • Express   → app.use(helmet())
 *     • Vite dev  → vite.config.js server.headers
 *
 *   The Referrer-Policy meta below IS respected by browsers — that one
 *   stays.
 */
export default function SEOHead({
  title,
  description,
  image,
  type,
  path = '',
  noIndex = false,
  product = null,
}) {
  const pageTitle = title ? `${title} — Chabua First Leaf` : DEFAULTS.title;
  const pageDescription = description || DEFAULTS.description;
  const pageImage = image || DEFAULTS.image;
  const pageType = type || DEFAULTS.type;
  const canonicalUrl = `${env.SITE_URL}${path}`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={pageType} />
      <meta property="og:site_name" content="Chabua First Leaf" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* Product-specific (for future product pages) */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content={product.currency || 'USD'} />
        </>
      )}

      {/* Referrer policy — meta tag works for this one */}
      <meta name="referrer" content="strict-origin-when-cross-origin" />
    </Helmet>
  );
}
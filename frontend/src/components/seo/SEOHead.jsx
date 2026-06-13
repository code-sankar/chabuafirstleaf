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

      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
    </Helmet>
  );
}

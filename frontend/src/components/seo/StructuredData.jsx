import React from 'react';
import { Helmet } from 'react-helmet-async';
import env from '../../config/env';

// Organization schema — appears on all pages
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Chabua First Leaf',
  url: env.SITE_URL,
  logo: `${env.SITE_URL}/logo.png`,
  description:
    'Luxury single-origin orthodox tea from the historic estates of Chabua, Assam.',
  foundingDate: '1837',
  foundingLocation: {
    '@type': 'Place',
    name: 'Chabua, Assam, India',
  },
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English'],
  },
};

// WebSite schema with search action
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Chabua First Leaf',
  url: env.SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${env.SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

function buildProductSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.story,
    sku: product.sku,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: 'Chabua First Leaf',
    },
    offers: {
      '@type': 'Offer',
      url: `${env.SITE_URL}/collection/${product.slug}`,
      priceCurrency: product.currency || 'USD',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Chabua First Leaf',
      },
    },
  };
}

export function OrganizationStructuredData() {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
    </Helmet>
  );
}

export function ProductStructuredData({ product }) {
  if (!product) return null;
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(buildProductSchema(product))}</script>
    </Helmet>
  );
}

export function BreadcrumbStructuredData({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${env.SITE_URL}${item.path}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

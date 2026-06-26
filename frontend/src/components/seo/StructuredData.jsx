import React from "react";
import { Helmet } from "react-helmet-async";
import env from "../../config/env";

// Organization schema — appears on all pages
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Chabua First Leaf",
  url: env.SITE_URL,
  logo: `${env.SITE_URL}/logo.png`,
  description:
    "Luxury single-origin orthodox tea from the historic estates of Chabua, Assam.",
  foundingDate: "1837",
  foundingLocation: {
    "@type": "Place",
    name: "Chabua, Assam, India",
  },
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English"],
  },
};

// WebSite schema with search action
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Chabua First Leaf",
  url: env.SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${env.SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

function buildProductSchema(product) {
  const inStock = (product.inventoryCount ?? 0) > 0;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.story,
    sku: product.sku,
    image: product.images,
    brand: { "@type": "Brand", name: "Chabua First Leaf" },
    offers: {
      "@type": "Offer",
      url: `${env.SITE_URL}/product/${product.slug}`,
      priceCurrency: product.currency || "USD",
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Chabua First Leaf" },
    },
  };
}

export function OrganizationStructuredData() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
}

export function ProductStructuredData({ product }) {
  if (!product) return null;
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(buildProductSchema(product))}
      </script>
    </Helmet>
  );
}
export function ArticleStructuredData({ post, path = "" }) {
  if (!post) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.subtitle || "",
    image: post.image ? [post.image] : undefined,
    datePublished: post.datePublished || undefined,
    author: { "@type": "Organization", name: "Chabua First Leaf" },
    publisher: {
      "@type": "Organization",
      name: "Chabua First Leaf",
      logo: { "@type": "ImageObject", url: `${env.SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${env.SITE_URL}${path}` },
  };
  // JSON.stringify drops the `undefined` keys, so image/date are omitted when absent.
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
export function BreadcrumbStructuredData({ items }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
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

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

function buildProductSchema(product, summary, reviews) {
  const inStock = (product.inventoryCount ?? 0) > 0;
  const schema = {
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

  // Google rejects an aggregateRating with no ratings behind it, so both
  // blocks are emitted only when real patron reviews exist.
  if (summary?.count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: summary.average,
      reviewCount: summary.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (reviews?.length > 0) {
    schema.review = reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: { "@type": "Person", name: review.authorName },
      datePublished: review.createdAt ? review.createdAt.slice(0, 10) : undefined,
      name: review.title || undefined,
      reviewBody: review.body,
    }));
  }

  return schema;
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

export function ProductStructuredData({ product, summary, reviews }) {
  if (!product) return null;
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(buildProductSchema(product, summary, reviews))}
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

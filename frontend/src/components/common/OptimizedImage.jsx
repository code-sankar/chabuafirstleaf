import React, { useState } from 'react';

/**
 * OptimizedImage — performance-first image component.
 * - Sets width/height to prevent CLS
 * - Native lazy loading
 * - Generates srcset for Unsplash images
 * - Fade-in on load for premium feel
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  sizes = '100vw',
  priority = false,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);

  // Generate responsive srcset for Unsplash images
  const srcSet = src?.includes('unsplash.com')
    ? [400, 800, 1200, 1600]
        .map((w) => {
          const url = new URL(src);
          url.searchParams.set('w', w.toString());
          url.searchParams.set('auto', 'format');
          url.searchParams.set('q', '80');
          return `${url.toString()} ${w}w`;
        })
        .join(', ')
    : undefined;

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      onLoad={() => setLoaded(true)}
      className={`transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      {...props}
    />
  );
}

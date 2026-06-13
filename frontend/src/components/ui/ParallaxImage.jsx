import React from 'react';
import { motion } from 'framer-motion';

/**
 * ParallaxImage — luxury image container with hover zoom, fade-in, and optional caption.
 * Props:
 *  - src: string (required)
 *  - alt: string (required)
 *  - caption: string (optional overlay caption)
 *  - aspectRatio: string tailwind class e.g. "aspect-[4/3]" (default)
 *  - className: additional wrapper classes
 */
export default function ParallaxImage({
  src,
  alt,
  caption,
  aspectRatio = 'aspect-[4/3]',
  className = '',
}) {
  return (
    <motion.div
      className={`overflow-hidden bg-brand-charcoal/10 border border-brand-forest/5 shadow-xl relative group ${aspectRatio} ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.2, ease: [0.215, 0.61, 0.355, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.02]"
        whileInView={{ scale: 1.04 }}
        viewport={{ once: false }}
        transition={{ duration: 2.5, ease: 'easeOut' }}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-brand-forest/10 opacity-0 group-hover:opacity-0 transition-opacity duration-700 pointer-events-none" />

      {/* Caption */}
      {caption && (
        <div className="absolute bottom-5 left-5 z-10">
          <p className="font-serif italic text-brand-cream text-sm drop-shadow-md">
            {caption}
          </p>
        </div>
      )}
    </motion.div>
  );
}
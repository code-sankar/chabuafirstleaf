import React from 'react';
import { motion } from 'framer-motion';

/**
 * Elegant divider used between major sections.
 * Three variants for visual rhythm:
 * - 'gold'    → centered gold line with diamond
 * - 'leaf'    → minimal leaf icon with thin lines
 * - 'minimal' → single thin gold line
 */
export default function SectionDivider({ variant = 'gold', className = '' }) {
  if (variant === 'minimal') {
    return (
      <motion.div
        className={`flex justify-center py-2 ${className}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="w-16 h-[0.5px] bg-brand-gold/30" />
      </motion.div>
    );
  }

  if (variant === 'leaf') {
    return (
      <motion.div
        className={`flex items-center justify-center gap-4 py-4 ${className}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <div className="w-12 md:w-20 h-[0.5px] bg-brand-gold/20" />
        <svg
          width="14"
          height="16"
          viewBox="0 0 14 16"
          fill="none"
          className="text-brand-gold/40"
          aria-hidden="true"
        >
          <path
            d="M7 0C7 0 2 4 2 9C2 12.5 4.5 15 7 16C9.5 15 12 12.5 12 9C12 4 7 0 7 0Z"
            fill="currentColor"
          />
          <line x1="7" y1="5" x2="7" y2="14" stroke="rgba(245,240,230,0.4)" strokeWidth="0.5" />
        </svg>
        <div className="w-12 md:w-20 h-[0.5px] bg-brand-gold/20" />
      </motion.div>
    );
  }

  // Default: 'gold' — diamond accent
  return (
    <motion.div
      className={`flex items-center justify-center gap-3 py-4 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.215, 0.61, 0.355, 1] }}
    >
      <div className="w-10 md:w-16 h-[0.5px] bg-gradient-to-r from-transparent to-brand-gold/30" />
      <div className="w-1.5 h-1.5 rotate-45 bg-brand-gold/40" />
      <div className="w-10 md:w-16 h-[0.5px] bg-gradient-to-l from-transparent to-brand-gold/30" />
    </motion.div>
  );
}
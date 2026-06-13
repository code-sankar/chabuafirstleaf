import React from 'react';
import { motion } from 'framer-motion';

/**
 * ScrollIndicator — animated vertical scroll hint.
 * Props:
 *  - label: string (default "Scroll To Discover")
 *  - className: additional wrapper classes
 */
export default function ScrollIndicator({ label = 'Scroll To Discover', className = '' }) {
  return (
    <motion.div
      className={`flex flex-col items-center gap-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      transition={{ delay: 5, duration: 1 }}
    >
      <span className="font-sans text-[9px] uppercase tracking-widest text-brand-cream/50">
        {label}
      </span>
      <div className="w-[1px] h-12 bg-brand-cream/20 relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full bg-brand-gold"
          style={{ height: '30%' }}
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}
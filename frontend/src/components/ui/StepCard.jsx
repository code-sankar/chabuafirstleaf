import React from 'react';
import { motion } from 'framer-motion';

/**
 * StepCard — displays a numbered process step with title and description.
 * Props:
 *  - number: string e.g. "I", "II", "01"
 *  - title: string
 *  - description: string
 *  - delay: number (animation delay in seconds)
 *  - className: additional classes
 */
export default function StepCard({ number, title, description, delay = 0, className = '' }) {
  return (
    <motion.div
      className={`bg-brand-cream/20 p-8 border border-brand-forest/5 relative flex flex-col justify-between group hover:border-brand-gold transition-colors duration-500 shadow-sm ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay }}
    >
      <div>
        <span className="block font-serif text-3xl text-brand-gold/40 font-light mb-6 group-hover:text-brand-gold transition-colors duration-500">
          {number}
        </span>
        <h3 className="font-serif text-lg font-bold text-brand-forest mb-4 tracking-wide">
          {title}
        </h3>
        <p className="font-sans font-light text-brand-muted text-xs md:text-sm leading-relaxed tracking-wide">
          {description}
        </p>
      </div>
      <div className="w-full h-[1px] bg-brand-gold/10 mt-6 group-hover:bg-brand-gold/40 transition-colors duration-500" />
    </motion.div>
  );
}
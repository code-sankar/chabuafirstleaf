import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center text-center px-6">
      <motion.div
        className="max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="font-sans text-xs tracking-widest uppercase text-brand-gold mb-6">
          Page Not Found
        </p>

        <h1 className="font-serif text-6xl md:text-8xl text-brand-forest tracking-wide mb-4 font-light">
          404
        </h1>

        <div className="w-12 h-[0.5px] bg-brand-gold/30 mx-auto mb-8" />

        <p className="font-sans font-light text-brand-muted text-sm leading-relaxed tracking-wide mb-12 max-w-sm mx-auto">
          The page you are looking for may have been moved or no longer exists.
          Let us guide you back to the estate.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="gold-shimmer-btn text-brand-charcoal font-sans text-xs font-semibold tracking-widest uppercase px-10 py-4 inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            Return Home
          </Link>
          <Link
            to="/collection"
            className="border border-brand-forest/20 text-brand-forest hover:border-brand-gold hover:text-brand-gold font-sans text-xs font-semibold tracking-widest uppercase px-10 py-4 transition-all duration-300 inline-flex items-center justify-center"
          >
            Explore Collection
          </Link>
        </div>
      </motion.div>

      <p className="absolute bottom-8 font-sans text-[10px] tracking-editorial uppercase text-brand-muted/30">
        Chabua First Leaf · Est. 1837
      </p>
    </div>
  );
}
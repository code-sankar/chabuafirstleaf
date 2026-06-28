import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setPreloaderDone } from '../../store';

const SESSION_KEY = 'cfl_visited';

export default function Preloader() {
  const dispatch = useDispatch();

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, '1');

    const timer = setTimeout(() => {
      dispatch(setPreloaderDone());
    }, 2600);

    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-brand-forest text-brand-cream"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0, pointerEvents: 'none' }}
      transition={{ delay: 2.0, duration: 0.6, ease: 'easeInOut' }}
      role="status"
      aria-label="Loading Chabua First Leaf"
    >
      <button
        onClick={() => dispatch(setPreloaderDone())}
        className="absolute top-6 right-6 font-sans text-[10px] uppercase tracking-widest text-brand-cream/40 hover:text-brand-gold transition-colors cursor-pointer border border-brand-cream/10 px-4 py-2 hover:border-brand-gold/40"
        aria-label="Skip loading animation"
      >
        Skip
      </button>

      {/* Big circular logo — the centrepiece */}
      <motion.div
        className="text-brand-gold"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <CircularLogo className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80" />
      </motion.div>

      {/* Loading shimmer line */}
      <div className="mt-10 w-24 h-[1px] bg-brand-gold/30 relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-brand-gold"
          initial={{ left: '-100%' }}
          animate={{ left: '100%' }}
          transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

/* Circular brand logo — inlined so the curved text uses the page's
   Cormorant Garamond. Colour follows `currentColor` (set via the
   text-brand-gold wrapper above). */
function CircularLogo({ className }) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <defs>
        <path id="cflp-ring-top" d="M38,120 A82,82 0 0 1 202,120" />
        <path id="cflp-ring-bottom" d="M38,120 A82,82 0 0 0 202,120" />
      </defs>

      {/* rings + separators */}
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="120" cy="120" r="104" />
        <circle cx="120" cy="120" r="98" strokeWidth="1" />
        <path d="M38,116.5 L41.5,120 L38,123.5 L34.5,120 Z" fill="currentColor" stroke="none" />
        <path d="M202,116.5 L205.5,120 L202,123.5 L198.5,120 Z" fill="currentColor" stroke="none" />
      </g>

      {/* centred mark: two leaves and a bud */}
      <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M120,74 C131,98 130,124 120,140 C110,124 109,98 120,74 Z" />
        <path d="M120,82 L120,135" />
        <g transform="translate(120,140) rotate(-112)">
          <path d="M0,0 C13,-20 14,-44 0,-54 C-14,-44 -13,-20 0,0 Z" />
          <path d="M0,-5 L0,-49" />
        </g>
        <g transform="translate(120,140) rotate(112)">
          <path d="M0,0 C13,-20 14,-44 0,-54 C-14,-44 -13,-20 0,0 Z" />
          <path d="M0,-5 L0,-49" />
        </g>
        <path d="M120,140 L120,156" />
      </g>

      {/* curved text */}
      <g fill="currentColor" fontFamily="'Cormorant Garamond','Cormorant',Georgia,serif">
        <text fontSize="15" fontWeight="600" letterSpacing="3" textAnchor="middle">
          <textPath href="#cflp-ring-top" startOffset="50%">CHABUA FIRST LEAF</textPath>
        </text>
        <text fontSize="11" fontWeight="500" letterSpacing="2" textAnchor="middle">
          <textPath href="#cflp-ring-bottom" startOffset="50%">WHERE INDIA’S TEA STORY BEGAN</textPath>
        </text>
      </g>
    </svg>
  );
}
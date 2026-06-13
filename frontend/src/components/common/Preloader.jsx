import React, { useEffect, useState } from 'react';
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
    }, 2400);

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

      <div className="text-center max-w-md px-6">
        <motion.p
          className="font-sans text-xs tracking-widest uppercase text-brand-gold mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Est. 1837 · Assam, India
        </motion.p>
        <motion.h1
          className="font-serif text-3xl md:text-4xl tracking-luxury mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Chabua First Leaf
        </motion.h1>
        <div className="w-24 h-[1px] bg-brand-gold/30 mx-auto relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-brand-gold"
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
          />
        </div>
        <motion.p
          className="font-serif italic text-sm text-brand-cream/60 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          "Where India's Tea Story Began"
        </motion.p>
      </div>
    </motion.div>
  );
}
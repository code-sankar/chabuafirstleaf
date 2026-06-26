import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * CookieConsent
 *
 *   Minimal, brand-styled consent banner for UK/EU compliance. Remembers
 *   the visitor's choice in localStorage and only re-asks if no choice
 *   exists. Mount it ONCE, high in the tree (e.g. just inside the public
 *   shell in App.jsx).
 *
 *   IMPORTANT: load non-essential / analytics scripts ONLY after consent.
 *   This component dispatches a window event you can listen for:
 *
 *     window.addEventListener('cfl:cookies-accepted', () => {
 *       // initialise analytics here
 *     });
 *
 *   Essential cookies (auth/session) may load regardless, as they are
 *   strictly necessary for the site to function.
 */

const STORAGE_KEY = 'cfl_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setVisible(true);
      else if (JSON.parse(saved)?.choice === 'accepted') {
        window.dispatchEvent(new CustomEvent('cfl:cookies-accepted'));
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const decide = (choice) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, ts: Date.now() }));
    } catch {
      /* storage blocked — honour the choice for this session only */
    }
    setVisible(false);
    if (choice === 'accepted') {
      window.dispatchEvent(new CustomEvent('cfl:cookies-accepted'));
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="fixed inset-x-4 bottom-4 z-50 md:inset-x-auto md:right-6 md:bottom-6 md:max-w-md"
        >
          <div className="bg-brand-forest text-brand-cream border border-brand-gold/20 shadow-xl p-6 md:p-7">
            <p className="font-serif text-lg mb-2">A note on cookies</p>
            <p className="font-sans text-[13px] leading-relaxed text-brand-cream/70">
              We use essential cookies to make this site work, and optional
              cookies to understand how it is used. You may accept all, or
              continue with essential only. See our{' '}
              <Link
                to="/privacy"
                className="text-brand-gold underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => decide('accepted')}
                className="flex-1 bg-brand-gold text-brand-forest font-sans text-[11px] uppercase tracking-[0.15em] py-3 transition hover:opacity-90"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={() => decide('essential')}
                className="flex-1 border border-brand-cream/30 text-brand-cream font-sans text-[11px] uppercase tracking-[0.15em] py-3 transition hover:bg-brand-cream/5"
              >
                Essential only
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
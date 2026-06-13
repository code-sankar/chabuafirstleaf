import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Loader } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function EmailWaitlist() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ name: formData.name, email: formData.email }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('This email has already been reserved for the early collection.');
        }
        throw error;
      }

      setStatus({ type: 'success', message: 'You have been added to our private list.' });
      setFormData({ name: '', email: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-brand-forest-deep text-brand-cream py-28 md:py-36 px-6 md:px-12 relative overflow-hidden grain-overlay">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center relative z-10">

        {/* Header */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="w-8 h-[0.5px] bg-brand-gold/30" />
          <span className="font-sans text-[10px] tracking-editorial uppercase text-brand-gold/60">
            First Access
          </span>
          <div className="w-8 h-[0.5px] bg-brand-gold/30" />
        </motion.div>

        <motion.h2
          className="font-serif text-3xl md:text-5xl text-brand-cream/90 tracking-wide font-light mb-6"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          Join The First Pour
        </motion.h2>

        <motion.p
          className="font-sans font-light text-sm text-brand-cream/35 max-w-md mx-auto mb-14 leading-[1.9] tracking-wide"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Our seasonal harvests are allocated to registered collectors before
          public availability. Reserve your place for the inaugural selections.
        </motion.p>

        {/* Form */}
        {status.type === 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-brand-gold">
              <Check className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-serif text-lg font-light tracking-wide">{status.message}</span>
            </div>
            <p className="font-sans text-[11px] text-brand-cream/25 tracking-wide">
              We will be in touch before the next harvest window.
            </p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubscribe}
            className="space-y-4 max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="waitlist-name" className="sr-only">Full Name</label>
                <input
                  id="waitlist-name"
                  type="text"
                  placeholder="Full Name"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-brand-cream/[0.06] border border-brand-cream/8 px-5 py-4 font-sans text-sm text-brand-cream placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/30 transition-colors tracking-wide"
                />
              </div>
              <div>
                <label htmlFor="waitlist-email" className="sr-only">Email Address</label>
                <input
                  id="waitlist-email"
                  type="email"
                  placeholder="Email Address"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-brand-cream/[0.06] border border-brand-cream/8 px-5 py-4 font-sans text-sm text-brand-cream placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/30 transition-colors tracking-wide"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-medium tracking-editorial uppercase py-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Reserve My Place</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </>
              )}
            </button>

            {status.type === 'error' && (
              <p className="font-sans text-[11px] text-red-300/70 tracking-wide" role="alert">
                {status.message}
              </p>
            )}

            <p className="font-sans text-[10px] text-brand-cream/15 tracking-wide leading-relaxed">
              We respect your privacy. No spam. Unsubscribe with a single click.
            </p>
          </motion.form>
        )}
      </div>
    </section>
  );
}
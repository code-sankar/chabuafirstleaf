import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Heritage from '../../sections/Heritage.jsx';
import Estate from '../../sections/Estate.jsx';
import Craftsmanship from '../../sections/Craftsmanship.jsx';
import EmailWaitlist from '../../sections/EmailWaitlist.jsx';

export default function OurStory() {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal pt-20">

      {/* Hero Banner */}
      <section className="relative h-[60vh] flex items-end overflow-hidden bg-brand-charcoal">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=1800"
            alt="Chabua tea estate at dawn"
            className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-brand-charcoal/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pb-16 w-full">
          <motion.p
            className="font-sans text-xs tracking-widest uppercase text-brand-gold mb-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Est. 1837 • Chabua, Upper Assam
          </motion.p>
          <motion.h1
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-brand-cream tracking-wide leading-tight max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            The Origin Account
          </motion.h1>
        </div>
      </section>

      {/* Opening Statement */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 lg:px-24 py-24 text-center">
        <motion.p
          className="font-serif italic text-xl md:text-2xl lg:text-3xl text-brand-forest/80 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          "Long before Darjeeling was planted, before Ceylon was cultivated, before the world
          knew the word 'chai'—there was Chabua. The cradle of India's tea legacy."
        </motion.p>
        <div className="w-16 h-[1px] bg-brand-gold/40 mx-auto mt-10" />
      </section>

      {/* Heritage Section */}
      <Heritage />

      {/* Estate Section */}
      <Estate />

      {/* Mission Statement Block */}
      <section className="bg-brand-forest text-brand-cream py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-brand-gold mb-4">
              Our Purpose
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-wide leading-tight mb-8">
              Preserving What the World Almost Forgot
            </h2>
            <p className="font-sans font-light text-brand-cream/70 text-sm md:text-base leading-relaxed tracking-wide mb-6">
              Industrial tea production has homogenized flavor, commoditized craft, and severed
              the connection between leaf and legacy. We exist to reverse that — one small batch at a time.
            </p>
            <p className="font-sans font-light text-brand-cream/70 text-sm md:text-base leading-relaxed tracking-wide">
              Every tin of Chabua First Leaf carries the coordinates of the exact garden plot,
              the name of the seasonal harvest cycle, and the initials of the artisan who
              oversaw the withering process. This is traceability as a luxury standard.
            </p>
          </div>
          <div className="space-y-6">
            {[
              { num: "1837", label: "Year Chabua's first organized cultivation began" },
              { num: "100%", label: "Whole-leaf orthodox processing. Zero CTC compromise" },
              { num: "3-Day", label: "Seasonal plucking window for first flush selections" },
              { num: "18hr", label: "Nocturnal wither cycle for our Clonal Imperial reserve" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-6 border-b border-brand-cream/10 pb-6 last:border-0"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <span className="font-serif text-3xl text-brand-gold font-light w-24 shrink-0">
                  {stat.num}
                </span>
                <p className="font-sans font-light text-brand-cream/70 text-sm tracking-wide">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <Craftsmanship />

      {/* CTA Block */}
      <section className="bg-brand-cream py-24 px-6 md:px-12 lg:px-24 text-center border-t border-brand-gold/10">
        <motion.p
          className="font-sans text-xs tracking-widest uppercase text-brand-gold mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Begin Your Journey
        </motion.p>
        <motion.h2
          className="font-serif text-3xl md:text-5xl text-brand-forest tracking-wide mb-8"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Taste Where History Was Grown
        </motion.h2>
        <Link
          to="/collection"
          className="inline-block gold-shimmer-btn text-brand-charcoal font-sans text-xs font-bold tracking-widest uppercase px-12 py-5"
        >
          Explore The Collection
        </Link>
      </section>

      <EmailWaitlist />
    </div>
  );
}
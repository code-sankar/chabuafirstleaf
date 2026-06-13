import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-brand-charcoal flex items-center justify-center">
      
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover scale-105 filter brightness-[0.65] contrast-[1.05]"
        >
          {/* Ensure a smooth looping luxury video clip is placed inside public assets */}
          <source src="/assets/video/assam-gardens.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-dark-overlay" />
      </div>

      {/* Hero Typography Context */}
      <div className="relative z-10 text-center max-w-4xl px-6 flex flex-col items-center">
        <motion.span 
          className="font-sans text-xs md:text-sm tracking-widest uppercase text-brand-gold mb-6 inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1 }}
        >
          Established at the Genesis of Indian Tea Heritage
        </motion.span>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-brand-cream tracking-wide leading-[1.1] mb-8 overflow-hidden">
          <motion.span
            className="block"
            initial={{ translateY: "100%" }}
            animate={{ translateY: "0%" }}
            transition={{ duration: 1.4, delay: 1.6, ease: [0.215, 0.610, 0.355, 1] }}
          >
            Where India's Tea Story Began
          </motion.span>
        </h1>

        <motion.p 
          className="font-sans font-light text-brand-cream/80 text-sm md:text-lg max-w-2xl leading-relaxed tracking-wide mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.8 }}
        >
          From the historic tea-growing landscapes of Chabua, Assam, we craft small-batch luxury tea rooted in heritage and refined for the modern world.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 2.0 }}
        >
          <a href="#product" className="gold-shimmer-btn text-brand-charcoal font-sans text-xs font-semibold tracking-widest uppercase px-10 py-5 rounded-none">
            Explore Collection
          </a>
          <a href="#heritage" className="border border-brand-cream/40 text-brand-cream hover:border-brand-gold hover:text-brand-gold font-sans text-xs font-semibold tracking-widest uppercase px-10 py-5 transition-all duration-300">
            Our Story
          </a>
        </motion.div>
      </div>

      {/* Elegant Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 5.2, duration: 1 }}
      >
        <span className="font-sans text-[9px] uppercase tracking-widest text-brand-cream/50">Scroll To Discover</span>
        <div className="w-[1px] h-12 bg-brand-cream/20 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 w-full bg-brand-gold"
            style={{ height: '30%' }}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
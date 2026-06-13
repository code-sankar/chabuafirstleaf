import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const premiumReviews = [
  {
    quote: "The Assam Orthodox Gold is a masterclass in balance. Its deep malty profile carries none of the typical astringency found in commercial harvests, revealing structured layers of cacao and dried fruit with subsequent pour cycles.",
    author: "Lord Charles V.",
    location: "London, UK",
    designation: "Fine Tea Connoisseur",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
  },
  {
    quote: "Chabua First Leaf has single-handedly elevated Indian tea to its rightful place alongside the rarest vintage wines. The Clonal Imperial reserve is structural artistry—unbelievably crisp and incredibly aromatic.",
    author: "Elena R.",
    location: "Milan, Italy",
    designation: "Scent & Terroir Specialist",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"
  },
  {
    quote: "An extraordinary sensory acquisition. The ancestral wood-fire smoking of their Souchong is calculated with immense precision, resulting in a velvety, deeply atmospheric liquor that remains completely unforgettable.",
    author: "Hassan Al-M.",
    location: "Dubai, UAE",
    designation: "Private Collection Curator",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800"
  }
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 9000);
    return () => clearInterval(timer);
  }, [index]);

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev === 0 ? premiumReviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev === premiumReviews.length - 1 ? 0 : prev + 1));
  };

  const slideVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 30 : -30
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.215, 0.610, 0.355, 1] }
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -30 : 30,
      transition: { duration: 0.4, ease: [0.215, 0.610, 0.355, 1] }
    })
  };

  return (
    <section id="testimonials" className="bg-brand-forest text-brand-cream py-32 px-6 md:px-12 lg:px-24 relative overflow-hidden border-b border-brand-gold/10">
      
      {/* Editorial Watermark background */}
      <div className="absolute left-12 top-12 opacity-[0.03] select-none pointer-events-none hidden lg:block">
        <Quote className="w-56 h-56 stroke-[0.5] text-brand-gold" />
      </div>

      <div className="max-w-6xl mx-auto">
        <p className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-16 text-center lg:text-left">
          Global Valuations
        </p>

        {/* SPLIT COLUMN ARCHITECTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* LEFT COLUMN: Fixed-Height Typography Canvas */}
          <div className="lg:col-span-7 flex flex-col justify-between order-2 lg:order-1">
            
            {/* 
              HEIGHT CLAMP FRAME: Keeps text variations up to 350 characters 
              completely isolated. The outer grid frame remains perfectly rigid.
            */}
            <div className="w-full h-[220px] sm:h-[150px] lg:h-[180px] relative flex items-center">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={index}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute w-full flex flex-col justify-center"
                >
                  <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-light italic leading-relaxed tracking-wide text-white text-center lg:text-left">
                    "{premiumReviews[index].quote}"
                  </h3>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* STABLE METADATA ANCHOR */}
            <div className="mt-8 text-center lg:text-left border-t border-brand-gold/20 pt-6">
              <p className="font-serif text-lg text-brand-gold tracking-wide font-medium">
                {premiumReviews[index].author}
              </p>
              <p className="font-sans text-xs uppercase tracking-widest text-brand-cream/60 mt-1">
                {premiumReviews[index].designation} • <span className="italic">{premiumReviews[index].location}</span>
              </p>
            </div>

            {/* MINIMAL NAVIGATION CONTROLS */}
            <div className="flex items-center justify-center lg:justify-start gap-6 mt-12">
              <button 
                onClick={handlePrev}
                className="p-3 border border-brand-cream/10 rounded-none hover:border-brand-gold hover:text-brand-gold text-brand-cream/60 transition-all duration-300 group cursor-pointer"
                aria-label="Previous valuation"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              </button>

              <div className="flex gap-1.5">
                {premiumReviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > index ? 1 : -1);
                      setIndex(idx);
                    }}
                    className={`h-[2px] transition-all duration-500 cursor-pointer ${
                      index === idx ? 'w-6 bg-brand-gold' : 'w-2 bg-brand-cream/20 hover:bg-brand-cream/40'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button 
                onClick={handleNext}
                className="p-3 border border-brand-cream/10 rounded-none hover:border-brand-gold hover:text-brand-gold text-brand-cream/60 transition-all duration-300 group cursor-pointer"
                aria-label="Next valuation"
              >
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Large Square Editorial Portrait Display */}
          <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
            <div className="w-full max-w-[340px] lg:max-w-none aspect-square bg-brand-charcoal/20 border border-brand-gold/30 p-3 shadow-2xl relative group">
              
              {/* Inner Decorative Accent Frame Corners */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-brand-gold" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-brand-gold" />

              <div className="w-full h-full overflow-hidden relative">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.img
                    key={index}
                    src={premiumReviews[index].image}
                    alt={premiumReviews[index].author}
                    className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.05] grayscale-[20%]"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.215, 0.610, 0.355, 1] }}
                  />
                </AnimatePresence>
                {/* Micro Ambient Shading Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/30 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
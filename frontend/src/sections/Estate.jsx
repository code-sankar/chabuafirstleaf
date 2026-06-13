import React from 'react';
import { motion } from 'framer-motion';

const estateChapters = [
  {
    id: "01",
    subtitle: "The Terroir",
    title: "Nurtured by the Brahmaputra Mist",
    description: "Our micro-gardens sit tightly nestled along the rich alluvial basins of Upper Assam. Here, the unique combination of nutrient-rich volcanic topsoil and intense morning moisture yields an unparalleled leaf canvas rich in natural oils and complex enzymes.",
    image: "https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&q=80&w=1200",
    alt: "Morning fog draping over sprawling low-lying orthodox tea shrubs in Assam"
  },
  {
    id: "02",
    subtitle: "The Harvest",
    title: "The Golden First Flush Selection",
    description: "We collect exclusively during the optimal dawn windows of the early spring cycle. Every single shoot is hand-plucked using traditional tactile evaluation—selecting only the pristine terminal two leaves and the unopened downy vegetative bud.",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=1200",
    alt: "Artisan pickers selecting premium golden shoots during dawn hours"
  },
  {
    id: "03",
    subtitle: "The Standard",
    title: "Small-Batch Souchong Sorting",
    description: "Legacy is not scaled; it is curated. By processing our leaves in micro-lots within our historic estate house, we track individual batch reactions to humidity, heat, and gentle mechanical rolling—preserving the delicate whole-leaf structures.",
    image: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&q=80&w=1200",
    alt: "Whole raw orthodox black tea leaves drying slowly on dark wood artisanal flats"
  }
];

export default function Estate() {
  return (
    <section id="estate" className="bg-white text-brand-charcoal py-32 px-6 md:px-12 lg:px-24 overflow-hidden">
      
      {/* Editorial Title Block */}
      <div className="max-w-7xl mx-auto mb-28 text-center md:text-left">
        <motion.p 
          className="font-sans text-xs tracking-widest uppercase text-brand-gold font-medium mb-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          The Living Sanctuary
        </motion.p>
        <motion.h2 
          className="font-serif text-4xl md:text-6xl text-brand-forest tracking-wide"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.215, 0.610, 0.355, 1] }}
        >
          From Leaf To Legacy
        </motion.h2>
        <div className="w-16 h-[1px] bg-brand-gold mt-6 mx-auto md:mx-0" />
      </div>

      {/* Alternating Architectural Layout */}
      <div className="max-w-7xl mx-auto space-y-40 md:space-y-56">
        {estateChapters.map((chapter, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <div 
              key={chapter.id}
              className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 xl:gap-32 ${
                isEven ? '' : 'lg:flex-row-reverse'
              }`}
            >
              
              {/* Image Container with Luxury Subtle Frame Zoom */}
              <motion.div 
                className="w-full lg:w-1/2 aspect-[4/3] overflow-hidden bg-brand-cream border border-brand-forest/5 shadow-xl relative group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.4, ease: [0.215, 0.610, 0.355, 1] }}
              >
                {/* Floating Chapter Index Indicator */}
                <div className={`absolute top-6 z-20 font-serif text-sm tracking-widest text-brand-cream/80 bg-brand-forest/40 px-4 py-2 backdrop-blur-sm ${
                  isEven ? 'right-6' : 'left-6'
                }`}>
                  {chapter.id}
                </div>

                <motion.img 
                  src={chapter.image} 
                  alt={chapter.alt}
                  className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.02]"
                  whileInView={{ scale: 1.04 }}
                  viewport={{ once: false }}
                  transition={{ duration: 2.5, ease: "easeOut" }}
                />
              </motion.div>

              {/* Text Editorial Content */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center">
                <motion.span 
                  className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-3 inline-block"
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  {chapter.subtitle}
                </motion.span>
                
                <motion.h3 
                  className="font-serif text-2xl md:text-4xl text-brand-forest tracking-wide leading-snug mb-6"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.1 }}
                >
                  {chapter.title}
                </motion.h3>
                
                <motion.p 
                  className="font-sans font-light text-brand-muted text-sm md:text-base leading-relaxed tracking-wide max-w-xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  {chapter.description}
                </motion.p>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
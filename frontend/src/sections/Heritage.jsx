import React from 'react';
import { motion } from 'framer-motion';

// Historical Milestone Dataset
const timelineMilestones = [
  {
    year: "1823",
    title: "The Wild Discovery",
    description: "Robert Bruce is guided to wild native tea trees growing naturally in the Chabua region of Upper Assam by local Singpho chiefs, uncovering an ancient botanical secret hidden from the global market."
  },
  {
    year: "1837",
    title: "The First Plantations",
    description: "Chabua is officially designated as the foundational cradle where India's organized cultivation began. The pristine soil and intense morning river mist proved ideal for nurturing the distinct Camellia sinensis var. assamica."
  },
  {
    year: "1839",
    title: "The Historic London Auction",
    description: "The initial small-batch chests of pure Chabua Assam Orthodox tea arrive at London's historic auctions. Connoisseurs are captivated by its deep amber color, full-bodied profile, and natural malt sweetness, altering the trade map forever."
  }
];

// Framer Motion Animation Variants for Content Revealing
const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 }
  }
};

const textItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.215, 0.610, 0.355, 1] }
  }
};

export default function Heritage() {
  return (
    <section id="heritage" className="bg-brand-cream text-brand-charcoal py-32 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      
      {/* Editorial Title Blocks */}
      <div className="max-w-7xl mx-auto mb-24 md:mb-36">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4">
            <motion.p 
              className="font-sans text-xs tracking-widest uppercase text-brand-gold font-medium mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              Our Origin Account
            </motion.p>
          </div>
          <div className="md:col-span-8">
            <motion.h2 
              className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide leading-tight text-brand-forest"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.215, 0.610, 0.355, 1] }}
            >
              A Legacy Steeped In Time
            </motion.h2>
          </div>
        </div>
      </div>

      {/* Main Historical Layout Canvas */}
      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* LEFT: Cinematic Parallax Image Frame */}
          <div className="lg:col-span-5 sticky top-32 hidden lg:block">
            <div className="relative overflow-hidden group border border-brand-forest/5 shadow-2xl">
              <motion.div
                className="absolute inset-0 bg-brand-forest/10 z-10 transition-opacity duration-700 group-hover:opacity-0"
              />
              <motion.img 
                src="https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=1200" 
                alt="Vintage style hand harvesting processing landscape in wild Assam gardens"
                className="w-full h-[600px] object-cover filter brightness-[0.9] contrast-[1.02] transition-transform duration-[2s] ease-out group-hover:scale-105"
                initial={{ scale: 1.1, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6 }}
              />
              <div className="absolute bottom-6 left-6 z-20">
                <p className="font-serif italic text-brand-cream text-lg drop-shadow-md">The Cradle of Indian Tea</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Asymmetrical Chronological Text Timeline */}
          <div className="lg:col-span-7 space-y-24 md:space-y-36 lg:pl-12">
            {timelineMilestones.map((milestone, idx) => (
              <motion.div 
                key={milestone.year}
                className="relative border-l border-brand-gold/30 pl-8 md:pl-12 group"
                variants={textContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-150px" }}
              >
                {/* Micro-interactive floating indicator node */}
                <div className="absolute top-2 left-[-4px] w-2 h-2 rounded-full bg-brand-gold transition-all duration-500 group-hover:scale-150 group-hover:bg-brand-forest" />
                
                <motion.span 
                  className="block font-serif text-4xl md:text-6xl text-brand-gold font-light tracking-wide mb-4 transition-colors duration-500 group-hover:text-brand-forest"
                  variants={textItemVariants}
                >
                  {milestone.year}
                </motion.span>
                
                <motion.h3 
                  className="font-serif text-xl md:text-2xl text-brand-forest font-semibold tracking-wide mb-4"
                  variants={textItemVariants}
                >
                  {milestone.title}
                </motion.h3>
                
                <motion.p 
                  className="font-sans font-light text-brand-muted text-sm md:text-base leading-relaxed tracking-wide max-w-xl"
                  variants={textItemVariants}
                >
                  {milestone.description}
                </motion.p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      {/* Embedded Deep Statement Separator */}
      <div className="max-w-5xl mx-auto mt-32 md:mt-48 text-center border-t border-brand-gold/20 pt-16">
        <motion.p 
          className="font-serif italic text-xl md:text-2xl text-brand-forest/80 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.2 }}
        >
          "To understand the depth of genuine orthodox tea, one must return to the initial leaf beds of Chabua—where heritage is calculated not in seasons, but in centuries."
        </motion.p>
      </div>
    </section>
  );
}
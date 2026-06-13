import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, ShieldCheck, Eye } from 'lucide-react';

const craftsmanshipPillars = [
  {
    icon: Sparkles,
    title: "Hand-Selected Terminal Flushes",
    description: "Our artisans rely on deep tactical memory, bypassing coarse overgrowths entirely to pluck only the pristine two terminal leaves and a single downy vegetative bud. This secures the absolute peak concentration of essential juices."
  },
  {
    icon: Activity,
    title: "Micro-Lot Ambient Wither",
    description: "Harvested shoots are spread uniformly over traditional raised bamboo flats. We track moisture reduction down to fractional weight variances over a disciplined, 18-hour slow nocturnal aeration cycle."
  },
  {
    icon: ShieldCheck,
    title: "Artisanal Orthodox Rolling",
    description: "To prevent bruising or tearing the leaves via industrial friction, our low-pressure rolling methods gently twist the whole leaf structure. This natural leaf bruising releases essential sap profiles safely."
  },
  {
    icon: Eye,
    title: "Organoleptic Purity Assurances",
    description: "Every individual lot goes through strict olfactory evaluation before sealing. We inspect leaf-opening dynamics, infusion color density, and liquor clarity to maintain world-class luxury benchmarks."
  }
];

// Motion Stagger Containers
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const pillarVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.215, 0.610, 0.355, 1] }
  }
};

export default function Craftsmanship() {
  return (
    <section id="craftsmanship" className="bg-brand-charcoal text-brand-cream py-32 px-6 md:px-12 lg:px-24 relative overflow-hidden border-b border-brand-gold/10">
      
      {/* Editorial Luxury Branding Watermark Background */}
      <div className="absolute right-[-8%] bottom-[-5%] text-[26vw] font-serif font-bold opacity-[0.015] text-brand-gold select-none pointer-events-none">
        1837
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* LEFT PANELS: Pin-Locked Editorial Title (5 Columns) */}
          <div className="lg:col-span-5 lg:sticky lg:top-36 space-y-6">
            <motion.p 
              className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              The Uncompromised Discipline
            </motion.p>
            
            <motion.h2 
              className="font-serif text-3xl sm:text-5xl tracking-wide leading-tight text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.215, 0.610, 0.355, 1] }}
            >
              Refined Through Centuries of Mastery
            </motion.h2>
            
            <div className="w-16 h-[1px] bg-brand-gold/40 my-6" />
            
            <motion.p 
              className="font-sans font-light text-brand-muted text-sm md:text-base leading-relaxed tracking-wide max-w-md"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              We do not accelerate manufacturing parameters. Genuine orthodox luxury requires absolute dedication to seasonal cycles, physical hand-craftsmanship, and strict micro-lot traceability.
            </motion.p>
          </div>

          {/* RIGHT PANELS: Asymmetrical Craftsmanship Pillar Matrix (7 Columns) */}
          <motion.div 
            className="lg:col-span-7 space-y-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {craftsmanshipPillars.map((pillar, idx) => {
              const IconComponent = pillar.icon;
              return (
                <motion.div 
                  key={idx} 
                  className="flex flex-col sm:flex-row gap-6 items-start group border-b border-brand-cream/5 pb-8 last:border-0"
                  variants={pillarVariants}
                >
                  {/* Luxury Wireframe Icon Container */}
                  <div className="p-4 bg-brand-forest/30 border border-brand-gold/20 rounded-none group-hover:border-brand-gold group-hover:bg-brand-forest/60 transition-all duration-500 shrink-0">
                    <IconComponent className="w-5 h-5 text-brand-gold stroke-[1.25]" />
                  </div>
                  
                  {/* Core Pillar Narrative */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg md:text-xl text-white tracking-wide transition-colors duration-300 group-hover:text-brand-gold">
                      {pillar.title}
                    </h3>
                    <p className="font-sans font-light text-brand-cream/70 text-sm leading-relaxed tracking-wide">
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
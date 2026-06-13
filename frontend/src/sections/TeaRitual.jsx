import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Timer, Waves, Compass } from 'lucide-react';

const ritualSteps = [
  {
    num: "I",
    title: "Thermal Calibration",
    description: "Bring mineral-pure spring water to an exact temperature. For our golden flushes, cooling slightly to 92°C-95°C protects volatile essential oils from scalding, preserving delicate honey notes."
  },
  {
    num: "II",
    title: "Vessel Awakening",
    description: "Rinse your porcelain Gaiwan or clay teapot with heated water before adding dry leaves. This warms the surface, allowing the dry whole-leaf architecture to expand and release its first aromatics."
  },
  {
    num: "III",
    title: "The Silent Agitation",
    description: "Pour calibrated water over the leaves in a gentle spiral. Let the whole leaves expand without disturbance. Residual convective currents will handle extraction evenly, without forcing bitter tannins out."
  },
  {
    num: "IV",
    title: "The Decantation",
    description: "Pour the liquor completely out into a cooling pitcher after the optimal brewing window. Leaving water behind over-extracts the leaves, stalling the flavor profile of subsequent dynamic steepings."
  }
];

export default function TeaRitual() {
  // Interactive Simulator States
  const [volume, setVolume] = useState(200); // ml
  const [time, setTime] = useState(3.5);     // minutes

  // Predictive algorithmic tracking for luxury organic leaf profiles
  const calculationFactor = (volume / 200) * (time / 3.5);
  const theaflavins = Math.min(100, Math.round(75 * calculationFactor));
  const caffeine = Math.min(100, Math.round(60 * (time / 3.5)));
  const tannins = Math.min(100, Math.round(35 * Math.pow(time / 3.5, 2) * (200 / volume)));

  return (
    <section id="ritual" className="bg-white text-brand-charcoal py-32 px-6 md:px-12 lg:px-24 border-b border-brand-gold/10 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-2xl mx-auto mb-24">
          <p className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-3">
            The Science of Infusion
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-brand-forest tracking-wide mb-6">
            The Art Of Brewing
          </h2>
          <p className="font-sans font-light text-brand-muted text-sm md:text-base leading-relaxed">
            Orthodox leaves require exact parameters. Use our precision profile matrix below to visualize how water kinetics and steeping windows alter structural flavor compounds.
          </p>
        </div>

        {/* INTERACTIVE EXTRACTION CALCULATOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mb-32 bg-brand-cream/40 p-8 md:p-12 border border-brand-forest/5">
          
          {/* Controls Panel */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
            <h3 className="font-serif text-xl text-brand-forest tracking-wide border-b border-brand-gold/20 pb-3">
              Calibrate Parameters
            </h3>

            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex justify-between font-sans text-xs uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-2"><Waves className="w-4 h-4 text-brand-gold" /> Serving Water Volume</span>
                <span className="text-brand-forest font-bold">{volume} ml</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="500" 
                step="50"
                value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-brand-forest bg-brand-gold/20 h-[3px] appearance-none rounded-lg cursor-pointer"
              />
            </div>

            {/* Time Control */}
            <div className="space-y-3">
              <div className="flex justify-between font-sans text-xs uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-2"><Timer className="w-4 h-4 text-brand-gold" /> Extraction Steeping Window</span>
                <span className="text-brand-forest font-bold">{time} Mins</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="6.0" 
                step="0.5"
                value={time} 
                onChange={(e) => setTime(Number(e.target.value))}
                className="w-full accent-brand-forest bg-brand-gold/20 h-[3px] appearance-none rounded-lg cursor-pointer"
              />
            </div>

            <div className="pt-4 font-sans text-[11px] text-brand-muted italic leading-relaxed">
              * Calculations assume a standard 2.5g allocation of dry whole-leaf Chabua Assam Orthodox Gold.
            </div>
          </div>

          {/* Real-time Dynamic Metrics Display Area */}
          <div className="lg:col-span-7 bg-brand-forest text-brand-cream p-8 flex flex-col justify-between shadow-lg">
            <h4 className="font-serif text-base text-brand-gold tracking-widest uppercase mb-6">
              Predicted Extraction Matrix
            </h4>

            <div className="space-y-6">
              {/* Metric 1 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-sans tracking-wide text-brand-cream/80">
                  <span>Malt Density & Theaflavins (Color/Body)</span>
                  <span className="font-bold text-brand-gold">{theaflavins}%</span>
                </div>
                <div className="w-full bg-white/10 h-[2px]">
                  <motion.div className="bg-brand-gold h-full" animate={{ width: `${theaflavins}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>

              {/* Metric 2 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-sans tracking-wide text-brand-cream/80">
                  <span>Alkaloid Solubilization (Active Caffeine Release)</span>
                  <span className="font-bold text-brand-gold">{caffeine}%</span>
                </div>
                <div className="w-full bg-white/10 h-[2px]">
                  <motion.div className="bg-brand-gold h-full" animate={{ width: `${caffeine}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>

              {/* Metric 3 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-sans tracking-wide text-brand-cream/80">
                  <span>Tannin Concentration (Astringency / Bitterness Balance)</span>
                  <span className={`font-bold transition-colors ${tannins > 65 ? 'text-red-400' : 'text-brand-gold'}`}>{tannins}%</span>
                </div>
                <div className="w-full bg-white/10 h-[2px]">
                  <motion.div className={`h-full ${tannins > 65 ? 'bg-red-400' : 'bg-brand-gold'}`} animate={{ width: `${tannins}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-4 text-xs font-sans text-brand-cream/70 leading-relaxed">
              {tannins > 65 
                ? "Warning: Extended steeping thresholds cause over-extraction of cellular tannins, resulting in prominent bitterness that overpowers organic honey top notes."
                : "Balanced Balance: Parameters show optimal sweet-to-malt extract yield, generating a clean mouthfeel and bright liquor clarification."
              }
            </div>
          </div>

        </div>

        {/* METHOD EDITORIAL CARDS STEP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {ritualSteps.map((step, idx) => (
            <motion.div 
              key={idx}
              className="bg-brand-cream/20 p-8 border border-brand-forest/5 relative flex flex-col justify-between group hover:border-brand-gold transition-colors duration-500 shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
            >
              <div>
                <span className="block font-serif text-3xl text-brand-gold/40 font-light mb-6 group-hover:text-brand-gold transition-colors duration-500">
                  {step.num}
                </span>
                <h3 className="font-serif text-lg font-bold text-brand-forest mb-4 tracking-wide">
                  {step.title}
                </h3>
                <p className="font-sans font-light text-brand-muted text-xs md:text-sm leading-relaxed tracking-wide">
                  {step.description}
                </p>
              </div>
              <div className="w-full h-[1px] bg-brand-gold/10 mt-6 group-hover:bg-brand-gold/40 transition-colors" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
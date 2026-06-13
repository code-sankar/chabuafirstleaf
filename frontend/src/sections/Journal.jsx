import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const journalEntries = [
  {
    id: "post_01",
    tag: "Heritage Account",
    title: "The Genesis of Camellia Assamica: Deep in the Chabua Basin",
    excerpt: "An historical investigation into the pristine 1830s expeditions, revealing the tribal heritage and rare soil chemistry that forged the identity of India's foundational orthodox tea strain.",
    date: "May 2026",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=1200",
    isHero: true
  },
  {
    id: "post_02",
    tag: "Technical Ritual",
    title: "The Physics of Thermal Calibration in Wholistic Infusions",
    excerpt: "How structural changes in temperature alter molecular cell rupture, and why cooling spring water down to exactly 92°C saves delicate top-tier honey aromatics.",
    date: "April 2026",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800",
    isHero: false
  },
  {
    id: "post_03",
    tag: "Estate Chronicles",
    title: "Nocturnal Aeration: The Chemistry Behind Small-Batch Withering",
    excerpt: "An inside look into our 18-hour nocturnal bamboo drying frameworks, where humidity variables are monitored to reduce moisture down to fractional margins.",
    date: "March 2026",
    image: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&q=80&w=800",
    isHero: false
  }
];

export default function Journal() {
  const heroPost = journalEntries.find(p => p.isHero);
  const regularPosts = journalEntries.filter(p => !p.isHero);

  return (
    <section id="journal" className="bg-brand-cream text-brand-charcoal py-32 px-6 md:px-12 lg:px-24 border-b border-brand-gold/10 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* EDITORIAL SECTION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-3">
              The Printed Word
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-brand-forest tracking-wide">
              The Journal
            </h2>
          </div>
          <Link
            to="/journal"
            className="font-sans text-xs uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors flex items-center gap-1.5 pb-1 border-b border-brand-gold/40 group"
          >
            <span>View All Records</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* ASYMMETRIC GRID CANVAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT CONTAINER: Prominent Editorial Hero Column (7 Columns) */}
          <motion.article 
            className="lg:col-span-7 group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <div className="aspect-[16/10] overflow-hidden bg-brand-charcoal/5 border border-brand-forest/5 mb-6 relative">
              <motion.img 
                src={heroPost.image} 
                alt={heroPost.title}
                className="w-full h-full object-cover filter brightness-[0.93] contrast-[1.02]"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 1.5, ease: [0.215, 0.610, 0.355, 1] }}
              />
            </div>
            
            <div className="space-y-3 max-w-2xl">
              <div className="flex justify-between items-center font-sans text-xs uppercase tracking-wider">
                <span className="text-brand-gold font-semibold">{heroPost.tag}</span>
                <span className="text-brand-muted">{heroPost.date}</span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl text-brand-forest tracking-wide leading-tight group-hover:text-brand-gold transition-colors duration-300">
                {heroPost.title}
              </h3>
              <p className="font-sans font-light text-brand-muted text-sm md:text-base leading-relaxed tracking-wide">
                {heroPost.excerpt}
              </p>
            </div>
          </motion.article>

          {/* RIGHT CONTAINER: Secondary Staggered Row Stack (5 Columns) */}
          <div className="lg:col-span-5 space-y-12 lg:pl-6 border-t lg:border-t-0 lg:border-l border-brand-gold/20 pt-12 lg:pt-0">
            {regularPosts.map((post, idx) => (
              <motion.article 
                key={post.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-6 group cursor-pointer"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
              >
                {/* Thumbnail Column */}
                <div className="sm:col-span-4 aspect-[4/3] sm:aspect-square overflow-hidden bg-brand-charcoal/5 border border-brand-forest/5 relative">
                  <motion.img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover filter brightness-[0.95]"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 1.2 }}
                  />
                </div>

                {/* Text Content Column */}
                <div className="sm:col-span-8 space-y-2 flex flex-col justify-center">
                  <div className="flex justify-between items-center font-sans text-[10px] uppercase tracking-widest">
                    <span className="text-brand-gold font-semibold">{post.tag}</span>
                    <span className="text-brand-muted">{post.date}</span>
                  </div>
                  <h4 className="font-serif text-lg text-brand-forest tracking-wide leading-snug group-hover:text-brand-gold transition-colors duration-300">
                    {post.title}
                  </h4>
                  <p className="font-sans font-light text-brand-muted text-xs leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
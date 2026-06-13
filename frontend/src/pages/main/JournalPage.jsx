import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const ALL_POSTS = [
  {
    id: "post_01",
    slug: "genesis-camellia-assamica",
    tag: "Heritage Account",
    title: "The Genesis of Camellia Assamica: Deep in the Chabua Basin",
    excerpt: "An historical investigation into the pristine 1830s expeditions, revealing the tribal heritage and rare soil chemistry that forged the identity of India's foundational orthodox tea strain.",
    date: "May 2026",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=1200",
    featured: true
  },
  {
    id: "post_02",
    slug: "thermal-calibration-infusions",
    tag: "Technical Ritual",
    title: "The Physics of Thermal Calibration in Wholistic Infusions",
    excerpt: "How structural changes in temperature alter molecular cell rupture, and why cooling spring water down to exactly 92°C saves delicate honey aromatics.",
    date: "April 2026",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: "post_03",
    slug: "nocturnal-aeration-withering",
    tag: "Estate Chronicles",
    title: "Nocturnal Aeration: The Chemistry Behind Small-Batch Withering",
    excerpt: "An inside look into our 18-hour nocturnal bamboo drying frameworks, where humidity variables are monitored to reduce moisture down to fractional margins.",
    date: "March 2026",
    image: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: "post_04",
    slug: "singpho-tribe-tea-origins",
    tag: "Heritage Account",
    title: "The Singpho Connection: Indigenous Custodians of Assam Tea",
    excerpt: "Long before the British arrived, the Singpho tribe of Upper Assam cultivated and consumed wild tea in rituals and daily life — a story seldom told in the global narrative.",
    date: "February 2026",
    image: "https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: "post_05",
    slug: "second-flush-season",
    tag: "Estate Chronicles",
    title: "Second Flush Season: The Peak of Assam Orthodox Production",
    excerpt: "Between May and June, Assam's tea gardens produce their most distinctive, full-bodied leaves. We document the harvest cycle from bud to sealed tin.",
    date: "January 2026",
    image: "https://images.unsplash.com/photo-1464254786740-b97e5420c299?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: "post_06",
    slug: "gaiwan-versus-teapot",
    tag: "Technical Ritual",
    title: "Gaiwan vs. Teapot: Which Vessel Reveals More in Assam Orthodox?",
    excerpt: "A side-by-side comparative steeping analysis examining how vessel material, volume, and pour dynamics alter the extraction profile of our Assam Orthodox Gold.",
    date: "December 2025",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=800",
    featured: false
  }
];

const TAGS = ["All", "Heritage Account", "Technical Ritual", "Estate Chronicles"];

export default function JournalPage() {
  const [activeTag, setActiveTag] = useState("All");

  const filtered = activeTag === "All"
    ? ALL_POSTS
    : ALL_POSTS.filter((p) => p.tag === activeTag);

  const featured = filtered.find((p) => p.featured) || filtered[0];
  const rest = filtered.filter((p) => p.id !== featured?.id);

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal pt-20">

      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-16 pb-12 border-b border-brand-gold/10">
        <motion.p
          className="font-sans text-xs tracking-widest uppercase text-brand-gold mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          The Printed Word
        </motion.p>
        <motion.h1
          className="font-serif text-4xl md:text-6xl text-brand-forest tracking-wide"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          The Journal
        </motion.h1>
      </section>

      {/* Tag Filter */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-8 flex flex-wrap gap-3">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`font-sans text-xs uppercase tracking-widest px-5 py-2.5 border transition-all duration-300 cursor-pointer ${
              activeTag === tag
                ? 'border-brand-gold bg-brand-gold text-brand-charcoal font-bold'
                : 'border-brand-forest/10 text-brand-muted hover:border-brand-gold hover:text-brand-forest'
            }`}
          >
            {tag}
          </button>
        ))}
      </section>

      {/* Featured Post */}
      {featured && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pb-16">
          <Link to={`/journal/${featured.slug}`} className="group block">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="lg:col-span-8 aspect-[16/9] overflow-hidden bg-brand-charcoal/5 border border-brand-forest/5">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover filter brightness-[0.92] transition-transform duration-[2s] group-hover:scale-[1.03]"
                />
              </div>
              <div className="lg:col-span-4 space-y-4 pb-4">
                <div className="flex justify-between items-center font-sans text-xs uppercase tracking-widest">
                  <span className="text-brand-gold font-semibold">{featured.tag}</span>
                  <span className="text-brand-muted">{featured.date}</span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl text-brand-forest tracking-wide leading-snug group-hover:text-brand-gold transition-colors duration-300">
                  {featured.title}
                </h2>
                <p className="font-sans font-light text-brand-muted text-sm leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-1.5 font-sans text-xs uppercase tracking-widest text-brand-forest group-hover:text-brand-gold transition-colors border-b border-brand-gold/30 pb-1 w-fit">
                  <span>Read Full Account</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          </Link>
        </section>
      )}

      {/* Post Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pb-32 border-t border-brand-gold/10 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {rest.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link to={`/journal/${post.slug}`} className="group block space-y-4">
                <div className="aspect-[4/3] overflow-hidden border border-brand-forest/5 bg-brand-charcoal/5">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover filter brightness-[0.94] transition-transform duration-[1.5s] group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex justify-between items-center font-sans text-[10px] uppercase tracking-widest">
                  <span className="text-brand-gold font-semibold">{post.tag}</span>
                  <span className="text-brand-muted">{post.date}</span>
                </div>
                <h3 className="font-serif text-lg text-brand-forest tracking-wide leading-snug group-hover:text-brand-gold transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="font-sans font-light text-brand-muted text-xs leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { selectProducts } from '../../store';
import SEOHead from '../../components/seo/SEOHead';
import { BreadcrumbStructuredData } from '../../components/seo/StructuredData';

const SORT_OPTIONS = [
  { id: 'default',    label: "Curator's Order" },
  { id: 'price-asc',  label: 'Price · Ascending' },
  { id: 'price-desc', label: 'Price · Descending' },
];

export default function Collection() {
  const products = useSelector(selectProducts);
  const [sortBy, setSortBy] = useState('default');

  const sorted = useMemo(() => {
    const list = [...products];
    if (sortBy === 'price-asc')  return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, sortBy]);

  return (
    <>
      <SEOHead
        title="The Collection"
        description="Single-origin orthodox tea from the historic estates of Chabua, Assam. Curated micro-lots, hand-plucked and small-batch crafted for connoisseurs worldwide."
        path="/collection"
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home',       path: '/' },
          { name: 'Collection', path: '/collection' },
        ]}
      />

      <div className="min-h-screen bg-brand-cream text-brand-charcoal pt-20">

        {/* ─── Editorial Hero ─────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-20 md:pt-24 pb-16 md:pb-20">

          {/* Breadcrumb */}
          <motion.div
            className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-brand-muted mb-10 md:mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Link to="/" className="hover:text-brand-gold transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-forest font-medium">Collection</span>
          </motion.div>

          <motion.p
            className="font-sans text-xs tracking-widest uppercase text-brand-gold mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            The Reserve Catalogue
          </motion.p>

          <motion.h1
            className="font-serif text-5xl md:text-7xl text-brand-forest tracking-wide leading-[1.05] max-w-3xl font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            The Collection
          </motion.h1>

          <motion.div
            className="w-16 h-[1px] bg-brand-gold mt-8 mb-10 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />

          <motion.p
            className="font-serif italic text-lg md:text-xl text-brand-muted leading-relaxed max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Each tin in our catalogue is a single-origin micro-lot — hand-plucked at dawn,
            withered through Assam's monsoon nights, and finished in small batches under
            the supervision of our estate's resident master.
          </motion.p>
        </section>

        {/* ─── Sort & Count Bar ───────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-brand-gold/10">
            <p className="font-sans text-[11px] tracking-widest uppercase text-brand-muted/70">
              {sorted.length} {sorted.length === 1 ? 'Reserve' : 'Reserves'}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="font-sans text-[10px] tracking-widest uppercase text-brand-muted/50">
                Arrangement
              </span>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`font-sans text-[11px] tracking-widest uppercase transition-colors duration-300 cursor-pointer ${
                    sortBy === opt.id
                      ? 'text-brand-forest border-b border-brand-gold pb-1'
                      : 'text-brand-muted/60 hover:text-brand-forest'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Product Grid ───────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-20">
          {sorted.length === 0 ? (
            <div className="py-32 text-center">
              <div className="w-12 h-[0.5px] bg-brand-gold/30 mx-auto mb-6" />
              <p className="font-serif italic text-brand-muted text-lg">
                The catalogue is being prepared. Please return shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-y-20">
              {sorted.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </section>

        {/* ─── Closing Editorial Note ─────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-6 text-center pb-32">
          <div className="w-12 h-[0.5px] bg-brand-gold/40 mx-auto mb-8" />
          <p className="font-serif italic text-brand-muted text-base md:text-lg leading-relaxed">
            "Legacy is not scaled — it is curated."
          </p>
          <p className="font-sans text-[10px] tracking-widest uppercase text-brand-muted/40 mt-4">
            — From the Estate Records, Chabua
          </p>
        </section>

      </div>
    </>
  );
}

/* ─── Product Card ────────────────────────────────────────────── */
function ProductCard({ product, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.7,
        delay: (index % 3) * 0.1,
        ease: [0.215, 0.610, 0.355, 1],
      }}
    >
      <Link to={`/product/${product.slug}`} className="group block">

        {/* Image */}
        <div className="aspect-[4/5] bg-white border border-brand-forest/5 overflow-hidden mb-5 relative">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 filter brightness-[0.95]"
            loading="lazy"
            width={800}
            height={1000}
          />

          {/* Hover wash */}
          <div className="absolute inset-0 bg-brand-forest/0 group-hover:bg-brand-forest/5 transition-colors duration-500" />

          {/* Hover affordance */}
          <div className="absolute bottom-4 right-4 w-9 h-9 bg-brand-cream flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
            <ArrowUpRight className="w-3.5 h-3.5 text-brand-forest stroke-[1.5]" />
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-2">
          <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold font-medium">
            {product.tagline}
          </p>

          <h2 className="font-serif text-xl md:text-2xl text-brand-forest tracking-wide leading-snug group-hover:text-brand-gold transition-colors duration-500 font-light">
            {product.name}
          </h2>

          {product.tastingNotes?.length > 0 && (
            <p className="font-serif italic text-brand-muted text-sm leading-relaxed">
              {product.tastingNotes.slice(0, 3).join(' · ')}
            </p>
          )}

          <div className="flex items-baseline justify-between pt-3">
            <p className="font-serif text-lg text-brand-charcoal font-light">
              ${product.price.toFixed(2)}
              <span className="font-sans text-[10px] uppercase tracking-widest text-brand-muted/50 ml-2">
                {product.currency || 'USD'} · {product.weight}
              </span>
            </p>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Minus, ShoppingBag, Thermometer,
  Clock, Layers, ArrowLeft, ChevronRight, Heart,
} from 'lucide-react';
import {
  addToCart,
  setActiveProduct,
  toggleWishlist,
  selectIsWishlisted,
} from '../../store';

export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.collection);

  const product = list.find((p) => p.slug === slug) || list[0];
  const isWishlisted = useSelector(selectIsWishlisted(product?.id));

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.9)',
    });
  };

  const handleMouseLeave = () => setZoomStyle({ display: 'none', transform: 'scale(1)' });

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    dispatch(setActiveProduct(product.id));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setQuantity(1);
  };

  const handleWishlistToggle = () => {
    dispatch(toggleWishlist(product));
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <p className="font-serif text-2xl text-brand-muted">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal pt-20">

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-8 flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-brand-muted">
        <Link to="/" className="hover:text-brand-gold transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/collection" className="hover:text-brand-gold transition-colors">Collection</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brand-forest font-semibold">{product.name}</span>
      </div>

      {/* Main Product Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24 items-start">

          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <motion.div
              className="w-full aspect-[5/4] bg-white border border-brand-forest/5 overflow-hidden relative md:cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIdx}
                  src={product.images[activeImageIdx]}
                  alt={product.name}
                  style={zoomStyle}
                  className="w-full h-full object-cover transition-transform duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </motion.div>

            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-square bg-white border overflow-hidden transition-all duration-300 cursor-pointer ${
                      activeImageIdx === idx
                        ? 'border-brand-gold/60'
                        : 'border-brand-forest/5 hover:border-brand-gold/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-8 lg:sticky lg:top-32 self-start"
          >
            <div>
              <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold mb-2">
                {product.tagline}
              </p>
              <h1 className="font-serif text-3xl md:text-4xl text-brand-forest tracking-wide leading-tight">
                {product.name}
              </h1>
              <div className="w-12 h-[0.5px] bg-brand-gold/40 mt-4 mb-6" />
              <p className="font-serif text-3xl text-brand-charcoal tabular-nums">
                ${product.price.toFixed(2)}
              </p>
              <p className="font-sans text-xs text-brand-muted mt-1">
                {product.weight} · Single origin · Limited allocation
              </p>
            </div>

            {/* Story */}
            <p className="font-serif italic text-brand-muted leading-relaxed">
              {product.story}
            </p>

            {/* Tasting notes */}
            {product.tastingNotes?.length > 0 && (
              <div>
                <h3 className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-3">
                  Tasting Notes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tastingNotes.map((note) => (
                    <span key={note} className="px-3 py-1.5 border border-brand-forest/15 font-sans text-xs tracking-wide text-brand-charcoal">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Brewing guidance */}
            {product.brewingNotes && (
              <div>
                <h3 className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-3">
                  Brewing Guidance
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <BrewingTile icon={Thermometer} label="Temperature" value={product.brewingNotes.temp} />
                  <BrewingTile icon={Clock}        label="Steep Time"  value={product.brewingNotes.time} />
                  <BrewingTile icon={Layers}       label="Dry Ratio"   value={product.brewingNotes.ratio} />
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart + Wishlist */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <div className="flex justify-between sm:justify-center items-center border border-brand-forest/20 bg-white px-4 py-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 text-brand-muted hover:text-brand-forest transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 stroke-[1.5]" />
                </button>
                <span className="font-sans text-sm font-semibold px-6 min-w-10 text-center select-none tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1 text-brand-muted hover:text-brand-forest transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 gold-shimmer-btn text-brand-charcoal font-sans text-xs font-bold tracking-luxury uppercase py-5 flex items-center justify-center gap-3 rounded-none shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2]" />
                <span>{added ? 'Added to Collection' : 'Allocate To Collection Bag'}</span>
              </button>

              <button
                onClick={handleWishlistToggle}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={isWishlisted}
                className={`shrink-0 border w-14 h-14 sm:w-auto sm:px-5 sm:py-0 sm:h-auto sm:self-stretch flex items-center justify-center transition-colors cursor-pointer ${
                  isWishlisted
                    ? 'border-brand-gold/60 bg-brand-cream/40 text-brand-gold'
                    : 'border-brand-forest/15 bg-white text-brand-muted hover:text-brand-forest hover:border-brand-forest/30'
                }`}
              >
                <Heart
                  className="w-4 h-4 stroke-[1.5]"
                  fill={isWishlisted ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            <p className="font-sans text-[11px] text-brand-muted tracking-wide">
              SKU: <span className="font-medium text-brand-charcoal">{product.sku}</span> · Insured global distribution via climate-controlled packaging.
            </p>

            <Link
              to="/collection"
              className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Collection
            </Link>
          </motion.div>
        </div>

        {/* Other Products */}
        <div className="mt-32 border-t border-brand-gold/10 pt-20">
          <p className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-3 text-center">
            Continue Exploring
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-brand-forest tracking-wide text-center mb-16">
            From The Estate
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {list
              .filter((p) => p.id !== product.id)
              .slice(0, 3)
              .map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link to={`/product/${p.slug}`} className="group block">
                    <div className="aspect-[4/3] bg-white overflow-hidden border border-brand-forest/5 mb-4">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.95]"
                      />
                    </div>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold font-semibold mb-1">
                      {p.tagline}
                    </p>
                    <h3 className="font-serif text-lg text-brand-forest tracking-wide group-hover:text-brand-gold transition-colors duration-300">
                      {p.name}
                    </h3>
                    <p className="font-serif text-brand-muted text-sm mt-1">${p.price.toFixed(2)}</p>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function BrewingTile({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white border border-brand-forest/5 p-3 text-center">
      <Icon className="w-3.5 h-3.5 text-brand-gold stroke-[1.5] mb-2" />
      <span className="font-sans text-[10px] text-brand-muted uppercase tracking-wider">{label}</span>
      <span className="font-serif text-sm font-semibold text-brand-forest mt-1">{value}</span>
    </div>
  );
}
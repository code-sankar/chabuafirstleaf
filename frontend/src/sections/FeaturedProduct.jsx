import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Thermometer, Clock, Layers, ShoppingBag, Check } from 'lucide-react';
import { setActiveProduct, addToCart, selectActiveProduct, selectProducts } from '../store';

export default function FeaturedProduct() {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const product = useSelector(selectActiveProduct);
  const activeId = product?.id;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    e.currentTarget.style.setProperty('--zoom-x', `${x}%`);
    e.currentTarget.style.setProperty('--zoom-y', `${y}%`);
    e.currentTarget.classList.add('is-zooming');
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.classList.remove('is-zooming');
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setQuantity(1);
    }, 1500);
  };

  if (!product) return null;

  return (
    <section
      id="product"
      className="bg-brand-ivory text-brand-charcoal py-24 md:py-36 px-6 md:px-12 lg:px-24 relative grain-light"
    >
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section header */}
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-8 h-[0.5px] bg-brand-gold/30" />
            <span className="font-sans text-[10px] tracking-editorial uppercase text-brand-gold/70">
              The Collection
            </span>
            <div className="w-8 h-[0.5px] bg-brand-gold/30" />
          </motion.div>

          <motion.h2
            className="font-serif text-3xl md:text-5xl text-brand-forest tracking-wide font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.215, 0.61, 0.355, 1] }}
          >
            Seasonal Reserve Selections
          </motion.h2>
        </div>

        {/* Product switcher — refined underline tabs */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-14 md:mb-20">
          {products.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                dispatch(setActiveProduct(item.id));
                setActiveImageIdx(0);
                setQuantity(1);
              }}
              className={`font-serif text-sm md:text-base tracking-wide pb-3 transition-all duration-500 relative cursor-pointer ${
                activeId === item.id
                  ? 'text-brand-forest'
                  : 'text-brand-muted/50 hover:text-brand-muted'
              }`}
            >
              {item.name}
              {activeId === item.id && (
                <motion.div
                  layoutId="productTab"
                  className="absolute bottom-0 left-0 w-full h-[0.5px] bg-brand-gold"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Product display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start"
          >
            {/* Left: Image gallery */}
            <div className="lg:col-span-7 space-y-3">
              {/* Main image with zoom */}
              <div
                className="w-full aspect-[4/3] bg-brand-cream-warm overflow-hidden relative md:cursor-crosshair group [--zoom-x:50%] [--zoom-y:50%]"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  '--zoom-img': `url(${product.images[activeImageIdx]})`,
                }}
              >
                <img
                  src={product.images[activeImageIdx]}
                  alt={`${product.name}`}
                  className="w-full h-full object-cover editorial-image transition-transform duration-700 group-[.is-zooming]:scale-150 group-[.is-zooming]:opacity-0"
                  loading="lazy"
                  width={1200}
                  height={900}
                />
                {/* Zoomed layer (CSS-only zoom on hover) */}
                <div
                  className="absolute inset-0 bg-no-repeat bg-[length:200%] opacity-0 group-[.is-zooming]:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    backgroundImage: `url(${product.images[activeImageIdx]})`,
                    backgroundPosition: 'var(--zoom-x) var(--zoom-y)',
                  }}
                />
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {product.images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIdx(index)}
                    className={`aspect-[4/3] bg-brand-cream-warm overflow-hidden transition-all duration-500 cursor-pointer ${
                      activeImageIdx === index
                        ? 'ring-1 ring-brand-gold/40 ring-offset-2 ring-offset-brand-ivory'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={imgUrl}
                      alt=""
                      className="w-full h-full object-cover editorial-image"
                      loading="lazy"
                      width={400}
                      height={300}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product info */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-7 md:space-y-8">

              {/* Tagline + name */}
              <div>
                <p className="font-sans text-[10px] tracking-editorial uppercase text-brand-gold mb-3">
                  {product.tagline}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-brand-forest tracking-wide leading-tight font-light mb-5">
                  {product.name}
                </h2>
                <p className="font-serif text-2xl text-brand-gold/80 font-light">
                  ${product.price.toFixed(2)}
                  <span className="font-sans text-[10px] uppercase tracking-editorial text-brand-muted/50 ml-2">
                    USD
                  </span>
                </p>
              </div>

              <div className="w-12 h-[0.5px] bg-brand-gold/25" />

              {/* Story */}
              <p className="font-sans font-light text-brand-muted text-sm leading-[1.9] tracking-wide">
                {product.story}
              </p>

              {/* Tasting notes */}
              <div className="space-y-3">
                <p className="font-sans text-[10px] uppercase tracking-editorial text-brand-charcoal/60 font-medium">
                  Tasting Profile
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.tastingNotes.map((note, index) => (
                    <span
                      key={index}
                      className="font-sans text-[11px] border border-brand-gold/20 px-4 py-2 bg-white/60 tracking-wide text-brand-forest/80 font-light"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Brewing guide — refined */}
              <div className="bg-white/70 p-5 border border-brand-forest/5 space-y-3">
                <p className="font-sans text-[10px] uppercase tracking-editorial text-brand-charcoal/60 font-medium">
                  Brewing Parameters
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: Thermometer, label: 'Temp', value: product.brewingNotes.temp },
                    { icon: Clock, label: 'Steep', value: product.brewingNotes.time },
                    { icon: Layers, label: 'Ratio', value: product.brewingNotes.ratio },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 py-2">
                      <Icon className="w-4 h-4 text-brand-gold/60" strokeWidth={1} />
                      <span className="font-sans text-[9px] text-brand-muted/50 uppercase tracking-editorial">
                        {label}
                      </span>
                      <span className="font-serif text-sm text-brand-forest">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add to cart */}
              <div className="flex items-stretch gap-3 pt-2">
                <div className="flex items-center border border-brand-forest/10 bg-white/60">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-brand-muted/40 hover:text-brand-forest transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                  <span className="font-sans text-sm px-4 min-w-[36px] text-center select-none tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 text-brand-muted/40 hover:text-brand-forest transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={justAdded}
                  className="flex-1 gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-medium tracking-editorial uppercase py-4 flex items-center justify-center gap-2.5 disabled:opacity-70"
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" strokeWidth={2} />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>

              <p className="font-sans text-[10px] text-brand-muted/40 tracking-wide text-center lg:text-left">
                {product.sku} · Climate-controlled insured shipping worldwide
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
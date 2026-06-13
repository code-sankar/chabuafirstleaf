import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, X } from 'lucide-react';

import AccountLayout from '../../layouts/AccountLayout';
import {
  selectWishlist,
  addToCart,
  toggleWishlist,
} from '../../store';

export default function Wishlist() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlist);

  const handleMoveToBag = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    dispatch(toggleWishlist(product));
  };

  const handleRemove = (product) => {
    dispatch(toggleWishlist(product));
  };

  return (
    <>
      <Helmet>
        <title>Wishlist · Chabua First Leaf</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <AccountLayout subtitle="Account" title="Your Wishlist">
        {items.length === 0 ? (
          <div className="bg-white border border-brand-forest/5 p-12 md:p-16 text-center">
            <Heart className="w-10 h-10 text-brand-gold/30 mx-auto mb-6" strokeWidth={1} />
            <h2 className="font-serif text-2xl text-brand-forest tracking-wide mb-3">
              No reserves saved yet
            </h2>
            <p className="font-serif italic text-brand-muted mb-8 max-w-md mx-auto">
              Curate a private archive of the teas you'd like to return to. Save any product from the Collection.
            </p>
            <Link
              to="/collection"
              className="inline-block font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors"
            >
              Explore the Collection
            </Link>
          </div>
        ) : (
          <>
            <p className="font-sans text-[11px] text-brand-muted mb-6">
              {items.length} {items.length === 1 ? 'reserve' : 'reserves'} saved
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {items.map((product) => (
                  <motion.li
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-brand-forest/5 group"
                  >
                    {/* Product image */}
                    <Link to={`/product/${product.slug}`} className="block aspect-[4/5] bg-brand-cream/40 overflow-hidden relative">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Remove button — top right */}
                      <button
                        onClick={(e) => { e.preventDefault(); handleRemove(product); }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white border border-brand-forest/5 flex items-center justify-center text-brand-muted hover:text-red-700 transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </Link>

                    {/* Product info */}
                    <div className="p-5">
                      {product.tagline && (
                        <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-1">
                          {product.tagline}
                        </p>
                      )}
                      <Link
                        to={`/product/${product.slug}`}
                        className="font-serif text-lg text-brand-forest leading-tight hover:text-brand-gold transition-colors block"
                      >
                        {product.name}
                      </Link>
                      <p className="font-serif text-base text-brand-charcoal mt-2 tabular-nums">
                        ${product.price.toFixed(2)}
                      </p>

                      <button
                        onClick={() => handleMoveToBag(product)}
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 border border-brand-forest/15 bg-brand-cream/40 hover:bg-brand-forest hover:text-brand-cream font-sans text-[11px] tracking-luxury uppercase py-3 transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}
      </AccountLayout>
    </>
  );
}
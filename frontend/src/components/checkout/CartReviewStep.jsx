import React from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { updateQuantity, removeFromCart } from '../../store';
import { priceFromUSD } from '../../utils/currency';

export default function CartReviewStep({ items, currency, onContinue, onClose }) {
  const dispatch = useDispatch();

  if (items.length === 0) {
    return (
      <div className="text-center py-32">
        <ShoppingBag className="w-10 h-10 text-brand-gold/30 mx-auto mb-6" strokeWidth={1} />
        <p className="font-serif text-2xl text-brand-forest mb-3">Your bag is empty</p>
        <p className="font-sans text-sm text-brand-muted mb-10 max-w-md mx-auto">
          Explore our reserves of single-origin Assam tea, sourced from the historic estates of Chabua.
        </p>
        <Link
          to="/collection"
          onClick={onClose}
          className="inline-block font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-1 hover:text-brand-gold transition-colors"
        >
          View Collection
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-12"
    >
      <header className="text-center max-w-xl mx-auto">
        <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-3">
          Step One
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-brand-forest tracking-wide">
          Review Your Selection
        </h1>
        <div className="w-12 h-[0.5px] bg-brand-gold/40 mx-auto mt-6" />
      </header>

      <div className="max-w-3xl mx-auto bg-white border border-brand-forest/5">
        <ul className="divide-y divide-brand-forest/5">
          {items.map((item) => (
            <li key={item.id} className="flex gap-6 p-6 md:p-8">
              <img
                src={item.images?.[0]}
                alt={item.name}
                width={120}
                height={150}
                loading="lazy"
                className="w-24 h-32 md:w-28 md:h-36 object-cover border border-brand-forest/5 shrink-0"
              />

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-1">
                    {item.tagline}
                  </p>
                  <h3 className="font-serif text-xl text-brand-forest tracking-wide leading-snug">
                    {item.name}
                  </h3>
                  {item.weight && (
                    <p className="font-sans text-[11px] text-brand-muted mt-1">
                      {item.weight} · {item.sku}
                    </p>
                  )}
                </div>

                <div className="flex items-end justify-between gap-4 mt-4">
                  <div className="flex items-center border border-brand-forest/10 bg-brand-cream/40">
                    <button
                      onClick={() =>
                        dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))
                      }
                      className="p-2.5 text-brand-muted/60 hover:text-brand-forest transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                    <span className="font-sans text-sm px-4 min-w-[36px] text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))
                      }
                      className="p-2.5 text-brand-muted/60 hover:text-brand-forest transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="font-serif text-lg text-brand-forest tabular-nums">
                      {priceFromUSD(item.price * item.quantity, currency)}
                    </p>
                    <button
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest text-brand-muted/60 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col-reverse sm:flex-row justify-between items-center gap-6 pt-4">
        <Link
          to="/collection"
          onClick={onClose}
          className="font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors"
        >
          ← Continue Browsing
        </Link>
        <button
          onClick={onContinue}
          className="gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase px-10 py-4 flex items-center justify-center gap-2.5 rounded-none cursor-pointer"
        >
          <span>Continue to Shipping</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
}
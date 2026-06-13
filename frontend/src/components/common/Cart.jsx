import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import {
  selectCartItems,
  selectCartOpen,
  selectCartTotal,
  selectCartCount,
  setCartOpen,
  removeFromCart,
  updateQuantity,
} from '../../store';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector(selectCartOpen);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);

  const close = () => dispatch(setCartOpen(false));

  /* Lock body scroll while the drawer is open */
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  /* Dismiss on ESC */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCheckout = () => {
    dispatch(setCartOpen(false));
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            className="fixed inset-0 z-[55] bg-brand-forest/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={close}
            aria-hidden="true"
          />

          <motion.aside
            key="cart-drawer"
            className="fixed top-0 right-0 z-[56] h-full w-full sm:w-[440px] bg-brand-cream flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Shopping bag"
            aria-modal="true"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-5 border-b border-brand-forest/5">
              <div>
                <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/60">
                  Your Selection
                </p>
                <h2 className="font-serif text-xl text-brand-forest tracking-wide mt-0.5">
                  Shopping Bag {count > 0 && <span className="text-brand-muted/60 text-base">({count})</span>}
                </h2>
              </div>
              <button
                onClick={close}
                className="text-brand-muted/50 hover:text-brand-forest transition-colors"
                aria-label="Close shopping bag"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <EmptyState onContinue={close} />
              ) : (
                <ul className="space-y-6">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-5 pb-6 border-b border-brand-forest/5 last:border-0 last:pb-0"
                    >
                      <img
                        src={item.images?.[0]}
                        alt={item.name}
                        width={88}
                        height={110}
                        loading="lazy"
                        className="w-[88px] h-[110px] object-cover border border-brand-forest/5 bg-white/40 shrink-0"
                      />

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="font-serif text-base text-brand-forest tracking-wide leading-snug">
                            {item.name}
                          </h3>
                          {item.sku && (
                            <p className="font-sans text-[10px] tracking-editorial uppercase text-brand-muted/50 mt-1">
                              {item.sku}
                            </p>
                          )}
                          <p className="font-serif text-sm text-brand-charcoal mt-2 tabular-nums">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-brand-forest/10 bg-white/60">
                            <button
                              onClick={() =>
                                dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))
                              }
                              className="p-2 text-brand-muted/50 hover:text-brand-forest transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                            <span className="font-sans text-xs px-3 min-w-[28px] text-center tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))
                              }
                              className="p-2 text-brand-muted/50 hover:text-brand-forest transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                          </div>

                          <button
                            onClick={() => dispatch(removeFromCart(item.id))}
                            className="text-brand-muted/40 hover:text-red-600 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <footer className="border-t border-brand-forest/5 px-6 py-5 bg-white/30 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-sans text-[10px] uppercase tracking-widest text-brand-muted">
                    Subtotal
                  </span>
                  <span className="font-serif text-xl text-brand-forest tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="font-sans text-[10px] text-brand-muted/60 tracking-wide">
                  Shipping, taxes, and duties calculated at checkout.
                </p>

                <button
                  onClick={handleCheckout}
                  className="w-full gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase py-4 flex items-center justify-center gap-2.5 rounded-none cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ onContinue }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-16">
      <ShoppingBag className="w-8 h-8 text-brand-gold/30 mb-6" strokeWidth={1} />
      <p className="font-serif text-lg text-brand-forest mb-2">Your bag is empty</p>
      <p className="font-sans text-xs text-brand-muted tracking-wide mb-8 max-w-[240px]">
        Explore our reserves of single-origin Assam tea, sourced from the historic estates of Chabua.
      </p>
      <button
        onClick={onContinue}
        className="font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors"
      >
        Continue Browsing
      </button>
    </div>
  );
}
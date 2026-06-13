import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 'cart',     label: 'Bag' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'review',   label: 'Review' },
  { id: 'payment',  label: 'Payment' },
];

export default function CheckoutStepper({ currentStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex items-center justify-between max-w-2xl mx-auto px-4">
        {STEPS.map((step, idx) => {
          const isComplete = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <React.Fragment key={step.id}>
              <li className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={`relative w-6 h-6 flex items-center justify-center transition-colors duration-300 ${
                    isComplete
                      ? 'text-brand-gold'
                      : isCurrent
                        ? 'text-brand-forest'
                        : 'text-brand-muted/30'
                  }`}
                >
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, ease: 'backOut' }}
                    >
                      <Check className="w-4 h-4" strokeWidth={1.5} />
                    </motion.div>
                  ) : (
                    <span className="font-serif text-[13px] tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  )}

                  {isCurrent && (
                    <motion.div
                      layoutId="step-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-gold rounded-full"
                    />
                  )}
                </div>
                <span
                  className={`font-sans text-[9px] md:text-[10px] uppercase tracking-widest transition-colors duration-300 ${
                    isCurrent ? 'text-brand-forest' : 'text-brand-muted/40'
                  }`}
                >
                  {step.label}
                </span>
              </li>

              {idx < STEPS.length - 1 && (
                <li
                  aria-hidden="true"
                  className="flex-1 h-[0.5px] mx-2 md:mx-4 mt-[-18px] bg-brand-muted/15 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-brand-gold/60"
                    initial={{ width: '0%' }}
                    animate={{ width: idx < currentIndex ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
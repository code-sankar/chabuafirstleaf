import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const INTERACTIVE_SELECTORS = 'button, a, input, select, textarea, [role="button"], [tabindex]';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check if device supports hover (not touch-only) and respects motion preferences
  const [shouldRender] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasPointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return hasPointer && !prefersReducedMotion;
  });

  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    if (!isVisible) setIsVisible(true);
  }, [isVisible]);

  // Event delegation — works with dynamically rendered elements
  const handleMouseOver = useCallback((e) => {
    if (e.target.closest(INTERACTIVE_SELECTORS)) {
      setIsHovered(true);
    }
  }, []);

  const handleMouseOut = useCallback((e) => {
    if (e.target.closest(INTERACTIVE_SELECTORS)) {
      setIsHovered(false);
    }
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [shouldRender, handleMouseMove, handleMouseOver, handleMouseOut]);

  if (!shouldRender) return null;

  return (
    <motion.div
      className="hidden md:block fixed top-0 left-0 pointer-events-none z-[70] rounded-full border border-brand-gold/40 mix-blend-difference"
      animate={{
        x: mousePosition.x - (isHovered ? 24 : 10),
        y: mousePosition.y - (isHovered ? 24 : 10),
        width: isHovered ? 48 : 20,
        height: isHovered ? 48 : 20,
        opacity: isVisible ? 1 : 0,
        backgroundColor: isHovered ? 'rgba(200, 169, 107, 0.15)' : 'rgba(0,0,0,0)',
      }}
      transition={{ type: 'tween', ease: 'backOut', duration: 0.15 }}
      aria-hidden="true"
    />
  );
}

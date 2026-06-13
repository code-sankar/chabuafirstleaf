import { useEffect, useRef, useState } from 'react';

/**
 * useScrollReveal — triggers visibility when element enters viewport.
 * Returns: [ref, isVisible]
 *
 * Usage:
 *   const [ref, isVisible] = useScrollReveal({ threshold: 0.15 });
 *   <div ref={ref} className={isVisible ? 'opacity-100' : 'opacity-0'} />
 */
export default function useScrollReveal({ threshold = 0.1, rootMargin = '-50px', once = true } = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, isVisible];
}
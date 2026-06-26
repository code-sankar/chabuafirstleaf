import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const footerLinks = {
  collection: [
  { label: 'Orthodox Gold', to: '/product/assam-orthodox-gold' },
  { label: 'Clonal Imperial', to: '/product/chabua-clonal-imperial' },
  { label: 'Tippy GFOP Reserve', to: '/product/tippy-gfop' },
],
  house: [
    { label: 'Our Heritage', to: '/our-story' },
    { label: 'Estate Terroir', to: '/our-story' },
    { label: 'Brewing Ritual', to: '/', hash: '#ritual' },
    { label: 'The Journal', to: '/journal' },
  ],
  services: [
    { label: 'Private Allocations', to: '/' },
    { label: 'Luxury Gifting', to: '/' },
    { label: 'Global Shipping', to: '/' },
    { label: 'Contact', to: '/' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-brand-forest-deep text-brand-cream relative grain-overlay overflow-hidden">
      <div className="w-full h-[0.5px] bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 lg:pt-28 pb-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 pb-20 border-b border-brand-cream/5">

          {/* Brand column */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="block">
              <h2 className="font-serif text-2xl lg:text-3xl tracking-[0.12em] text-brand-cream/90 font-light">
                CHABUA
                <span className="text-brand-gold/40 mx-2">·</span>
                FIRST LEAF
              </h2>
            </Link>
            <p className="font-sans font-light text-brand-cream/35 text-sm leading-[1.9] tracking-wide max-w-sm">
              An independent luxury tea house preserving small-batch orthodox
              agricultural legacies. Plucked at dawn, refined by hand, dispatched
              from the cradle of Indian tea.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-[0.5px] bg-brand-gold/30" />
              <span className="font-sans text-[9px] tracking-editorial uppercase text-brand-gold/40">
                Est. 1837
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="lg:col-span-2 space-y-5 lg:col-start-auto first:lg:col-start-7">
              <h4 className="font-sans text-[10px] uppercase tracking-editorial text-brand-gold/60 font-medium">
                {category === 'collection' ? 'The Collection' : category === 'house' ? 'The House' : 'Services'}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="font-sans text-[12px] tracking-wide text-brand-cream/30 hover:text-brand-cream/70 transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Lower bar */}
        <div className="pt-8 flex flex-col lg:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4 text-[10px] font-sans tracking-editorial uppercase text-brand-cream/20">
            <span>© {new Date().getFullYear()} Chabua First Leaf</span>
            <span className="text-brand-cream/10">·</span>
            <Link to="/privacy" className="hover:text-brand-cream/40 transition-colors">Privacy</Link>
            <span className="text-brand-cream/10">·</span>
            <Link to="/terms" className="hover:text-brand-cream/40 transition-colors">Terms</Link>
            <span className="text-brand-cream/10">·</span>
            <Link to="/shipping" className="hover:text-brand-cream/40 transition-colors">Shipping</Link>
            <span className="text-brand-cream/10">·</span>
            <Link to="/returns" className="hover:text-brand-cream/40 transition-colors">Returns</Link>
          </div>

          <p className="text-[9px] font-sans tracking-editorial uppercase text-brand-gold/25 text-center">
            Assam · London · New York · Dubai
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-[10px] font-sans tracking-editorial uppercase text-brand-cream/20 hover:text-brand-gold/60 transition-all group cursor-pointer"
            aria-label="Return to top"
          >
            <span>Return to Top</span>
            <ArrowUp className="w-3 h-3 transition-transform group-hover:-translate-y-0.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </footer>
  );
}
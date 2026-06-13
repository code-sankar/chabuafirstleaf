import React from 'react';

import AccountSidebar from '../components/account/AccountSidebar';

/**
 * AccountLayout is rendered inside the public shell — the main Navbar
 * is still present at the top (the customer can browse mid-session)
 * and the Footer follows the content. Only the sidebar + the page
 * outlet are unique to the account area.
 */
export default function AccountLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-brand-cream pt-24 md:pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Page heading */}
        {(title || subtitle) && (
          <header className="mb-12 max-w-2xl">
            {subtitle && (
              <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-3">
                {subtitle}
              </p>
            )}
            {title && (
              <h1 className="font-serif text-4xl md:text-5xl text-brand-forest tracking-wide">
                {title}
              </h1>
            )}
            <div className="w-12 h-[0.5px] bg-brand-gold/40 mt-6" />
          </header>
        )}

        {/* Two-column grid: sidebar + content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <AccountSidebar />
          </div>
          <div className="lg:col-span-9 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
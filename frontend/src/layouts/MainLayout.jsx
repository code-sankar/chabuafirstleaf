import React, { useState } from 'react';
import Navbar from '../components/common/Navbar.jsx';
import Cart from '../components/common/Cart.jsx';
import Checkout from '../components/common/Checkout.jsx';
import Footer from '../components/common/Footer.jsx';
import CustomCursor from '../components/common/CustomCursor.jsx';

export default function MainLayout({ children }) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Expose checkout trigger globally (used by Cart.jsx)
  if (typeof window !== 'undefined') {
    window.triggerCheckoutWindow = () => setIsCheckoutOpen(true);
  }

  return (
    <div className="min-h-screen bg-brand-cream selection:bg-brand-gold/30">
      <CustomCursor />
      <Navbar />
      <Cart />
      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
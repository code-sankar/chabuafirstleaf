import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, User, Package, Heart, LogOut } from 'lucide-react';
import {
  toggleCart,
  selectCartCount,
  selectUser,
  selectWishlistCount,
} from '../../store';
import { signOut } from '../../services/authService';

const navLinks = [
  { label: 'Heritage', to: '/', hash: '#heritage' },
  { label: 'Collection', to: '/collection' },
  { label: 'Our Story', to: '/our-story' },
  { label: 'Journal', to: '/journal' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const user = useSelector(selectUser);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const lastScrollY = useRef(0);
  const accountRef = useRef(null);

  const isHomePage = pathname === '/';

  /* Scroll behaviour — hide on down-scroll, frosted glass when scrolled */
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const previousY = lastScrollY.current;
      setIsScrolled(currentY > 60);
      setIsHidden(currentY > previousY && currentY > 400);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isMobileMenuOpen]);

  /* Close mobile menu and account dropdown on route change */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);
  }, [pathname]);

  /* Click-outside for account dropdown */
  useEffect(() => {
    if (!isAccountOpen) return;
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isAccountOpen]);

  const scrollToHash = useCallback((hash) => {
    const el = document.querySelector(hash);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  const handleNavClick = useCallback((e, link) => {
    e.preventDefault();
    if (!link.hash) { navigate(link.to); return; }
    if (pathname === '/') { scrollToHash(link.hash); return; }
    navigate('/');
    setTimeout(() => scrollToHash(link.hash), 100);
  }, [navigate, pathname, scrollToHash]);

  const handleSignOut = async () => {
    await signOut();
    setIsAccountOpen(false);
    navigate('/');
  };

  const handleAccountIconClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsAccountOpen((v) => !v);
  };

  const headerClass = !isHomePage
    ? 'bg-brand-forest border-b border-brand-gold/10'
    : isScrolled
      ? 'luxury-glass border-b border-brand-gold/8'
      : 'bg-transparent';

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${headerClass}`}
      animate={{ y: isHidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 md:h-24 flex items-center justify-between">

        {/* Mobile menu trigger */}
        <div className="flex-1 flex md:hidden justify-start">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-brand-cream/80 hover:text-brand-gold transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen
              ? <X className="w-5 h-5" strokeWidth={1} />
              : <Menu className="w-5 h-5" strokeWidth={1} />}
          </button>
        </div>

        {/* Desktop nav — left side */}
        <nav className="flex-1 hidden md:flex items-center gap-10 text-[11px] tracking-editorial uppercase text-brand-cream/60 font-sans font-light">
          {navLinks.slice(0, 2).map((link) => (
            <a
              key={link.label}
              href={link.hash || link.to}
              onClick={(e) => handleNavClick(e, link)}
              className="editorial-link hover:text-brand-cream transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Brand mark */}
        <div className="flex-1 flex justify-center">
          <Link
            to="/"
            className="font-serif text-lg md:text-xl tracking-[0.2em] text-brand-cream whitespace-nowrap transition-opacity hover:opacity-80"
          >
            <span className="font-light">CHABUA</span>
            <span className="hidden sm:inline text-brand-gold/40 mx-2 font-light">·</span>
            <span className="hidden sm:inline font-light">FIRST LEAF</span>
          </Link>
        </div>

        {/* Desktop nav — right side + icons */}
        <div className="flex-1 flex items-center justify-end gap-6 md:gap-8">
          <nav className="hidden md:flex items-center gap-10 text-[11px] tracking-editorial uppercase text-brand-cream/60 font-sans font-light">
            {navLinks.slice(2).map((link) => (
              <a
                key={link.label}
                href={link.hash || link.to}
                onClick={(e) => handleNavClick(e, link)}
                className="editorial-link hover:text-brand-cream transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Account icon — opens dropdown if signed in, else navigates to /login */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={handleAccountIconClick}
              className="relative text-brand-cream/70 hover:text-brand-gold transition-colors cursor-pointer"
              aria-label={user ? 'Account menu' : 'Sign in'}
              aria-expanded={isAccountOpen}
            >
              <User className="w-[18px] h-[18px]" strokeWidth={1} />
              {user && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-gold rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {isAccountOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-3 w-64 bg-brand-cream border border-brand-forest/10 shadow-xl"
                >
                  <div className="px-5 py-4 border-b border-brand-forest/5">
                    <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-1">
                      Signed In As
                    </p>
                    <p className="font-serif text-sm text-brand-forest truncate">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                  </div>

                  <nav className="py-2">
                    <DropdownItem to="/account" icon={User} label="Account" />
                    <DropdownItem to="/account/orders" icon={Package} label="Orders" />
                    <DropdownItem to="/account/wishlist" icon={Heart} label="Wishlist" />
                  </nav>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-5 py-3 font-sans text-[12px] tracking-wide text-brand-muted hover:text-brand-forest hover:bg-brand-forest/[0.03] border-t border-brand-forest/5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart icon */}
          <button
            onClick={() => dispatch(toggleCart())}
            className="relative flex items-center text-brand-cream/70 hover:text-brand-gold transition-colors cursor-pointer"
            aria-label={`Shopping bag with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
          >
            <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1} />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-brand-gold text-brand-forest text-[9px] font-sans font-bold rounded-full"
              >
                {cartCount}
              </motion.span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="md:hidden fixed inset-0 top-20 luxury-glass z-30"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-8 pb-20">
              {navLinks.map((link, idx) => (
                <motion.a
                  key={link.label}
                  href={link.hash || link.to}
                  onClick={(e) => handleNavClick(e, link)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                  className="font-serif text-2xl tracking-[0.15em] text-brand-cream/80 hover:text-brand-gold transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-4 pt-4 border-t border-brand-gold/10 w-32"
              >
                {user ? (
                  <>
                    <Link to="/account" className="font-sans text-xs tracking-widest uppercase text-brand-cream/60 hover:text-brand-gold transition-colors">
                      Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="font-sans text-xs tracking-widest uppercase text-brand-cream/60 hover:text-brand-gold transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="font-sans text-xs tracking-widest uppercase text-brand-cream/60 hover:text-brand-gold transition-colors">
                    Sign In
                  </Link>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-center"
              >
                <div className="w-8 h-[0.5px] bg-brand-gold/30 mx-auto mb-4" />
                <p className="font-sans text-[10px] tracking-editorial uppercase text-brand-cream/30">
                  Est. 1837 · Chabua, Assam
                </p>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function DropdownItem({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-5 py-2.5 font-sans text-[12px] tracking-wide text-brand-charcoal hover:text-brand-forest hover:bg-brand-forest/[0.03] transition-colors"
    >
      <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
      <span>{label}</span>
    </Link>
  );
}
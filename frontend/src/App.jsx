import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';

import { useAuthInit } from './hooks/useAuth';
import { selectPreloaderDone } from './store';

import SEOHead from './components/seo/SEOHead';
import { OrganizationStructuredData } from './components/seo/StructuredData';
import Preloader from './components/common/Preloader';
import Navbar from './components/common/Navbar';
import Cart from './components/common/Cart';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import AuthGate from './components/common/AuthGate';

/* ─── Public pages ───────────────────────────────────────────── */
const Home          = lazy(() => import('./pages/main/Home'));
const OurStory      = lazy(() => import('./pages/main/OurStory'));
const Collection    = lazy(() => import('./pages/main/Collection'));
const ProductDetail = lazy(() => import('./pages/main/ProductDetail'));
const JournalPage   = lazy(() => import('./pages/main/JournalPage'));
const JournalPost   = lazy(() => import('./pages/main/JournalPost'));
const OrderTracking = lazy(() => import('./pages/main/OrderTracking'));

/* ─── Checkout (its own shell) ──────────────────────────────── */
const CheckoutPage  = lazy(() => import('./pages/main/CheckoutPage'));

/* ─── Auth pages ───────────────────────────────────────────── */
const Login          = lazy(() => import('./pages/auth/Login'));
const Signup         = lazy(() => import('./pages/auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/auth/ResetPassword'));

/* ─── Account pages (gated) ─────────────────────────────────── */
const AccountHome  = lazy(() => import('./pages/account/AccountHome'));
const Profile      = lazy(() => import('./pages/account/Profile'));
const Orders       = lazy(() => import('./pages/account/Orders'));
const OrderDetail  = lazy(() => import('./pages/account/OrderDetail'));
const Addresses    = lazy(() => import('./pages/account/Addresses'));
const Wishlist     = lazy(() => import('./pages/account/Wishlist'));

/* ─── Admin ────────────────────────────────────────────────── */
const Admin = lazy(() => import('./pages/admin/Admin'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-[0.5px] bg-brand-gold/20 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-brand-gold/60 animate-shimmer" />
        </div>
        <span className="font-sans text-[10px] tracking-editorial uppercase text-brand-muted/40">
          Loading
        </span>
      </div>
    </div>
  );
}

function Lazy({ Component }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

/* Wraps a component in both Suspense + AuthGate. Used for /account/* */
function Gated({ Component }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AuthGate>
        <Component />
      </AuthGate>
    </Suspense>
  );
}

export default function App() {
  useAuthInit();
  const isPreloaderDone = useSelector(selectPreloaderDone);
  const { pathname } = useLocation();

  /*
   * Three shells, identified purely by pathname:
   *
   *   • Admin shell   — /admin and below. No preloader, no public chrome.
   *   • Bare shell    — /checkout, /login, /signup, /forgot-password, /reset-password.
   *                     Bring their own headers; the public Navbar/Cart/Footer are
   *                     hidden here.
   *   • Public shell  — everything else. Preloader on first load, Navbar, Cart, Footer.
   */
  const isAdminRoute = pathname.startsWith('/admin');
  const isBareRoute =
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  return (
    <HelmetProvider>
      <SEOHead />
      <OrganizationStructuredData />

      {/* Preloader: public routes only */}
      {!isPreloaderDone && !isAdminRoute && !isBareRoute && <Preloader />}

      {/* Admin shell */}
      {isAdminRoute && (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/admin"   element={<Admin />} />
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      )}

      {/* Bare shell — checkout & auth */}
      {isBareRoute && (
        <>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/checkout"        element={<CheckoutPage />} />
              <Route path="/login"           element={<Login />} />
              <Route path="/signup"          element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password"  element={<ResetPassword />} />
            </Routes>
          </Suspense>
        </>
      )}

      {/* Public shell */}
      {!isAdminRoute && !isBareRoute && isPreloaderDone && (
        <div className="min-h-screen bg-brand-cream">
          <ScrollToTop />

          <Navbar />
          <Cart />

          <main>
            <Routes>
              {/* Catalog */}
              <Route path="/"              element={<Lazy Component={Home} />} />
              <Route path="/our-story"     element={<Lazy Component={OurStory} />} />
              <Route path="/collection"    element={<Lazy Component={Collection} />} />
              <Route path="/product/:slug" element={<Lazy Component={ProductDetail} />} />
              <Route path="/journal"       element={<Lazy Component={JournalPage} />} />
              <Route path="/journal/:slug" element={<Lazy Component={JournalPost} />} />

              {/* Guest order lookup */}
              <Route path="/track"         element={<Lazy Component={OrderTracking} />} />

              {/* Customer account (gated) */}
              <Route path="/account"                element={<Gated Component={AccountHome} />} />
              <Route path="/account/profile"        element={<Gated Component={Profile} />} />
              <Route path="/account/orders"         element={<Gated Component={Orders} />} />
              <Route path="/account/orders/:id"     element={<Gated Component={OrderDetail} />} />
              <Route path="/account/addresses"      element={<Gated Component={Addresses} />} />
              <Route path="/account/wishlist"       element={<Gated Component={Wishlist} />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      )}
    </HelmetProvider>
  );
}
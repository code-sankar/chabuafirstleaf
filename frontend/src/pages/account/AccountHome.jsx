import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Package, MapPin, Heart, User, ArrowRight } from 'lucide-react';

import AccountLayout from '../../layouts/AccountLayout';
import OrderCard from '../../components/account/OrderCard';
import {
  selectUser,
  selectWishlistCount,
  selectOrders,
  setOrders,
  setOrdersLoading,
} from '../../store';
import { getMyOrders } from '../../services/orderService';

export default function AccountHome() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const orders = useSelector(selectOrders);
  const wishlistCount = useSelector(selectWishlistCount);

  const [loading, setLoading] = useState(orders.length === 0);
  const [error, setError] = useState('');

  /* Fetch a small slice of recent orders for the overview card */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        dispatch(setOrdersLoading(true));
        const data = await getMyOrders({ limit: 3 });
        if (!cancelled) {
          dispatch(setOrders(data.orders || []));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
          dispatch(setOrdersLoading(false));
        }
      }
    })();
    return () => { cancelled = true; };
  }, [dispatch]);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';
  const mostRecent = orders[0];

  return (
    <>
      <Helmet>
        <title>Account · Chabua First Leaf</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <AccountLayout subtitle="Welcome back" title={`Good day, ${firstName}.`}>
        <div className="space-y-12">
          {/* Most recent order */}
          <section>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="font-serif text-2xl text-brand-forest tracking-wide">
                Most Recent Order
              </h2>
              {orders.length > 0 && (
                <Link
                  to="/account/orders"
                  className="font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors"
                >
                  View all →
                </Link>
              )}
            </div>

            {loading && <SkeletonCard />}

            {!loading && !mostRecent && !error && (
              <div className="bg-white border border-brand-forest/5 p-10 md:p-12 text-center">
                <Package className="w-8 h-8 text-brand-gold/30 mx-auto mb-5" strokeWidth={1} />
                <p className="font-serif text-xl text-brand-forest mb-3">
                  Your archive is empty
                </p>
                <p className="font-sans text-sm text-brand-muted mb-8 max-w-md mx-auto">
                  When you place your first reserve from the Chabua estate, it will appear here.
                </p>
                <Link
                  to="/collection"
                  className="inline-block font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors"
                >
                  Explore the Collection
                </Link>
              </div>
            )}

            {!loading && mostRecent && (
              <OrderCard order={mostRecent} />
            )}

            {error && !loading && (
              <p className="font-sans text-xs text-brand-muted italic">
                We couldn't load your orders just now. Please refresh in a moment.
              </p>
            )}
          </section>

          {/* Quick links grid */}
          <section>
            <h2 className="font-serif text-2xl text-brand-forest tracking-wide mb-5">
              Your Account
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickLink to="/account/orders"    icon={Package} label="Orders"    hint="Track and review past purchases" />
              <QuickLink to="/account/addresses" icon={MapPin}  label="Addresses" hint="Saved delivery destinations" />
              <QuickLink to="/account/wishlist"  icon={Heart}   label="Wishlist"  hint={`${wishlistCount} saved ${wishlistCount === 1 ? 'reserve' : 'reserves'}`} />
              <QuickLink to="/account/profile"   icon={User}    label="Profile"   hint="Name, contact, password" />
            </div>
          </section>
        </div>
      </AccountLayout>
    </>
  );
}

function QuickLink({ to, icon: Icon, label, hint }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 bg-white border border-brand-forest/5 hover:border-brand-gold/30 p-6 transition-colors"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 border border-brand-gold/30 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-brand-gold" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="font-serif text-lg text-brand-forest leading-tight">{label}</p>
          <p className="font-sans text-[11px] text-brand-muted mt-0.5 truncate">{hint}</p>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-brand-muted/40 group-hover:text-brand-forest transition-colors shrink-0" strokeWidth={1.5} />
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-brand-forest/5 p-6 md:p-7 animate-pulse">
      <div className="flex items-start justify-between mb-5">
        <div className="space-y-2">
          <div className="w-12 h-2 bg-brand-forest/5" />
          <div className="w-40 h-5 bg-brand-forest/5" />
          <div className="w-28 h-2 bg-brand-forest/5" />
        </div>
        <div className="w-20 h-3 bg-brand-forest/5" />
      </div>
      <div className="flex items-center gap-2 mb-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-12 h-14 bg-brand-forest/5" />
        ))}
      </div>
      <div className="flex justify-between pt-4 border-t border-brand-forest/5">
        <div className="w-16 h-3 bg-brand-forest/5" />
        <div className="w-20 h-4 bg-brand-forest/5" />
      </div>
    </div>
  );
}
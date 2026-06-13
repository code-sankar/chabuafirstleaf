import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Loader, Package } from 'lucide-react';

import AccountLayout from '../../layouts/AccountLayout';
import OrderCard from '../../components/account/OrderCard';
import { selectOrders, setOrders, setOrdersLoading } from '../../store';
import { getMyOrders } from '../../services/orderService';

const PAGE_SIZE = 10;

export default function Orders() {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);

  const [loading, setLoading] = useState(orders.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);

  /* Initial load */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        dispatch(setOrdersLoading(true));
        const data = await getMyOrders({ limit: PAGE_SIZE, offset: 0 });
        if (!cancelled) {
          dispatch(setOrders(data.orders || []));
          setHasMore((data.orders || []).length === PAGE_SIZE);
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

  /* Load more (pagination) */
  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await getMyOrders({ limit: PAGE_SIZE, offset: orders.length });
      const newOrders = data.orders || [];
      dispatch(setOrders([...orders, ...newOrders]));
      setHasMore(newOrders.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Orders · Chabua First Leaf</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <AccountLayout subtitle="Account" title="Your Orders">
        {loading && <OrdersLoadingState />}

        {!loading && error && orders.length === 0 && (
          <ErrorState message={error} />
        )}

        {!loading && orders.length === 0 && !error && (
          <EmptyState />
        )}

        {!loading && orders.length > 0 && (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id || order.orderNumber} order={order} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loadingMore
                    ? <><Loader className="w-3.5 h-3.5 animate-spin" /><span>Loading…</span></>
                    : <span>Load more orders</span>}
                </button>
              </div>
            )}
          </>
        )}
      </AccountLayout>
    </>
  );
}

function OrdersLoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-brand-forest/5 p-6 md:p-7 animate-pulse">
          <div className="h-5 w-40 bg-brand-forest/5 mb-3" />
          <div className="h-2 w-28 bg-brand-forest/5 mb-6" />
          <div className="flex gap-2 mb-5">
            {[1, 2, 3].map((j) => <div key={j} className="w-12 h-14 bg-brand-forest/5" />)}
          </div>
          <div className="flex justify-between pt-4 border-t border-brand-forest/5">
            <div className="h-3 w-16 bg-brand-forest/5" />
            <div className="h-4 w-20 bg-brand-forest/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-brand-forest/5 p-12 md:p-16 text-center">
      <Package className="w-10 h-10 text-brand-gold/30 mx-auto mb-6" strokeWidth={1} />
      <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-3">
        Your Archive is Empty
      </p>
      <h2 className="font-serif text-2xl text-brand-forest tracking-wide mb-4">
        No orders just yet
      </h2>
      <p className="font-serif italic text-brand-muted leading-relaxed mb-8 max-w-md mx-auto">
        Your reserves from the Chabua estate will be catalogued here as soon as your first allocation is placed.
      </p>
      <Link
        to="/collection"
        className="inline-block font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors"
      >
        Explore the Collection
      </Link>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="bg-white border border-red-200/60 p-10 text-center">
      <p className="font-serif text-xl text-brand-forest mb-2">We couldn't load your orders</p>
      <p className="font-sans text-sm text-brand-muted mb-6">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
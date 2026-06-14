import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingBag, Users, Loader, TrendingUp, CalendarDays, AlertCircle,
} from 'lucide-react';

import { getAnalytics } from '../../services/adminService';

/**
 * Dashboard — single-screen operational overview.
 *
 * Source: GET /api/orders/admin/analytics → {
 *   totalRevenueUSD, monthlyRevenueUSD, ordersToday,
 *   averageOrderValueUSD, totalCustomers, totalOrders
 * }
 *
 * Previously this page used placeholder math (monthly = total*0.85,
 * conversion = 4.8). With Phase 3b's controller the values are real.
 */

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAnalytics();
        if (!cancelled) setAnalytics(data?.analytics || null);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to connect to the analytics server. Please check your connection.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-brand-muted">
        <Loader className="w-6 h-6 animate-spin stroke-[1.5] mr-2" />
        <span className="font-sans text-xs uppercase tracking-widest">Loading analytics…</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-white border border-red-200/60 p-8 text-center">
        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-3" strokeWidth={1.5} />
        <p className="font-serif text-lg text-brand-forest mb-2">Could not load analytics</p>
        <p className="font-sans text-sm text-brand-muted">
          {error || 'No data returned. Are there any orders yet?'}
        </p>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Revenue',
      value: `$${Number(analytics.totalRevenueUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `${analytics.totalOrders || 0} captured orders`,
      icon: DollarSign,
    },
    {
      label: 'Monthly Revenue',
      value: `$${Number(analytics.monthlyRevenueUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'This calendar month',
      icon: TrendingUp,
    },
    {
      label: 'Orders Today',
      value: String(analytics.ordersToday || 0),
      sub: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }),
      icon: CalendarDays,
    },
    {
      label: 'Avg Order Value',
      value: `$${Number(analytics.averageOrderValueUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'Across all captured orders',
      icon: ShoppingBag,
    },
    {
      label: 'Total Customers',
      value: String(analytics.totalCustomers || 0),
      sub: 'Unique buyers',
      icon: Users,
    },
    {
      label: 'Total Orders',
      value: String(analytics.totalOrders || 0),
      sub: 'Lifetime',
      icon: ShoppingBag,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } },
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-brand-charcoal/10 pb-6">
        <p className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-1">
          Operations Overview
        </p>
        <h1 className="font-serif text-3xl text-brand-forest tracking-wide">Dashboard</h1>
      </div>

      {/* Metric grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={cardVariants}
              className="bg-white border border-brand-charcoal/5 p-6 hover:border-brand-gold/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
                  {card.label}
                </p>
                <div className="w-9 h-9 border border-brand-gold/30 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-brand-gold" strokeWidth={1.5} />
                </div>
              </div>
              <p className="font-serif text-3xl text-brand-forest tracking-wide tabular-nums">
                {card.value}
              </p>
              <p className="font-sans text-[11px] text-brand-muted mt-2">
                {card.sub}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Helpful next-step hint */}
      <div className="border-t border-brand-charcoal/10 pt-6">
        <p className="font-sans text-[11px] text-brand-muted leading-relaxed max-w-2xl">
          Cancelled and Refunded orders are excluded from revenue, order count, and AOV.
          Use Order Logistics to update status or process refunds; the Patron Registry shows
          per-customer lifetime value.
        </p>
      </div>
    </div>
  );
}
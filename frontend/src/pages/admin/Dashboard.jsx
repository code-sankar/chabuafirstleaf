import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, BarChart3, Users, ArrowUpRight, Loader } from 'lucide-react';
import axios from 'axios';
import env from '../../config/env';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchMatrixData = async () => {
      try {
        const response = await axios.get(
          `${env.API_BASE_URL}/api/orders/admin/analytics`,
          { signal: controller.signal, timeout: 10000 }
        );
        if (response.data.success) {
          setAnalytics(response.data.analytics);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          setErrorText('Failed to connect to the analytics server. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMatrixData();
    return () => controller.abort();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } },
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center text-brand-muted">
        <Loader className="w-6 h-6 animate-spin stroke-[1.5] mr-2" />
        <span className="font-sans text-xs uppercase tracking-widest">Loading Analytics…</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="border-b border-brand-charcoal/10 pb-6">
        <p className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-1">
          Operations Overview
        </p>
        <h1 className="font-serif text-3xl text-brand-forest tracking-wide">
          Dashboard
        </h1>
      </div>

      {errorText && (
        <div className="p-4 bg-red-50 text-red-700 font-sans text-xs border border-red-100" role="alert">
          {errorText}
        </div>
      )}

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="bg-white p-6 border border-brand-forest/5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-brand-cream border border-brand-gold/20 text-brand-gold">
              <DollarSign className="w-4 h-4 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-sans text-emerald-600 bg-emerald-50 px-2 py-0.5 tracking-wider font-bold rounded-full flex items-center gap-0.5">
              +14.2% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold">
              Total Revenue
            </p>
            <h3 className="font-serif text-2xl text-brand-forest font-semibold mt-1">
              ${analytics?.totalRevenueUSD?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white p-6 border border-brand-forest/5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-brand-cream border border-brand-gold/20 text-brand-gold">
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-sans text-brand-gold bg-brand-cream px-2 py-0.5 tracking-wider font-bold rounded-full">
              Active
            </span>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold">
              Orders Today
            </p>
            <h3 className="font-serif text-2xl text-brand-forest font-semibold mt-1">
              {analytics?.ordersToday ?? 0}
            </h3>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white p-6 border border-brand-forest/5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-brand-cream border border-brand-gold/20 text-brand-gold">
              <BarChart3 className="w-4 h-4 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-sans text-emerald-600 bg-emerald-50 px-2 py-0.5 tracking-wider font-bold rounded-full">
              Optimal
            </span>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold">
              Conversion Rate
            </p>
            <h3 className="font-serif text-2xl text-brand-forest font-semibold mt-1">
              {analytics?.conversionRatePercent ?? 0}%
            </h3>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white p-6 border border-brand-forest/5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-brand-cream border border-brand-gold/20 text-brand-gold">
              <Users className="w-4 h-4 stroke-[1.5]" />
            </div>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold">
              Monthly Revenue
            </p>
            <h3 className="font-serif text-2xl text-brand-forest font-semibold mt-1">
              ${analytics?.monthlyRevenueUSD?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '0.00'}
            </h3>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

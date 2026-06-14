import React, { lazy, Suspense, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout.jsx';
import AdminGate from './AdminGate.jsx';

const Dashboard       = lazy(() => import('./Dashboard'));
const Inventory       = lazy(() => import('./Inventory'));
const OrderManagement = lazy(() => import('./OrderManagement'));
const Customers       = lazy(() => import('./Customers'));
const SubscriberList  = lazy(() => import('./SubscriberList'));

const TAB_REGISTRY = {
  dashboard:   Dashboard,
  inventory:   Inventory,
  orders:      OrderManagement,
  customers:   Customers,
  subscribers: SubscriberList,
};

function AdminFallback() {
  return (
    <div className="h-[60vh] flex items-center justify-center text-brand-muted">
      <Loader className="w-5 h-5 animate-spin mr-3 stroke-[1.5]" />
      <span className="font-sans text-xs uppercase tracking-widest">Loading panel…</span>
    </div>
  );
}

export default function Admin() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const ActivePane = TAB_REGISTRY[currentTab] ?? Dashboard;

  return (
    <>
      <Helmet>
        <title>Admin · Chabua First Leaf</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminGate>
        <AdminLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.215, 0.610, 0.355, 1] }}
            >
              <Suspense fallback={<AdminFallback />}>
                <ActivePane />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </AdminLayout>
      </AdminGate>
    </>
  );
}
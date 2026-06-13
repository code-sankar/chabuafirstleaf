import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Loader, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import axios from 'axios';

const MOCK_ORDERS = [
  { id: "ord_001", order_number: "CFL-2026-000001", customer_name: "Alistair Pemberton", customer_email: "a.pemberton@gmail.com", subtotal: 390.00, status: "Paid", created_at: "2026-06-01T10:23:00Z" },
  { id: "ord_002", order_number: "CFL-2026-000002", customer_name: "Priya Nair", customer_email: "priya.nair@email.com", subtotal: 245.00, status: "Shipped", created_at: "2026-06-02T14:05:00Z" },
  { id: "ord_003", order_number: "CFL-2026-000003", customer_name: "Jean-Luc Moreau", customer_email: "jl.moreau@outlook.com", subtotal: 605.00, status: "Delivered", created_at: "2026-06-03T09:44:00Z" },
  { id: "ord_004", order_number: "CFL-2026-000004", customer_name: "Fatima Al-Rashid", customer_email: "f.alrashid@icloud.com", subtotal: 180.00, status: "Paid", created_at: "2026-06-04T16:12:00Z" },
  { id: "ord_005", order_number: "CFL-2026-000005", customer_name: "Marcus Webb", customer_email: "m.webb@proton.me", subtotal: 420.00, status: "Cancelled", created_at: "2026-06-04T19:33:00Z" },
];

const STATUS_OPTIONS = ["Paid", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusConfig = {
  Paid:       { icon: Clock,        color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  Processing: { icon: Package,      color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
  Shipped:    { icon: Truck,        color: "text-purple-600",  bg: "bg-purple-50",  border: "border-purple-200" },
  Delivered:  { icon: CheckCircle,  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  Cancelled:  { icon: XCircle,      color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200" },
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/admin/list');
        if (res.data?.success && res.data.orders?.length) {
          setOrders(res.data.orders);
        } else {
          setOrders(MOCK_ORDERS);
        }
      } catch {
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.patch(`http://localhost:5000/api/orders/admin/orders/${orderId}/status`, { status: newStatus });
    } catch {
      // Proceed with local update
    }
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    setUpdatingId(null);
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-brand-muted">
        <Loader className="w-5 h-5 animate-spin mr-2 stroke-[1.5]" />
        <span className="font-sans text-xs uppercase tracking-widest">Fetching Order Ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="border-b border-brand-charcoal/10 pb-6">
        <p className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-1">
          Allocation Management
        </p>
        <h1 className="font-serif text-3xl text-brand-forest tracking-wide">Order Logistics</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {["All", ...STATUS_OPTIONS].map((status) => {
          const count = status === "All" ? orders.length : orders.filter((o) => o.status === status).length;
          const cfg = statusConfig[status] || {};
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`p-4 border text-left transition-all duration-300 cursor-pointer ${
                filterStatus === status
                  ? 'border-brand-gold bg-brand-cream shadow-sm'
                  : 'border-brand-forest/5 bg-white hover:border-brand-gold/40'
              }`}
            >
              <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-1">{status}</p>
              <p className="font-serif text-xl text-brand-forest font-semibold">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted stroke-[1.5]" />
          <input
            type="text"
            placeholder="Search by order number, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-3 border border-brand-forest/10 bg-white font-sans text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold placeholder-brand-muted/50 tracking-wide"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-brand-forest/5 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-charcoal/5 flex items-center justify-between">
          <h3 className="font-serif text-base text-brand-forest tracking-wide">
            {filtered.length} Allocation{filtered.length !== 1 ? 's' : ''}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-charcoal/5 bg-brand-cream/30">
                {["Order #", "Customer", "Total", "Date", "Status", "Update"].map((col) => (
                  <th key={col} className="text-left px-6 py-3 font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center font-serif italic text-brand-muted">
                      No orders match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((order, i) => {
                    const cfg = statusConfig[order.status] || statusConfig.Paid;
                    const StatusIcon = cfg.icon;
                    const isUpdating = updatingId === order.id;
                    return (
                      <motion.tr
                        key={order.id}
                        className="border-b border-brand-charcoal/5 hover:bg-brand-cream/20 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <td className="px-6 py-4">
                          <span className="font-sans text-xs font-bold text-brand-forest tracking-wider">
                            {order.order_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-sans text-sm text-brand-charcoal font-medium">{order.customer_name}</p>
                          <p className="font-sans text-[11px] text-brand-muted">{order.customer_email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-serif text-sm text-brand-charcoal font-semibold">
                            ${Number(order.subtotal).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-sans text-xs text-brand-muted">
                            {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-sans text-[10px] uppercase tracking-widest font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            <StatusIcon className="w-3 h-3" />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            {isUpdating ? (
                              <Loader className="w-4 h-4 animate-spin text-brand-muted" />
                            ) : (
                              <div className="relative inline-block">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className="appearance-none bg-brand-cream/50 border border-brand-forest/10 px-3 py-1.5 pr-7 font-sans text-xs text-brand-charcoal focus:outline-none focus:border-brand-gold cursor-pointer tracking-wide"
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-muted pointer-events-none" />
                              </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
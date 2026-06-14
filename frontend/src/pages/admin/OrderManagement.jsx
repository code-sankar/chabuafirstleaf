import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Loader, Package, Clock, CheckCircle, XCircle, Truck,
  RotateCcw, ShieldAlert, PackageCheck, AlertCircle,
} from 'lucide-react';

import { listOrders, updateOrderStatus } from '../../services/adminService';
import RefundModal from './RefundModal';

/**
 * OrderManagement — admin's primary working surface.
 *
 *   - Inline status dropdown drives PATCH /admin/orders/:id/status
 *     (when status → Shipped, the backend auto-creates the Shiprocket
 *     shipment and emails the customer; the response.shipping payload
 *     is surfaced briefly as a toast)
 *   - Refund button opens RefundModal → POST /admin/orders/:id/refund
 *   - 8 statuses match the backend's VALID_STATUSES exactly
 */

const STATUS_OPTIONS = [
  'Pending', 'Paid', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded',
];

const STATUS_CONFIG = {
  Pending:    { icon: Clock,        color: 'text-brand-muted',   bg: 'bg-brand-cream/60', border: 'border-brand-charcoal/15' },
  Paid:       { icon: Clock,        color: 'text-blue-700',      bg: 'bg-blue-50',        border: 'border-blue-200' },
  Processing: { icon: Package,      color: 'text-amber-700',     bg: 'bg-amber-50',       border: 'border-amber-200' },
  Packed:     { icon: PackageCheck, color: 'text-amber-800',     bg: 'bg-amber-50',       border: 'border-amber-300' },
  Shipped:    { icon: Truck,        color: 'text-purple-700',    bg: 'bg-purple-50',      border: 'border-purple-200' },
  Delivered:  { icon: CheckCircle,  color: 'text-emerald-700',   bg: 'bg-emerald-50',     border: 'border-emerald-200' },
  Cancelled:  { icon: XCircle,      color: 'text-red-700',       bg: 'bg-red-50',         border: 'border-red-200' },
  Refunded:   { icon: RotateCcw,    color: 'text-rose-700',      bg: 'bg-rose-50',        border: 'border-rose-200' },
};

/* Refund button is shown only when there's a captured payment to refund */
const REFUNDABLE_STATUSES = ['Paid', 'Processing', 'Packed', 'Shipped', 'Delivered'];

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null); // { kind: 'success' | 'warn' | 'error', text }
  const [refundTarget, setRefundTarget] = useState(null);

  /* ─── Initial load + refetch helper ─────────────────────── */
  const fetchAll = async () => {
    setError('');
    try {
      const data = await listOrders({ limit: 200 });
      setOrders(data?.orders || []);
    } catch (err) {
      setError(err?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* Auto-dismiss toasts */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ─── Status change ─────────────────────────────────────── */
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const result = await updateOrderStatus(orderId, newStatus);

      // Optimistically reflect the new status locally
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

      // Surface Shiprocket result if status set to Shipped
      if (newStatus === 'Shipped') {
        if (result?.shipping?.success) {
          setToast({
            kind: 'success',
            text: `Shipment created · AWB ${result.shipping.trackingNumber || '—'} · ${result.shipping.courier || 'Courier'}`,
          });
        } else if (result?.shipping?.error) {
          setToast({
            kind: 'warn',
            text: `Status updated, but Shiprocket failed: ${result.shipping.error}`,
          });
        }
      }
    } catch (err) {
      setToast({ kind: 'error', text: err?.message || 'Status update failed.' });
    } finally {
      setUpdatingId(null);
    }
  };

  /* ─── Refund flow ────────────────────────────────────────── */
  const handleRefundOpen = (order) => setRefundTarget(order);
  const handleRefundClose = () => setRefundTarget(null);
  const handleRefunded = () => {
    setToast({ kind: 'success', text: 'Refund processed. Order will reflect Refunded status shortly.' });
    fetchAll(); // refetch so the row's status flips to Refunded
  };

  /* ─── Filter + search ───────────────────────────────────── */
  const filtered = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-brand-muted">
        <Loader className="w-5 h-5 animate-spin mr-2 stroke-[1.5]" />
        <span className="font-sans text-xs uppercase tracking-widest">Fetching order ledger…</span>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="bg-white border border-red-200/60 p-8 text-center">
        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-3" strokeWidth={1.5} />
        <p className="font-serif text-lg text-brand-forest mb-2">Could not load orders</p>
        <p className="font-sans text-sm text-brand-muted mb-4">{error}</p>
        <button
          onClick={fetchAll}
          className="font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors cursor-pointer"
        >
          Try again
        </button>
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

      {/* Status filter chips */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        {['All', ...STATUS_OPTIONS].map((status) => {
          const count = status === 'All' ? orders.length : orders.filter((o) => o.status === status).length;
          const isActive = filterStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`p-3 border text-left transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'border-brand-gold bg-brand-forest text-brand-cream'
                  : 'border-brand-charcoal/10 bg-white text-brand-charcoal hover:border-brand-gold/40'
              }`}
            >
              <p className={`font-sans text-[9px] uppercase tracking-widest mb-1 ${
                isActive ? 'text-brand-gold' : 'text-brand-muted'
              }`}>
                {status}
              </p>
              <p className={`font-serif text-lg tabular-nums ${
                isActive ? 'text-brand-cream' : 'text-brand-forest'
              }`}>
                {count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted/60" strokeWidth={1.5} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order number, customer name, or email…"
          className="w-full bg-white border border-brand-charcoal/10 pl-9 pr-4 py-3 font-sans text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold transition-colors"
        />
      </div>

      {/* Toast */}
      {toast && <Toast {...toast} />}

      {/* Table */}
      <div className="bg-white border border-brand-charcoal/5 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-charcoal/10 bg-brand-cream/40">
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th align="right">Total</Th>
              <Th>Placed</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center font-serif italic text-brand-muted">
                  No orders match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((order, i) => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                const StatusIcon = cfg.icon;
                const isUpdating = updatingId === order.id;
                const canRefund = REFUNDABLE_STATUSES.includes(order.status);
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="border-b border-brand-charcoal/5 hover:bg-brand-cream/20 transition-colors"
                  >
                    {/* Order number */}
                    <td className="px-6 py-4">
                      <span className="font-sans text-xs font-bold text-brand-forest tracking-wider tabular-nums">
                        {order.order_number}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="font-sans text-sm text-brand-charcoal font-medium">
                        {order.customer_name || '—'}
                      </p>
                      <p className="font-sans text-[11px] text-brand-muted">
                        {order.customer_email}
                      </p>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-serif text-sm text-brand-forest font-semibold tabular-nums">
                        ${Number(order.subtotal).toFixed(2)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <span className="font-sans text-xs text-brand-muted whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Status pill */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-sans text-[10px] uppercase tracking-widest font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <StatusIcon className="w-3 h-3" strokeWidth={1.5} />
                        {order.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status change */}
                        <div className="relative">
                          {isUpdating ? (
                            <Loader className="w-4 h-4 animate-spin text-brand-gold" strokeWidth={1.5} />
                          ) : (
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="bg-white border border-brand-charcoal/15 hover:border-brand-gold text-brand-charcoal font-sans text-[11px] uppercase tracking-widest px-3 py-2 focus:outline-none focus:border-brand-gold cursor-pointer transition-colors"
                              aria-label={`Change status for ${order.order_number}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Refund */}
                        {canRefund && (
                          <button
                            onClick={() => handleRefundOpen(order)}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1.5 px-3 py-2 font-sans text-[10px] uppercase tracking-widest font-bold text-red-700 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                            title="Refund this order"
                          >
                            <RotateCcw className="w-3 h-3" strokeWidth={2} />
                            <span>Refund</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <p className="font-sans text-[11px] text-brand-muted text-right">
        Showing {filtered.length} of {orders.length} {orders.length === 1 ? 'order' : 'orders'}
      </p>

      {/* Refund modal */}
      <RefundModal
        order={refundTarget}
        isOpen={Boolean(refundTarget)}
        onClose={handleRefundClose}
        onRefunded={handleRefunded}
      />
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function Th({ children, align = 'left' }) {
  return (
    <th className={`px-6 py-4 font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold ${
      align === 'right' ? 'text-right' : 'text-left'
    }`}>
      {children}
    </th>
  );
}

function Toast({ kind, text }) {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warn:    'bg-amber-50 border-amber-200 text-amber-900',
    error:   'bg-red-50 border-red-200 text-red-800',
  };
  const Icon = kind === 'error' ? AlertCircle : kind === 'warn' ? ShieldAlert : CheckCircle;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`flex items-start gap-2.5 p-3 border font-sans text-xs ${styles[kind]}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
      <span>{text}</span>
    </motion.div>
  );
}
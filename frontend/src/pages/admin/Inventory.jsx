import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Edit2, Save, X, Package, AlertTriangle, Loader, AlertCircle,
} from 'lucide-react';

import api from '../../services/api';

/**
 * Inventory — admin product editor.
 *
 *   Uses the shared api.js axios instance so the Supabase access token
 *   is attached automatically. Once the backend mounts requireAdmin on
 *   PATCH /api/products/:id, only signed-in admin users will be able
 *   to save edits — non-admins get a clear 403 message.
 */

const STATUS_CONFIG = {
  'In Stock':     { dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  'Low Stock':    { dot: 'bg-amber-400',   text: 'text-amber-600',   bg: 'bg-amber-50' },
  'Out of Stock': { dot: 'bg-red-500',     text: 'text-red-600',     bg: 'bg-red-50' },
};

function deriveStatus(count) {
  const n = Number(count);
  if (n === 0) return 'Out of Stock';
  if (n <= 15) return 'Low Stock';
  return 'In Stock';
}

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  /* ─── Load products ─────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/products');
        if (cancelled) return;
        const list = (data?.products || []).map((p) => ({
          ...p,
          status: deriveStatus(p.inventory_count),
        }));
        setProducts(list);
      } catch (err) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load inventory.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* Auto-dismiss save errors after a moment */
  useEffect(() => {
    if (!saveError) return;
    const t = setTimeout(() => setSaveError(''), 5000);
    return () => clearTimeout(t);
  }, [saveError]);

  const startEdit = (product) => {
    setSaveError('');
    setEditingId(product.id);
    setEditValues({ price: product.price, inventory_count: product.inventory_count });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
    setSaveError('');
  };

  const saveEdit = async (productId) => {
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        price: Number(editValues.price),
        inventory_count: Number(editValues.inventory_count),
      };
      await api.patch(`/api/products/${productId}`, payload);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, ...payload, status: deriveStatus(payload.inventory_count) }
            : p
        )
      );
      setEditingId(null);
      setEditValues({});
    } catch (err) {
      // Friendly message for the common auth failure modes
      let msg = err?.message || 'Save failed.';
      if (err?.status === 403) {
        msg = 'You do not have admin privileges to update inventory.';
      } else if (err?.status === 401) {
        msg = 'Your session has expired. Please sign in again.';
      }
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-brand-muted">
        <Loader className="w-5 h-5 animate-spin mr-2 stroke-[1.5]" />
        <span className="font-sans text-xs uppercase tracking-widest">Loading reserve inventory…</span>
      </div>
    );
  }

  if (loadError && products.length === 0) {
    return (
      <div className="bg-white border border-red-200/60 p-8 text-center">
        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-3" strokeWidth={1.5} />
        <p className="font-serif text-lg text-brand-forest mb-2">Could not load inventory</p>
        <p className="font-sans text-sm text-brand-muted">{loadError}</p>
      </div>
    );
  }

  const lowStockCount = products.filter(
    (p) => p.status === 'Low Stock' || p.status === 'Out of Stock'
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-brand-charcoal/10 pb-6">
        <p className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-1">
          Estate Reserves
        </p>
        <h1 className="font-serif text-3xl text-brand-forest tracking-wide">Inventory Control</h1>
      </div>

      {/* Alert Banner */}
      {lowStockCount > 0 && (
        <motion.div
          className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-700 font-sans text-xs tracking-wide"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {lowStockCount} product{lowStockCount > 1 ? 's' : ''} require attention — low stock or out of stock.
          </span>
        </motion.div>
      )}

      {/* Save error banner */}
      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 text-red-700 font-sans text-xs"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
          <span>{saveError}</span>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total SKUs',    value: products.length, icon: Package },
          { label: 'In Stock',      value: products.filter((p) => p.status === 'In Stock').length,     color: 'text-emerald-600' },
          { label: 'Low Stock',     value: products.filter((p) => p.status === 'Low Stock').length,    color: 'text-amber-600' },
          { label: 'Out of Stock',  value: products.filter((p) => p.status === 'Out of Stock').length, color: 'text-red-600' },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white border border-brand-forest/5 p-5 shadow-sm"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-1">
              {item.label}
            </p>
            <p className={`font-serif text-2xl font-semibold text-brand-forest ${item.color || ''}`}>
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-brand-forest/5 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-charcoal/5">
          <h3 className="font-serif text-base text-brand-forest tracking-wide">Reserve Allocation Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-charcoal/5 bg-brand-cream/30">
                {['Product', 'SKU', 'Price', 'Stock', 'Status', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className="text-left px-6 py-3 font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => {
                const isEditing = editingId === product.id;
                const cfg = STATUS_CONFIG[product.status] || STATUS_CONFIG['In Stock'];
                return (
                  <motion.tr
                    key={product.id}
                    className="border-b border-brand-charcoal/5 hover:bg-brand-cream/20 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  >
                    <td className="px-6 py-4">
                      <span className="font-serif text-sm text-brand-forest font-semibold">{product.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-xs text-brand-muted tracking-wider">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editValues.price}
                          onChange={(e) => setEditValues((v) => ({ ...v, price: e.target.value }))}
                          className="w-24 border border-brand-gold/40 bg-brand-cream/40 px-2 py-1 font-sans text-xs text-brand-charcoal focus:outline-none focus:border-brand-gold"
                        />
                      ) : (
                        <span className="font-serif text-sm text-brand-charcoal">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editValues.inventory_count}
                          onChange={(e) => setEditValues((v) => ({ ...v, inventory_count: e.target.value }))}
                          className="w-20 border border-brand-gold/40 bg-brand-cream/40 px-2 py-1 font-sans text-xs text-brand-charcoal focus:outline-none focus:border-brand-gold"
                        />
                      ) : (
                        <span className="font-sans text-sm font-semibold text-brand-charcoal">
                          {product.inventory_count}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(product.id)}
                            disabled={saving}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer border border-emerald-200 disabled:opacity-50"
                            aria-label="Save changes"
                          >
                            {saving
                              ? <Loader className="w-3.5 h-3.5 animate-spin" />
                              : <Save className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="p-1.5 text-red-500 hover:bg-red-50 transition-colors cursor-pointer border border-red-200 disabled:opacity-50"
                            aria-label="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(product)}
                          className="p-1.5 text-brand-muted hover:text-brand-forest transition-colors cursor-pointer border border-brand-forest/10 hover:border-brand-gold"
                          aria-label="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
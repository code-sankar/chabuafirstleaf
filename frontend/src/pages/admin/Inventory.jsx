import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, X, Package, AlertTriangle, Loader } from 'lucide-react';
import axios from 'axios';

const MOCK_INVENTORY = [
  { id: "prod_orthodox_gold", name: "Assam Orthodox Gold", sku: "CFL-001-GOLD", price: 180.00, inventory_count: 48, status: "In Stock" },
  { id: "prod_chabua_clonal", name: "Chabua Clonal Imperial", sku: "CFL-002-CLONAL", price: 210.00, inventory_count: 12, status: "Low Stock" },
  { id: "prod_reserve_tippy", name: "Tippy Golden Flowery Orange Pekoe", sku: "CFL-003-TGFOP", price: 245.00, inventory_count: 0, status: "Out of Stock" },
  { id: "prod_smoked_souchong", name: "Heritage Smoked Souchong", sku: "CFL-004-SMOKED", price: 195.00, inventory_count: 31, status: "In Stock" },
];

const statusConfig = {
  "In Stock":    { dot: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" },
  "Low Stock":   { dot: "bg-amber-400",   text: "text-amber-600",   bg: "bg-amber-50" },
  "Out of Stock":{ dot: "bg-red-500",     text: "text-red-600",     bg: "bg-red-50" },
};

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        if (res.data?.success && res.data.products?.length) {
          setProducts(res.data.products);
        } else {
          setProducts(MOCK_INVENTORY);
        }
      } catch {
        setProducts(MOCK_INVENTORY);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditValues({ price: product.price, inventory_count: product.inventory_count });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (productId) => {
    setSaving(true);
    try {
      await axios.patch(`http://localhost:5000/api/products/${productId}`, editValues);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const count = Number(editValues.inventory_count);
          return {
            ...p,
            ...editValues,
            status: count === 0 ? "Out of Stock" : count <= 15 ? "Low Stock" : "In Stock"
          };
        })
      );
    } catch {
      // Update local state optimistically even if API unavailable
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const count = Number(editValues.inventory_count);
          return {
            ...p,
            ...editValues,
            status: count === 0 ? "Out of Stock" : count <= 15 ? "Low Stock" : "In Stock"
          };
        })
      );
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-brand-muted">
        <Loader className="w-5 h-5 animate-spin mr-2 stroke-[1.5]" />
        <span className="font-sans text-xs uppercase tracking-widest">Loading Reserve Inventory...</span>
      </div>
    );
  }

  const lowStockCount = products.filter((p) => p.status === "Low Stock" || p.status === "Out of Stock").length;

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
          <span>{lowStockCount} product{lowStockCount > 1 ? 's' : ''} require attention — low stock or out of stock.</span>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total SKUs", value: products.length, icon: Package },
          { label: "In Stock", value: products.filter(p => p.status === "In Stock").length, color: "text-emerald-600" },
          { label: "Low Stock", value: products.filter(p => p.status === "Low Stock").length, color: "text-amber-600" },
          { label: "Out of Stock", value: products.filter(p => p.status === "Out of Stock").length, color: "text-red-600" },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white border border-brand-forest/5 p-5 shadow-sm"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-1">{item.label}</p>
            <p className={`font-serif text-2xl font-semibold text-brand-forest ${item.color || ''}`}>{item.value}</p>
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
                {["Product", "SKU", "Price", "Stock", "Status", "Actions"].map((col) => (
                  <th key={col} className="text-left px-6 py-3 font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => {
                const isEditing = editingId === product.id;
                const cfg = statusConfig[product.status] || statusConfig["In Stock"];
                return (
                  <motion.tr
                    key={product.id}
                    className="border-b border-brand-charcoal/5 hover:bg-brand-cream/20 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
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
                          value={editValues.price}
                          onChange={(e) => setEditValues((v) => ({ ...v, price: e.target.value }))}
                          className="w-24 border border-brand-gold/40 bg-brand-cream/40 px-2 py-1 font-sans text-xs text-brand-charcoal focus:outline-none focus:border-brand-gold"
                        />
                      ) : (
                        <span className="font-serif text-sm text-brand-charcoal">${Number(product.price).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editValues.inventory_count}
                          onChange={(e) => setEditValues((v) => ({ ...v, inventory_count: e.target.value }))}
                          className="w-20 border border-brand-gold/40 bg-brand-cream/40 px-2 py-1 font-sans text-xs text-brand-charcoal focus:outline-none focus:border-brand-gold"
                        />
                      ) : (
                        <span className="font-sans text-sm font-semibold text-brand-charcoal">{product.inventory_count}</span>
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
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer border border-emerald-200"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 text-red-500 hover:bg-red-50 transition-colors cursor-pointer border border-red-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(product)}
                          className="p-1.5 text-brand-muted hover:text-brand-forest transition-colors cursor-pointer border border-brand-forest/10 hover:border-brand-gold"
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
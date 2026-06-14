import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader, Users, ArrowUpDown, Mail, AlertCircle } from 'lucide-react';

import { listCustomers } from '../../services/adminService';

/**
 * Customers — read-only aggregated view of every customer who has
 * placed at least one order. Source endpoint:
 *
 *   GET /api/orders/admin/customers
 *   → { customers: [{ email, name, phone, totalOrders, totalSpent,
 *                     firstOrderAt, lastOrderAt }] }
 *
 * Server returns pre-sorted by totalSpent desc; we let the admin
 * resort by any column locally.
 */

const SORT_OPTIONS = [
  { key: 'totalSpent', label: 'Total Spent' },
  { key: 'totalOrders', label: 'Orders' },
  { key: 'lastOrderAt', label: 'Last Order' },
  { key: 'name', label: 'Name' },
];

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('totalSpent');
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listCustomers();
        if (!cancelled) setCustomers(data?.customers || []);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load customers.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? customers.filter(
          (c) =>
            c.email?.toLowerCase().includes(q) ||
            c.name?.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q)
        )
      : customers;

    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [customers, search, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  /* ─── Summary stats ─────────────────────────────────────── */
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);
  const avgOrderValue = totalCustomers > 0
    ? totalRevenue / customers.reduce((sum, c) => sum + Number(c.totalOrders || 0), 1)
    : 0;

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-brand-muted">
        <Loader className="w-5 h-5 animate-spin mr-2 stroke-[1.5]" />
        <span className="font-sans text-xs uppercase tracking-widest">Loading patron registry…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200/60 p-8 text-center">
        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-3" strokeWidth={1.5} />
        <p className="font-serif text-lg text-brand-forest mb-2">Could not load customers</p>
        <p className="font-sans text-sm text-brand-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-brand-charcoal/10 pb-6">
        <p className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-1">
          Patron Registry
        </p>
        <h1 className="font-serif text-3xl text-brand-forest tracking-wide">Customers</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Customers"
          value={totalCustomers.toLocaleString()}
        />
        <StatCard
          icon={Users}
          label="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
        />
        <StatCard
          icon={Users}
          label="Avg Order Value"
          value={`$${avgOrderValue.toFixed(2)}`}
        />
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted/60" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="w-full bg-white border border-brand-charcoal/10 pl-9 pr-4 py-3 font-sans text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="bg-white border border-brand-charcoal/10 px-4 py-3 font-sans text-xs uppercase tracking-widest text-brand-charcoal focus:outline-none focus:border-brand-gold cursor-pointer transition-colors"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>Sort: {opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
          aria-label={`Sort direction: ${sortDir}`}
          className="bg-white border border-brand-charcoal/10 hover:border-brand-gold px-4 py-3 transition-colors cursor-pointer"
          title={`Sort direction: ${sortDir}`}
        >
          <ArrowUpDown className={`w-3.5 h-3.5 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`} strokeWidth={1.5} />
        </button>
      </div>

      {/* Empty state */}
      {visible.length === 0 ? (
        <div className="bg-white border border-brand-charcoal/5 p-12 text-center">
          <Users className="w-8 h-8 text-brand-gold/30 mx-auto mb-4" strokeWidth={1} />
          <p className="font-serif text-lg text-brand-forest mb-2">
            {search ? 'No customers match your search.' : 'No customers yet.'}
          </p>
          {!search && (
            <p className="font-sans text-sm text-brand-muted">
              Customers will appear here as soon as the first order is placed.
            </p>
          )}
        </div>
      ) : (
        /* Table */
        <div className="bg-white border border-brand-charcoal/5 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-charcoal/10 bg-brand-cream/40">
                <SortableTh keyName="name" label="Customer" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh keyName="totalOrders" label="Orders" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                <SortableTh keyName="totalSpent" label="Total Spent" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                <SortableTh keyName="lastOrderAt" label="Last Order" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-6 py-4 text-left font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((customer, i) => (
                <motion.tr
                  key={customer.email}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                  className="border-b border-brand-charcoal/5 hover:bg-brand-cream/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-sans text-sm font-medium text-brand-charcoal">
                      {customer.name || '—'}
                    </p>
                    <p className="font-sans text-[11px] text-brand-muted">
                      {customer.email}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right font-sans text-sm tabular-nums text-brand-charcoal">
                    {customer.totalOrders}
                  </td>
                  <td className="px-6 py-4 text-right font-serif text-sm font-semibold text-brand-forest tabular-nums">
                    ${Number(customer.totalSpent || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-sans text-xs text-brand-muted whitespace-nowrap">
                    {customer.lastOrderAt
                      ? new Date(customer.lastOrderAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-brand-muted hover:text-brand-gold transition-colors"
                        title={`Email ${customer.email}`}
                      >
                        <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </a>
                      {customer.phone && (
                        <span className="font-sans text-[11px] text-brand-muted tabular-nums">
                          {customer.phone}
                        </span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count */}
      <p className="font-sans text-[11px] text-brand-muted text-right">
        Showing {visible.length} of {totalCustomers} {totalCustomers === 1 ? 'patron' : 'patrons'}
      </p>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-brand-charcoal/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
          {label}
        </p>
        <Icon className="w-3.5 h-3.5 text-brand-gold/50" strokeWidth={1.5} />
      </div>
      <p className="font-serif text-2xl text-brand-forest tracking-wide tabular-nums">
        {value}
      </p>
    </div>
  );
}

function SortableTh({ keyName, label, sortKey, sortDir, onSort, align = 'left' }) {
  const isActive = sortKey === keyName;
  return (
    <th
      className={`px-6 py-4 font-sans text-[10px] uppercase tracking-widest font-semibold ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <button
        onClick={() => onSort(keyName)}
        className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
          isActive ? 'text-brand-forest' : 'text-brand-muted hover:text-brand-forest'
        }`}
      >
        <span>{label}</span>
        {isActive && (
          <ArrowUpDown
            className={`w-3 h-3 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`}
            strokeWidth={1.5}
          />
        )}
      </button>
    </th>
  );
}
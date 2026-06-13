import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, MapPin, Edit2, Trash2, Star, Loader, AlertCircle, X,
} from 'lucide-react';

import AccountLayout from '../../layouts/AccountLayout';
import {
  listAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress,
} from '../../services/addressService';
import { validateShippingForm, sanitizeText } from '../../utils/validation';

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'United Arab Emirates',
  'Germany', 'France', 'Netherlands', 'Italy', 'Spain', 'Belgium',
  'Japan', 'Singapore', 'Canada', 'Australia',
];

const EMPTY_FORM = {
  label: '', name: '', phone: '', address: '', city: '', state: '',
  postalCode: '', country: 'India', email: 'unused@example.com', // email isn't shown but validator needs it
};

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | <addressId>
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* Load addresses */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listAddresses();
        if (!cancelled) setAddresses(list);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const startAdd = () => {
    setEditing('new');
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const startEdit = (addr) => {
    setEditing(addr.id);
    setForm({ ...EMPTY_FORM, ...addr });
    setFormErrors({});
  };

  const cancel = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateShippingForm(form);
    /* The address form doesn't collect email — drop that error if present */
    delete errs.email;
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.email; // not part of address record
      if (editing === 'new') {
        const created = await createAddress(payload);
        setAddresses((list) => [...list, created]);
      } else {
        const updated = await updateAddress(editing, payload);
        setAddresses((list) => list.map((a) => (a.id === editing ? updated : a)));
      }
      cancel();
    } catch (err) {
      setFormErrors({ _form: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this address from your account?')) return;
    try {
      await deleteAddress(id);
      setAddresses((list) => list.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      setAddresses((list) =>
        list.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Helmet>
        <title>Addresses · Chabua First Leaf</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <AccountLayout subtitle="Account" title="Saved Addresses">
        <div className="space-y-6">
          {/* Add button */}
          {editing === null && (
            <button
              onClick={startAdd}
              className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Add a new address</span>
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white border border-brand-forest/5 p-12 flex items-center justify-center gap-3">
              <Loader className="w-4 h-4 animate-spin text-brand-gold" strokeWidth={1.5} />
              <span className="font-sans text-[11px] uppercase tracking-widest text-brand-muted">
                Loading addresses…
              </span>
            </div>
          )}

          {/* Form (add or edit) */}
          <AnimatePresence>
            {editing !== null && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white border border-brand-forest/10"
              >
                <header className="flex items-center justify-between px-6 py-4 border-b border-brand-forest/5">
                  <h2 className="font-serif text-lg text-brand-forest">
                    {editing === 'new' ? 'New Address' : 'Edit Address'}
                  </h2>
                  <button
                    onClick={cancel}
                    className="text-brand-muted/60 hover:text-brand-forest transition-colors"
                    aria-label="Cancel"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <Field
                    id="addr-label"
                    label="Label (e.g. Home, Office)"
                    value={form.label}
                    onChange={(v) => setForm((f) => ({ ...f, label: sanitizeText(v) }))}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <Field
                      id="addr-name" label="Full Name" value={form.name}
                      onChange={(v) => setForm((f) => ({ ...f, name: sanitizeText(v) }))}
                      error={formErrors.name} required
                    />
                    <Field
                      id="addr-phone" label="Phone" type="tel" value={form.phone}
                      onChange={(v) => setForm((f) => ({ ...f, phone: sanitizeText(v) }))}
                      error={formErrors.phone} required
                    />
                  </div>

                  <Field
                    id="addr-street" label="Street Address" value={form.address}
                    onChange={(v) => setForm((f) => ({ ...f, address: sanitizeText(v) }))}
                    error={formErrors.address} required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <Field
                      id="addr-city" label="City" value={form.city}
                      onChange={(v) => setForm((f) => ({ ...f, city: sanitizeText(v) }))}
                      error={formErrors.city} required
                    />
                    <Field
                      id="addr-state" label="State / Region" value={form.state}
                      onChange={(v) => setForm((f) => ({ ...f, state: sanitizeText(v) }))}
                      error={formErrors.state} required
                    />
                    <Field
                      id="addr-postal" label="Postal Code" value={form.postalCode}
                      onChange={(v) => setForm((f) => ({ ...f, postalCode: sanitizeText(v) }))}
                      error={formErrors.postalCode} required
                    />
                    <SelectField
                      id="addr-country" label="Country" value={form.country}
                      onChange={(v) => setForm((f) => ({ ...f, country: v }))}
                      options={COUNTRIES} required
                    />
                  </div>

                  {formErrors._form && (
                    <div className="flex items-start gap-2 p-3 bg-red-50/60 border border-red-200/60 text-red-700 font-sans text-xs">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{formErrors._form}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase px-8 py-3.5 rounded-none disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
                    >
                      {saving
                        ? <><Loader className="w-3.5 h-3.5 animate-spin" /><span>Saving…</span></>
                        : <span>{editing === 'new' ? 'Add Address' : 'Save Changes'}</span>}
                    </button>
                    <button
                      type="button"
                      onClick={cancel}
                      className="font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Address list */}
          {!loading && addresses.length === 0 && editing !== 'new' && (
            <div className="bg-white border border-brand-forest/5 p-12 md:p-16 text-center">
              <MapPin className="w-10 h-10 text-brand-gold/30 mx-auto mb-6" strokeWidth={1} />
              <h2 className="font-serif text-2xl text-brand-forest tracking-wide mb-3">
                No addresses saved yet
              </h2>
              <p className="font-serif italic text-brand-muted mb-8 max-w-md mx-auto">
                Save a delivery destination for a swifter checkout next time.
              </p>
              <button
                onClick={startAdd}
                className="font-sans text-[11px] uppercase tracking-widest text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors cursor-pointer"
              >
                Add your first address
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <article
                key={addr.id}
                className={`bg-white border p-6 transition-colors ${
                  addr.isDefault ? 'border-brand-gold/40' : 'border-brand-forest/5'
                }`}
              >
                <header className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    {addr.label && (
                      <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-1">
                        {addr.label}
                      </p>
                    )}
                    <p className="font-serif text-lg text-brand-forest leading-tight">
                      {addr.name}
                    </p>
                  </div>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 font-sans text-[9px] uppercase tracking-widest text-brand-gold">
                      <Star className="w-2.5 h-2.5 fill-brand-gold" strokeWidth={0} />
                      <span>Default</span>
                    </span>
                  )}
                </header>

                <address className="not-italic font-sans text-sm text-brand-charcoal leading-relaxed space-y-0.5 mb-5">
                  <p>{addr.address}</p>
                  <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p>{addr.country}</p>
                  <p className="text-brand-muted text-xs pt-2">{addr.phone}</p>
                </address>

                <footer className="flex items-center gap-5 pt-4 border-t border-brand-forest/5">
                  <button
                    onClick={() => startEdit(addr)}
                    className="inline-flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors"
                  >
                    <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                    <span>Edit</span>
                  </button>
                  {!addr.isDefault && (
                    <>
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors"
                      >
                        Set as default
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="inline-flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-red-700 transition-colors ml-auto"
                      >
                        <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </footer>
              </article>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50/60 border border-red-200/60 text-red-700 font-sans text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </AccountLayout>
    </>
  );
}

/* ─── Form fields ─────────────────────────────────────────── */

function Field({ id, label, type = 'text', value, onChange, error, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
        {label}{required && <span className="text-brand-gold ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-brand-cream/40 border px-4 py-3 font-sans text-sm text-brand-charcoal focus:outline-none transition-colors ${
          error ? 'border-red-400/60 focus:border-red-500' : 'border-brand-forest/10 focus:border-brand-gold'
        }`}
      />
      {error && (
        <p className="font-sans text-[11px] text-red-600">{error}</p>
      )}
    </div>
  );
}

function SelectField({ id, label, value, onChange, options, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
        {label}{required && <span className="text-brand-gold ml-0.5">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-brand-cream/40 border border-brand-forest/10 px-4 py-3 font-sans text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold cursor-pointer transition-colors"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
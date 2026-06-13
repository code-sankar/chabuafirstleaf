import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, AlertTriangle, User } from 'lucide-react';
import { selectUser } from '../../store';
import { validateShippingForm, sanitizeText } from '../../utils/validation';
import { currencyForCountry } from '../../utils/currency';

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Germany',
  'France',
  'Netherlands',
  'Italy',
  'Spain',
  'Belgium',
  'Japan',
  'Singapore',
  'Canada',
  'Australia',
];

export default function ShippingStep({ form, onChange, onBack, onContinue }) {
  const user = useSelector(selectUser);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* Prefill from authenticated user once */
  React.useEffect(() => {
    if (user && !form.email) {
      onChange({
        ...form,
        email: user.email || '',
        name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateField = (field, rawValue) => {
    const value = sanitizeText(rawValue);
    const next = { ...form, [field]: value };

    /* If country changed, also reset currency derivation */
    if (field === 'country') {
      next.currency = currencyForCountry(value);
    }

    onChange(next);
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const blurField = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateShippingForm(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setTouched(Object.keys(validation).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-12"
    >
      <header className="text-center max-w-xl mx-auto">
        <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 mb-3">
          Step Two
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-brand-forest tracking-wide">
          Shipping Information
        </h1>
        <div className="w-12 h-[0.5px] bg-brand-gold/40 mx-auto mt-6" />
        <p className="font-serif italic text-sm text-brand-muted mt-6">
          Each parcel is dispatched from our Chabua estate in climate-controlled packaging.
        </p>
      </header>

      {!user && (
        <div className="max-w-2xl mx-auto bg-brand-cream/60 border border-brand-gold/15 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-brand-gold stroke-[1.5]" />
            <p className="font-sans text-xs text-brand-charcoal">
              Returning customer?{' '}
              <Link
                to="/login?returnTo=/checkout"
                className="text-brand-forest border-b border-brand-gold pb-0.5 hover:text-brand-gold transition-colors"
              >
                Sign in
              </Link>{' '}
              for faster checkout.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8" noValidate>
        <Section title="Contact">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <Field
              label="Email Address"
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(v) => updateField('email', v)}
              onBlur={() => blurField('email')}
              error={touched.email && errors.email}
              required
            />
            <Field
              label="Phone Number"
              id="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(v) => updateField('phone', v)}
              onBlur={() => blurField('phone')}
              error={touched.phone && errors.phone}
              required
            />
          </div>
        </Section>

        <Section title="Delivery Address">
          <div className="space-y-5">
            <Field
              label="Full Name"
              id="name"
              autoComplete="name"
              value={form.name}
              onChange={(v) => updateField('name', v)}
              onBlur={() => blurField('name')}
              error={touched.name && errors.name}
              required
            />
            <Field
              label="Street Address"
              id="address"
              autoComplete="street-address"
              value={form.address}
              onChange={(v) => updateField('address', v)}
              onBlur={() => blurField('address')}
              error={touched.address && errors.address}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <Field
                label="City"
                id="city"
                autoComplete="address-level2"
                value={form.city}
                onChange={(v) => updateField('city', v)}
                onBlur={() => blurField('city')}
                error={touched.city && errors.city}
                required
              />
              <Field
                label="State / Region"
                id="state"
                autoComplete="address-level1"
                value={form.state}
                onChange={(v) => updateField('state', v)}
                onBlur={() => blurField('state')}
                error={touched.state && errors.state}
                required
              />
              <Field
                label="Postal Code"
                id="postalCode"
                autoComplete="postal-code"
                value={form.postalCode}
                onChange={(v) => updateField('postalCode', v)}
                onBlur={() => blurField('postalCode')}
                error={touched.postalCode && errors.postalCode}
                required
              />
              <SelectField
                label="Country"
                id="country"
                autoComplete="country-name"
                value={form.country}
                onChange={(v) => updateField('country', v)}
                options={COUNTRIES}
                required
              />
            </div>
          </div>
        </Section>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-6 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Bag</span>
          </button>
          <button
            type="submit"
            className="gold-shimmer-btn text-brand-charcoal font-sans text-[11px] font-bold tracking-luxury uppercase px-10 py-4 flex items-center justify-center gap-2.5 rounded-none cursor-pointer"
          >
            <span>Continue to Review</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function Section({ title, children }) {
  return (
    <fieldset className="bg-white border border-brand-forest/5 p-6 md:p-8">
      <legend className="font-sans text-[10px] tracking-widest uppercase text-brand-gold/70 px-2 -ml-2">
        {title}
      </legend>
      <div className="mt-4">{children}</div>
    </fieldset>
  );
}

function Field({ label, id, type = 'text', autoComplete, value, onChange, onBlur, error, required }) {
  return (
    <div className="flex flex-col gap-1.5" data-error={Boolean(error)}>
      <label
        htmlFor={`checkout-${id}`}
        className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold"
      >
        {label}{required && <span className="text-brand-gold ml-0.5">*</span>}
      </label>
      <input
        id={`checkout-${id}`}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`bg-brand-cream/40 border px-4 py-3 font-sans text-sm text-brand-charcoal focus:outline-none transition-colors ${
          error
            ? 'border-red-400/60 focus:border-red-500'
            : 'border-brand-forest/10 focus:border-brand-gold'
        }`}
      />
      {error && (
        <p className="flex items-center gap-1.5 font-sans text-[11px] text-red-600 mt-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function SelectField({ label, id, autoComplete, value, onChange, options, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={`checkout-${id}`}
        className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-semibold"
      >
        {label}{required && <span className="text-brand-gold ml-0.5">*</span>}
      </label>
      <select
        id={`checkout-${id}`}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-brand-cream/40 border border-brand-forest/10 px-4 py-3 font-sans text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold cursor-pointer transition-colors"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
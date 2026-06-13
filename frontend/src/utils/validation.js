/**
 * Form validation helpers — pure functions, no React, no Redux.
 *
 * Each validator returns a string error message on failure, or null
 * on success. The shipping form validator returns a field→error map.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Country-specific postal code patterns
const POSTAL_RULES = {
  'India':                /^[1-9][0-9]{5}$/,           // 6 digits, no leading 0
  'United States':        /^\d{5}(-\d{4})?$/,
  'United Kingdom':       /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
  'United Arab Emirates': /^.{2,10}$/,                  // UAE has no formal post codes
  'Germany':              /^\d{5}$/,
  'France':               /^\d{5}$/,
  'Netherlands':          /^\d{4}\s?[A-Z]{2}$/i,
  'Italy':                /^\d{5}$/,
  'Spain':                /^\d{5}$/,
  'Belgium':              /^\d{4}$/,
  'Japan':                /^\d{3}-?\d{4}$/,
  'Singapore':            /^\d{6}$/,
  'Canada':               /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
  'Australia':            /^\d{4}$/,
};

export function validateEmail(value) {
  if (!value) return 'Email is required.';
  if (!EMAIL_RE.test(value)) return 'Please enter a valid email address.';
  return null;
}

export function validatePhone(value) {
  if (!value) return 'Phone number is required.';
  const digits = value.replace(/[\s+\-()]/g, '');
  if (digits.length < 7 || digits.length > 15) {
    return 'Please enter a valid phone number.';
  }
  if (!/^\d+$/.test(digits)) return 'Phone number can only contain digits.';
  return null;
}

export function validatePostalCode(value, country) {
  if (!value) return 'Postal code is required.';
  const rule = POSTAL_RULES[country];
  if (rule && !rule.test(value.trim())) {
    return `Please enter a valid postal code for ${country}.`;
  }
  return null;
}

export function validateRequired(value, label) {
  if (!value || !value.toString().trim()) return `${label} is required.`;
  return null;
}

export function validatePassword(value) {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  return null;
}

/**
 * Returns { field: errorMessage } for every invalid field.
 * An empty object means the form is valid.
 */
export function validateShippingForm(form) {
  const errors = {};

  const name    = validateRequired(form.name, 'Full name');
  const email   = validateEmail(form.email);
  const phone   = validatePhone(form.phone);
  const address = validateRequired(form.address, 'Address');
  const city    = validateRequired(form.city, 'City');
  const state   = validateRequired(form.state, 'State / Region');
  const country = validateRequired(form.country, 'Country');
  const postal  = validatePostalCode(form.postalCode, form.country);

  if (name)    errors.name = name;
  if (email)   errors.email = email;
  if (phone)   errors.phone = phone;
  if (address) errors.address = address;
  if (city)    errors.city = city;
  if (state)   errors.state = state;
  if (country) errors.country = country;
  if (postal)  errors.postalCode = postal;

  return errors;
}

/** Lightweight XSS guard for user-typed text — strips brackets and quotes. */
export function sanitizeText(value) {
  return String(value).replace(/[<>"'&]/g, '');
}
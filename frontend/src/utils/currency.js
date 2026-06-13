/**
 * Currency helpers
 *
 *   The product catalogue is stored in USD. For Indian customers we
 *   display prices in INR. Conversion happens authoritatively on the
 *   backend at checkout time — the rate here is only for *display*
 *   on cart/checkout review screens.
 *
 *   When the backend returns a final total in paise (INR) we trust that
 *   value absolutely and display it directly.
 */

// Display-only rate. The backend uses a live FX rate at the moment of charge.
const DISPLAY_RATES = {
  INR: 84,
  GBP: 0.79,
  EUR: 0.92,
  AED: 3.67,
  USD: 1,
};

const SYMBOL = {
  INR: '₹',
  USD: '$',
  GBP: '£',
  EUR: '€',
  AED: 'AED ',
};

const COUNTRY_CURRENCY = {
  'India': 'INR',
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'United Arab Emirates': 'AED',
  'Germany': 'EUR',
  'France': 'EUR',
  'Netherlands': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Belgium': 'EUR',
  'Japan': 'USD',
  'Singapore': 'USD',
  'Canada': 'USD',
  'Australia': 'USD',
};

export function currencyForCountry(country) {
  return COUNTRY_CURRENCY[country] || 'USD';
}

/** Convert a base USD amount into the target currency for display. */
export function convertFromUSD(amountUSD, currency = 'USD') {
  const rate = DISPLAY_RATES[currency] || 1;
  return amountUSD * rate;
}

/** Format a numeric amount with the appropriate symbol and locale grouping. */
export function formatCurrency(amount, currency = 'USD') {
  const symbol = SYMBOL[currency] || '';
  const isIntegerCurrency = currency === 'INR' || currency === 'AED';
  const fractionDigits = isIntegerCurrency ? 0 : 2;

  try {
    const formatted = new Intl.NumberFormat(localeFor(currency), {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
    return `${symbol}${formatted}`;
  } catch {
    return `${symbol}${amount.toFixed(fractionDigits)}`;
  }
}

/** One-shot helper used everywhere: USD → display string in target currency. */
export function priceFromUSD(amountUSD, currency = 'USD') {
  return formatCurrency(convertFromUSD(amountUSD, currency), currency);
}

function localeFor(currency) {
  switch (currency) {
    case 'INR': return 'en-IN';
    case 'GBP': return 'en-GB';
    case 'EUR': return 'de-DE';
    case 'AED': return 'en-AE';
    default:    return 'en-US';
  }
}
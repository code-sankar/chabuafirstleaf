/**
 * FX service — live USD-base exchange rates.
 *
 *   - Source: open.er-api.com (free, no API key, includes AED)
 *   - In-memory cache, refreshed every 6h
 *   - Falls back to static values if the API is unreachable so checkout
 *     never breaks on an upstream outage
 *
 * If you outgrow this (Phase 4-ish), swap the FX_API_URL for a paid
 * provider with SLAs (openexchangerates.org, fixer.io) — the public
 * function signatures stay the same.
 */

const FX_API_URL = 'https://open.er-api.com/v6/latest/USD';
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

const SUPPORTED = ['INR', 'GBP', 'EUR', 'AED', 'USD'];

/* Static fallback — mirrors frontend/src/utils/currency.js. Used if
   the API is unreachable on first load AND no cached rates exist. */
const FALLBACK_RATES = {
  USD: 1,
  INR: 83,
  GBP: 0.79,
  EUR: 0.92,
  AED: 3.67,
};

let cache = {
  rates: { ...FALLBACK_RATES },
  fetchedAt: 0,
  source: 'fallback',
};

async function refresh() {
  try {
    const response = await fetch(FX_API_URL, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`FX API responded ${response.status}`);

    const data = await response.json();
    if (data?.result !== 'success' || !data?.rates) {
      throw new Error('FX API returned malformed payload');
    }

    const rates = { USD: 1 };
    for (const currency of SUPPORTED) {
      if (currency === 'USD') continue;
      if (typeof data.rates[currency] === 'number') {
        rates[currency] = data.rates[currency];
      } else {
        rates[currency] = FALLBACK_RATES[currency]; // partial fallback for missing pairs
      }
    }

    cache = { rates, fetchedAt: Date.now(), source: 'live' };
    console.log(`[FX] Live rates refreshed: ${JSON.stringify(rates)}`);
  } catch (err) {
    // Keep the previous cache (whether live or fallback); just log
    console.warn(`[FX] Refresh failed (${err.message}). Continuing with ${cache.source} rates.`);
  }
}

/**
 * Idempotent — call from server.js boot. Schedules a periodic refresh
 * and kicks off the first fetch immediately.
 */
let initialized = false;
export function initializeFxService() {
  if (initialized) return;
  initialized = true;
  refresh();
  setInterval(refresh, REFRESH_INTERVAL_MS);
}

/**
 * Returns the USD→target rate. Returns 1 for USD→USD; returns the
 * fallback rate for unknown currencies (with a warning) so we never
 * throw on display-currency lookups.
 */
export function getRate(targetCurrency = 'USD') {
  if (!cache.rates[targetCurrency]) {
    console.warn(`[FX] Unknown currency '${targetCurrency}', defaulting to USD.`);
    return 1;
  }
  return cache.rates[targetCurrency];
}

/**
 * Convert a USD amount into the target currency, returning the value
 * in the smallest unit (paise/cents/etc.) ready for the payment provider.
 *
 *   - Integer currencies (INR, AED) → returned as whole "subunits"
 *     where 1 INR = 100 paise
 *   - Decimal currencies (USD, GBP, EUR) → cents/pence
 */
export function usdToSmallestUnit(amountUSD, targetCurrency = 'INR') {
  const rate = getRate(targetCurrency);
  const converted = amountUSD * rate;
  return Math.round(converted * 100); // both groups use 100 subunits
}

/** Returns the cache for debugging / health endpoint. */
export function getFxStatus() {
  return {
    rates: cache.rates,
    fetchedAt: cache.fetchedAt ? new Date(cache.fetchedAt).toISOString() : null,
    source: cache.source,
  };
}
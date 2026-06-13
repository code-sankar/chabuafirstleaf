/**
 * Centralized Environment Configuration
 * All environment-dependent values live here — never hardcode URLs or keys in components.
 */

const env = {
  // API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',

  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  // Razorpay
  RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY || '',

  // App
  SITE_URL: import.meta.env.VITE_SITE_URL || 'https://chabuafirstleaf.com',
  IS_PRODUCTION: import.meta.env.PROD,
};

// Guard against missing critical keys in production
if (env.IS_PRODUCTION) {
  const required = ['VITE_API_BASE_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_RAZORPAY_KEY'];
  const missing = required.filter((key) => !import.meta.env[key]);
  if (missing.length > 0) {
    console.error(`[Chabua First Leaf] Missing required env vars: ${missing.join(', ')}`);
  }
}

export default env;

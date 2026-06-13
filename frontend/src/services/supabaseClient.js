import { createClient } from '@supabase/supabase-js';
import env from '../config/env';

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn('[Chabua First Leaf] Supabase credentials not configured. Database features will be unavailable.');
}

export const supabase = createClient(
  env.SUPABASE_URL || 'https://placeholder.supabase.co',
  env.SUPABASE_ANON_KEY || 'placeholder-key'
);

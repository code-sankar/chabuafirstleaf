import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail loudly at boot rather than starting a server that 500s on every
// database call. A missing credential is a deploy error, not a runtime
// condition to limp through.
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    '[Boot] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. ' +
    'Set them in the environment before starting the server.'
  );
}

// The Service Role Key gives the backend admin permissions for DB mutations.
// It must NEVER be exposed to the frontend.
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
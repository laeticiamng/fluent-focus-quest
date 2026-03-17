import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Defensive: if env vars are missing, supabase will be a degraded client
// that won't crash the app at import time
export const supabaseAvailable = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

function createSafeClient(): SupabaseClient<Database> {
  if (supabaseAvailable) {
    return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  if (import.meta.env.DEV) {
    console.warn('[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY missing — running in offline mode');
  }
  // Return a stub client with a placeholder URL so createClient doesn't throw
  return createClient<Database>(
    'https://placeholder.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export const supabase = createSafeClient();

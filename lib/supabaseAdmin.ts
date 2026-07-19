import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase-client met de service role key (bypasst RLS). Alleen te importeren
 * in server-routes (nooit client). Retourneert null als de env-vars ontbreken, zodat het
 * referral-tracking een no-op wordt en de sweep-flow nooit breekt.
 *
 * Vereiste env:
 *   NEXT_PUBLIC_SUPABASE_URL      — de project-URL
 *   SUPABASE_SERVICE_ROLE_KEY     — de service role key (server-side, NOOIT NEXT_PUBLIC / committen)
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseConfigured = Boolean(url && serviceKey);

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (!cached) {
    cached = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return cached;
}

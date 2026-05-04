import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Helper para crear el cliente solo si las variables están configuradas
 */
function createSafeClient(url: string, key: string): SupabaseClient | null {
  if (!url || !key || url === 'tu_url_aqui' || key.startsWith('tu_')) {
    return null;
  }
  return createClient(url, key);
}

/**
 * Cliente público de Supabase (browser-safe)
 * Usa la anon key — respeta RLS
 */
export const supabase = createSafeClient(supabaseUrl, supabaseAnonKey);

/**
 * Cliente admin de Supabase (server-only)
 * Usa la service_role key — bypasea RLS
 * NUNCA exponer en el cliente
 */
export const supabaseAdmin = createSafeClient(supabaseUrl, supabaseServiceKey);

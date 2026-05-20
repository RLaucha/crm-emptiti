import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Helper para crear el cliente solo si las variables están configuradas
 */
function createSafeClient(url: string, key: string, options?: Record<string, any>): SupabaseClient | null {
  if (!url || !key || url === 'tu_url_aqui' || key.startsWith('tu_')) {
    return null;
  }
  return createClient(url, key, options);
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

/**
 * Cliente de Supabase para Realtime (browser-safe)
 * Usa la anon key con configuración de Realtime optimizada
 * Usar en componentes client que necesiten escuchar cambios en tiempo real
 */
export const supabaseRealtime = createSafeClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

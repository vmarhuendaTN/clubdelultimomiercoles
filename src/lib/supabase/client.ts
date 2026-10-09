import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import type { Database } from '@/types/supabase';

export type Supabase = SupabaseClient<Database>;

let client: Supabase | undefined;

/**
 * Cliente de Supabase para el navegador (solo clave publicable; la seguridad la da RLS).
 * Devuelve null en el build/servidor o si el proyecto no está configurado, para que
 * las funciones que dependen de él se oculten en lugar de fallar.
 */
export function getSupabase(): Supabase | null {
  if (typeof window === 'undefined' || !env.supabaseUrl || !env.supabaseKey) return null;
  client ??= createClient<Database>(env.supabaseUrl, env.supabaseKey, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'club-um-sesion',
    },
  });
  return client;
}

export function supabaseConfigurado(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseKey);
}

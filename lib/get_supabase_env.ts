import { is_supabase_configured } from '@/lib/is_supabase_configured'

export interface SupabaseEnv {
  url: string
  anon_key: string
}

/**
 * Returns validated Supabase URL and anon key.
 */
export function get_supabase_env(): SupabaseEnv {
  if (!is_supabase_configured()) {
    throw new Error('Supabase is not configured')
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
  }
}

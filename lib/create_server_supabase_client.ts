import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

import { get_supabase_env } from '@/lib/get_supabase_env'

/**
 * Creates a Supabase client bound to the current request cookies.
 */
export async function create_server_supabase_client(): Promise<SupabaseClient> {
  const { anon_key, url } = get_supabase_env()
  const cookie_store = await cookies()

  return createServerClient(url, anon_key, {
    cookies: {
      getAll() {
        return cookie_store.getAll()
      },
      setAll(cookies_to_set) {
        try {
          cookies_to_set.forEach(({ name, value, options }) => {
            cookie_store.set(name, value, options)
          })
        } catch {
          // setAll from a Server Component — middleware refreshes sessions.
        }
      },
    },
  })
}

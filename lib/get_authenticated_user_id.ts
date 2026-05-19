import { is_supabase_configured } from '@/lib/is_supabase_configured'
import { create_server_supabase_client } from '@/lib/create_server_supabase_client'

/**
 * Returns the signed-in Supabase user id, or null when offline / anonymous.
 */
export async function get_authenticated_user_id(): Promise<string | null> {
  if (!is_supabase_configured()) {
    return null
  }

  const supabase = await create_server_supabase_client()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id ?? null
}

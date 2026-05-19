import { get_authenticated_user_id } from '@/lib/get_authenticated_user_id'
import { is_supabase_configured } from '@/lib/is_supabase_configured'
import { read_local_db } from '@/lib/read_local_db'
import { read_supabase_db } from '@/lib/read_supabase_db'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Loads the tracker database from cloud or local storage.
 */
export async function read_db(db_path?: string): Promise<TimeTrackerDB> {
  if (is_supabase_configured()) {
    const user_id = await get_authenticated_user_id()

    if (user_id !== null) {
      return read_supabase_db(user_id)
    }
  }

  return read_local_db(db_path)
}

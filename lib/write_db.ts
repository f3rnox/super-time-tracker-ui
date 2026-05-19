import { get_authenticated_user_id } from '@/lib/get_authenticated_user_id'
import { is_supabase_configured } from '@/lib/is_supabase_configured'
import { write_local_db } from '@/lib/write_local_db'
import { write_supabase_db } from '@/lib/write_supabase_db'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Persists the in-memory database to cloud or local storage.
 */
export async function write_db(
  db: TimeTrackerDB,
  db_path?: string,
): Promise<void> {
  if (is_supabase_configured()) {
    const user_id = await get_authenticated_user_id()

    if (user_id !== null) {
      await write_supabase_db(db, user_id)
      return
    }
  }

  await write_local_db(db, db_path)
}

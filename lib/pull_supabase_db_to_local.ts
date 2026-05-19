import { read_supabase_db } from '@/lib/read_supabase_db'
import { write_local_db } from '@/lib/write_local_db'

/**
 * Overwrites the local db.json with the user's cloud database.
 */
export async function pull_supabase_db_to_local(user_id: string): Promise<void> {
  const cloud_db = await read_supabase_db(user_id)

  await write_local_db(cloud_db)
}

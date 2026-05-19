import { merge_time_tracker_dbs } from '@/lib/merge_time_tracker_dbs'
import { read_local_db } from '@/lib/read_local_db'
import { read_supabase_db } from '@/lib/read_supabase_db'
import { write_supabase_db } from '@/lib/write_supabase_db'
import { create_server_supabase_client } from '@/lib/create_server_supabase_client'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Merges cloud data into local, then writes the result to Supabase (local wins ties).
 */
export async function merge_push_local_to_supabase(
  user_id: string,
): Promise<TimeTrackerDB> {
  const cloud_db = await read_supabase_db(user_id)
  const local_db = await read_local_db()
  const merged = merge_time_tracker_dbs(cloud_db, local_db, 'incoming')

  await write_supabase_db(merged, user_id)

  const supabase = await create_server_supabase_client()

  await supabase
    .from('tracker_accounts')
    .update({ local_imported_at: new Date().toISOString() })
    .eq('user_id', user_id)

  return merged
}

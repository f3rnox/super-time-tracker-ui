import { promises as fs } from 'node:fs'

import { DB_PATH } from '@/lib/config'
import { merge_time_tracker_dbs } from '@/lib/merge_time_tracker_dbs'
import { read_local_db } from '@/lib/read_local_db'
import { read_supabase_db } from '@/lib/read_supabase_db'
import { write_local_db } from '@/lib/write_local_db'

/**
 * Merges local db.json into the on-disk cache when the user has local data to import.
 */
export async function import_local_db_to_supabase(user_id: string): Promise<boolean> {
  const cloud_db = await read_supabase_db(user_id)

  let local_db

  try {
    await fs.access(DB_PATH)
    local_db = await read_local_db()
  } catch {
    return false
  }

  if (local_db.sheets.length === 0) {
    return false
  }

  const merged =
    cloud_db.sheets.length === 0
      ? local_db
      : merge_time_tracker_dbs(cloud_db, local_db, 'incoming')

  await write_local_db(merged)

  return true
}

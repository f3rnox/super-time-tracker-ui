import { promises as fs } from 'node:fs'

import { DB_PATH } from '@/lib/config'
import { read_local_db } from '@/lib/read_local_db'
import { read_supabase_db } from '@/lib/read_supabase_db'
import { write_supabase_db } from '@/lib/write_supabase_db'
import { create_server_supabase_client } from '@/lib/create_server_supabase_client'

/**
 * Imports the on-disk db.json into Supabase when the cloud database is empty.
 */
export async function import_local_db_to_supabase(
  user_id: string,
): Promise<boolean> {
  const cloud_db = await read_supabase_db(user_id)

  if (cloud_db.sheets.length > 0) {
    return false
  }

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

  await write_supabase_db(local_db, user_id)

  const supabase = await create_server_supabase_client()

  await supabase
    .from('tracker_accounts')
    .update({ local_imported_at: new Date().toISOString() })
    .eq('user_id', user_id)

  return true
}

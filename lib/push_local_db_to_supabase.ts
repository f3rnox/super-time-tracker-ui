import { promises as fs } from 'node:fs'

import { DB_PATH } from '@/lib/config'
import { create_server_supabase_client } from '@/lib/create_server_supabase_client'
import { read_local_db } from '@/lib/read_local_db'
import { write_supabase_db } from '@/lib/write_supabase_db'

/**
 * Overwrites the user's cloud database with the local db.json contents.
 */
export async function push_local_db_to_supabase(user_id: string): Promise<void> {
  try {
    await fs.access(DB_PATH)
  } catch {
    throw new Error(`Local database not found at ${DB_PATH}`)
  }

  const local_db = await read_local_db()

  await write_supabase_db(local_db, user_id)

  const supabase = await create_server_supabase_client()

  await supabase
    .from('tracker_accounts')
    .update({ local_imported_at: new Date().toISOString() })
    .eq('user_id', user_id)
}

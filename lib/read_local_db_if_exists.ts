import { promises as fs } from 'node:fs'

import { DB_PATH } from '@/lib/config'
import { read_local_db } from '@/lib/read_local_db'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Loads the local db.json when present, otherwise returns null.
 */
export async function read_local_db_if_exists(): Promise<TimeTrackerDB | null> {
  try {
    await fs.access(DB_PATH)
  } catch {
    return null
  }

  return read_local_db()
}

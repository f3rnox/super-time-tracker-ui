import { write_local_db } from '@/lib/write_local_db'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Persists the in-memory database to local storage (cloud sync runs in the background).
 */
export async function write_db(
  db: TimeTrackerDB,
  db_path?: string,
): Promise<void> {
  await write_local_db(db, db_path)
}

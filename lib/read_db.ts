import { read_local_db } from '@/lib/read_local_db'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Loads the tracker database from the local JSON file.
 */
export async function read_db(db_path?: string): Promise<TimeTrackerDB> {
  return read_local_db(db_path)
}

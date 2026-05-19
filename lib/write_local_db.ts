import { promises as fs } from 'node:fs'

import { DB_PATH } from '@/lib/config'
import { convert_db_to_json } from '@/lib/convert_db_to_json'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Persists the in-memory database to the local JSON file.
 */
export async function write_local_db(
  db: TimeTrackerDB,
  db_path: string = DB_PATH,
): Promise<void> {
  const json_db = convert_db_to_json(db)
  const db_json = JSON.stringify(json_db)

  try {
    await fs.writeFile(db_path, db_json)
  } catch (err: unknown) {
    throw new Error(`Failed to save DB: ${String(err)}`, { cause: err })
  }
}

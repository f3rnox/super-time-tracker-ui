import { promises as fs } from 'node:fs'

import { DB_PATH } from '@/lib/config'
import { read_db } from '@/lib/read_db'
import { write_db } from '@/lib/write_db'

/**
 * Reads the on-disk database JSON used for backup downloads.
 */
export async function read_db_backup_contents(
  db_path: string = DB_PATH,
): Promise<string> {
  try {
    return await fs.readFile(db_path, 'utf-8')
  } catch {
    const db = await read_db(db_path)

    await write_db(db, db_path)

    return await fs.readFile(db_path, 'utf-8')
  }
}

import { gen_sheet } from '@/lib/gen_db'
import { read_db } from '@/lib/read_db'
import { write_db } from '@/lib/write_db'

/**
 * Switches the active sheet, creating it when missing.
 */
export async function set_active_sheet(sheet_name: string): Promise<void> {
  const db = await read_db()
  const sheet_exists = db.sheets.some(({ name }) => name === sheet_name)

  if (!sheet_exists) {
    db.sheets.push(gen_sheet(sheet_name))
  }

  db.activeSheetName = sheet_name

  await write_db(db)
}

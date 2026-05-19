import { gen_sheet } from '@/lib/gen_db'
import { get_authenticated_user_id } from '@/lib/get_authenticated_user_id'
import { is_supabase_configured } from '@/lib/is_supabase_configured'
import { read_db } from '@/lib/read_db'
import { update_supabase_active_sheet } from '@/lib/update_supabase_active_sheet'
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

  if (is_supabase_configured()) {
    const user_id = await get_authenticated_user_id()

    if (user_id !== null && sheet_exists) {
      await update_supabase_active_sheet(user_id, sheet_name)
      return
    }
  }

  await write_db(db)
}

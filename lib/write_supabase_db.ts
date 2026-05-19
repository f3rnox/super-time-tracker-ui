import { create_server_supabase_client } from '@/lib/create_server_supabase_client'
import { sync_supabase_sheet_entries } from '@/lib/sync_supabase_sheet_entries'
import { type TimeTrackerDB } from '@/lib/types'

interface SheetUpsertRow {
  user_id: string
  name: string
  active_entry_id: number | null
}

interface ExistingSheetRow {
  id: string
  name: string
}

/**
 * Persists the in-memory database to Supabase for the signed-in user.
 */
export async function write_supabase_db(
  db: TimeTrackerDB,
  user_id: string,
): Promise<void> {
  const supabase = await create_server_supabase_client()

  const { error: account_error } = await supabase.from('tracker_accounts').upsert(
    {
      user_id,
      active_sheet_name: db.activeSheetName,
      db_version: db.version,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (account_error !== null) {
    throw new Error(`Failed to save tracker account: ${account_error.message}`)
  }

  const { data: existing_sheet_rows, error: list_error } = await supabase
    .from('sheets')
    .select('id, name')
    .eq('user_id', user_id)

  if (list_error !== null) {
    throw new Error(`Failed to list sheets: ${list_error.message}`)
  }

  const existing_sheets = (existing_sheet_rows ?? []) as ExistingSheetRow[]
  const desired_sheet_names = new Set(db.sheets.map((sheet) => sheet.name))
  const sheet_ids_to_delete = existing_sheets
    .filter((sheet) => !desired_sheet_names.has(sheet.name))
    .map((sheet) => sheet.id)

  if (sheet_ids_to_delete.length > 0) {
    const { error: delete_error } = await supabase
      .from('sheets')
      .delete()
      .in('id', sheet_ids_to_delete)

    if (delete_error !== null) {
      throw new Error(`Failed to remove deleted sheets: ${delete_error.message}`)
    }
  }

  for (const sheet of db.sheets) {
    const sheet_row: SheetUpsertRow = {
      user_id,
      name: sheet.name,
      active_entry_id: sheet.activeEntryID,
    }

    const { data: upserted_sheet, error: sheet_error } = await supabase
      .from('sheets')
      .upsert(sheet_row, { onConflict: 'user_id,name' })
      .select('id')
      .single()

    if (sheet_error !== null) {
      throw new Error(`Failed to save sheet "${sheet.name}": ${sheet_error.message}`)
    }

    const sheet_id = (upserted_sheet as { id: string }).id

    await sync_supabase_sheet_entries(supabase, sheet_id, sheet)
  }
}

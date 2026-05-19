import { create_server_supabase_client } from '@/lib/create_server_supabase_client'
import { type TimeTrackerDB } from '@/lib/types'

interface SheetInsertRow {
  user_id: string
  name: string
  active_entry_id: number | null
}

interface EntryInsertRow {
  sheet_id: string
  id: number
  start_at: string
  end_at: string | null
  description: string
  tags: string[]
}

interface NoteInsertRow {
  sheet_id: string
  entry_id: number
  note_index: number
  noted_at: string
  text: string
}

/**
 * Replaces the user's cloud tracker data with the in-memory database.
 */
export async function write_supabase_db(
  db: TimeTrackerDB,
  user_id: string,
): Promise<void> {
  const supabase = await create_server_supabase_client()

  const { error: account_error } = await supabase.from('tracker_accounts').upsert({
    user_id,
    active_sheet_name: db.activeSheetName,
    db_version: db.version,
    updated_at: new Date().toISOString(),
  })

  if (account_error !== null) {
    throw new Error(`Failed to save tracker account: ${account_error.message}`)
  }

  const { data: existing_sheets, error: list_error } = await supabase
    .from('sheets')
    .select('id')
    .eq('user_id', user_id)

  if (list_error !== null) {
    throw new Error(`Failed to list sheets: ${list_error.message}`)
  }

  const existing_ids = (existing_sheets ?? []).map((row) => (row as { id: string }).id)

  if (existing_ids.length > 0) {
    const { error: delete_error } = await supabase
      .from('sheets')
      .delete()
      .in('id', existing_ids)

    if (delete_error !== null) {
      throw new Error(`Failed to clear sheets: ${delete_error.message}`)
    }
  }

  for (const sheet of db.sheets) {
    const sheet_insert: SheetInsertRow = {
      user_id,
      name: sheet.name,
      active_entry_id: sheet.activeEntryID,
    }

    const { data: inserted_sheet, error: sheet_error } = await supabase
      .from('sheets')
      .insert(sheet_insert)
      .select('id')
      .single()

    if (sheet_error !== null) {
      throw new Error(`Failed to save sheet "${sheet.name}": ${sheet_error.message}`)
    }

    const sheet_id = (inserted_sheet as { id: string }).id

    if (sheet.entries.length === 0) {
      continue
    }

    const entry_rows: EntryInsertRow[] = sheet.entries.map((entry) => ({
      sheet_id,
      id: entry.id,
      start_at: entry.start.toISOString(),
      end_at: entry.end === null ? null : entry.end.toISOString(),
      description: entry.description,
      tags: entry.tags,
    }))

    const { error: entries_error } = await supabase.from('entries').insert(entry_rows)

    if (entries_error !== null) {
      throw new Error(
        `Failed to save entries for "${sheet.name}": ${entries_error.message}`,
      )
    }

    const note_rows: NoteInsertRow[] = []

    for (const entry of sheet.entries) {
      entry.notes.forEach((note, note_index) => {
        note_rows.push({
          sheet_id,
          entry_id: entry.id,
          note_index,
          noted_at: note.timestamp.toISOString(),
          text: note.text,
        })
      })
    }

    if (note_rows.length === 0) {
      continue
    }

    const { error: notes_error } = await supabase.from('entry_notes').insert(note_rows)

    if (notes_error !== null) {
      throw new Error(
        `Failed to save notes for "${sheet.name}": ${notes_error.message}`,
      )
    }
  }
}

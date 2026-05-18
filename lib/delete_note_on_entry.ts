import { get_sheet } from '@/lib/get_sheet'
import { read_db } from '@/lib/read_db'
import { write_db } from '@/lib/write_db'

export interface DeleteNoteOnEntryArgs {
  note_timestamp: string
  sheet_name: string
  entry_id: number
}

/**
 * Removes a note from a time sheet entry by timestamp.
 */
export async function delete_note_on_entry(
  args: DeleteNoteOnEntryArgs,
): Promise<void> {
  const { entry_id, note_timestamp, sheet_name } = args
  const db = await read_db()
  const sheet = get_sheet(db, sheet_name)
  const entry = sheet.entries.find(({ id }) => id === entry_id)

  if (entry === undefined) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`)
  }

  const target_ms = new Date(note_timestamp).getTime()

  if (Number.isNaN(target_ms)) {
    throw new Error('Invalid note timestamp')
  }

  const note_index = entry.notes.findIndex(
    ({ timestamp }) => timestamp.getTime() === target_ms,
  )

  if (note_index === -1) {
    throw new Error('Note not found on entry')
  }

  entry.notes.splice(note_index, 1)
  await write_db(db)
}

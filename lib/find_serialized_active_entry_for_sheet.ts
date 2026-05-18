import { serialize_entry } from '@/lib/serialize_entry'
import { type SerializedEntry } from '@/lib/types/tracker_state'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Returns the running entry on a specific sheet, if one exists.
 */
export function find_serialized_active_entry_for_sheet(
  db: TimeTrackerDB,
  sheet_name: string,
): SerializedEntry | null {
  const sheet = db.sheets.find(({ name }) => name === sheet_name)

  if (sheet === undefined) {
    return null
  }

  const { activeEntryID, entries, name } = sheet

  if (activeEntryID === null) {
    return null
  }

  const entry = entries.find(({ id }) => id === activeEntryID)

  if (entry === undefined) {
    return null
  }

  return serialize_entry(entry, name, entry.end === null)
}

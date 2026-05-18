import { serialize_entry } from '@/lib/serialize_entry'
import { type SerializedEntry } from '@/lib/types/tracker_state'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Returns the running entry from any sheet, if one exists.
 */
export function find_serialized_active_entry(
  db: TimeTrackerDB,
): SerializedEntry | null {
  for (const sheet of db.sheets) {
    const { activeEntryID, entries, name } = sheet

    if (activeEntryID === null) {
      continue
    }

    const entry = entries.find(({ id }) => id === activeEntryID)

    if (entry !== undefined) {
      return serialize_entry(entry, name, entry.end === null)
    }
  }

  return null
}

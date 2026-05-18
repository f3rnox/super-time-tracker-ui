import { serialize_entry } from '@/lib/serialize_entry'
import { type SerializedEntry } from '@/lib/types/tracker_state'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Returns every running entry across all sheets, in sheet order.
 */
export function find_all_serialized_active_entries(
  db: TimeTrackerDB,
): SerializedEntry[] {
  const results: SerializedEntry[] = []

  for (const sheet of db.sheets) {
    const { activeEntryID, entries, name } = sheet

    if (activeEntryID === null) {
      continue
    }

    const entry = entries.find(({ id }) => id === activeEntryID)

    if (entry !== undefined && entry.end === null) {
      results.push(serialize_entry(entry, name, true))
    }
  }

  return results
}

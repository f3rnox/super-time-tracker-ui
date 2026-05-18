import { find_all_serialized_active_entries } from '@/lib/find_all_serialized_active_entries'
import { type SerializedEntry } from '@/lib/types/tracker_state'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Returns the first running entry from any sheet, if one exists.
 */
export function find_serialized_active_entry(
  db: TimeTrackerDB,
): SerializedEntry | null {
  return find_all_serialized_active_entries(db)[0] ?? null
}

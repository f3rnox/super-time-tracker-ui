import { entries_are_mergeable } from '@/lib/entries_are_mergeable'
import { type SerializedEntry } from '@/lib/types/tracker_state'

export type MergeEntryDirection = 'previous' | 'next'

export interface MergeableEntryNeighbors {
  previous: boolean
  next: boolean
}

/**
 * Returns which adjacent entries on a sheet can merge with the given entry.
 */
export function get_mergeable_entry_neighbors(
  entry: SerializedEntry,
  sheet_entries: SerializedEntry[],
): MergeableEntryNeighbors {
  const same_sheet = sheet_entries.filter(
    (candidate) => candidate.sheetName === entry.sheetName,
  )
  const sorted = [...same_sheet].sort((left, right) =>
    left.start.localeCompare(right.start),
  )
  const index = sorted.findIndex(
    (candidate) => candidate.id === entry.id && candidate.sheetName === entry.sheetName,
  )

  if (index < 0) {
    return { previous: false, next: false }
  }

  const previous_entry = index > 0 ? sorted[index - 1] : null
  const next_entry = index < sorted.length - 1 ? sorted[index + 1] : null

  return {
    previous:
      previous_entry !== null && entries_are_mergeable(previous_entry, entry),
    next: next_entry !== null && entries_are_mergeable(entry, next_entry),
  }
}

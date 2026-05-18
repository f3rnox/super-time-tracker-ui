import { type EntryListSort } from '@/lib/types/ui_preferences'
import { type SerializedEntry } from '@/lib/types/tracker_state'

/**
 * Sorts serialized entries for display in the entry list.
 */
export function sort_serialized_entries(
  entries: SerializedEntry[],
  sort: EntryListSort,
): SerializedEntry[] {
  const sorted = [...entries]

  switch (sort) {
    case 'oldest':
      return sorted.sort(
        (left, right) =>
          new Date(left.start).getTime() - new Date(right.start).getTime(),
      )
    case 'duration':
      return sorted.sort((left, right) => right.durationMs - left.durationMs)
    case 'description':
      return sorted.sort((left, right) => {
        const left_label = left.description.trim() || 'Untitled entry'
        const right_label = right.description.trim() || 'Untitled entry'

        return left_label.localeCompare(right_label)
      })
    case 'newest':
    default:
      return sorted.sort(
        (left, right) =>
          new Date(right.start).getTime() - new Date(left.start).getTime(),
      )
  }
}

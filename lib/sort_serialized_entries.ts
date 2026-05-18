import { type SerializedEntry } from '@/lib/types/tracker_state'

/**
 * Sorts entries by start time, newest first.
 */
export function sort_serialized_entries(
  entries: SerializedEntry[],
): SerializedEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
  )
}

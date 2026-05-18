import { type SerializedEntry } from '@/lib/types/tracker_state'

/**
 * Sums duration milliseconds across serialized entries.
 */
export function get_serialized_entries_total_ms(
  entries: SerializedEntry[],
): number {
  return entries.reduce((total, entry) => total + entry.durationMs, 0)
}

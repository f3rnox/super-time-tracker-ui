import { entry_matches_tag_filter } from '@/lib/entry_matches_tag_filter'
import { type SerializedEntry } from '@/lib/types/tracker_state'

/**
 * Returns entries that match all selected filter tags.
 */
export function filter_entries_by_tags(
  entries: SerializedEntry[],
  filter_tags: readonly string[],
): SerializedEntry[] {
  if (filter_tags.length === 0) {
    return entries
  }

  return entries.filter((entry) => entry_matches_tag_filter(entry, filter_tags))
}

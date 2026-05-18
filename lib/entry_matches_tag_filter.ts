import { tags_are_equal } from '@/lib/tags_are_equal'
import { type SerializedEntry } from '@/lib/types/tracker_state'

/**
 * Returns whether an entry includes every tag in the filter list.
 */
export function entry_matches_tag_filter(
  entry: SerializedEntry,
  filter_tags: readonly string[],
): boolean {
  if (filter_tags.length === 0) {
    return true
  }

  return filter_tags.every((filter_tag) =>
    entry.tags.some((entry_tag) => tags_are_equal(entry_tag, filter_tag)),
  )
}

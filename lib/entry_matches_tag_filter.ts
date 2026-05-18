import { tags_are_equal } from '@/lib/tags_are_equal'
import { type TagFilterMode } from '@/lib/types/ui_preferences'
import { type SerializedEntry } from '@/lib/types/tracker_state'

/**
 * Returns whether an entry matches the selected tag filter tags.
 */
export function entry_matches_tag_filter(
  entry: SerializedEntry,
  filter_tags: readonly string[],
  mode: TagFilterMode = 'all',
): boolean {
  if (filter_tags.length === 0) {
    return true
  }

  if (mode === 'any') {
    return filter_tags.some((filter_tag) =>
      entry.tags.some((entry_tag) => tags_are_equal(entry_tag, filter_tag)),
    )
  }

  return filter_tags.every((filter_tag) =>
    entry.tags.some((entry_tag) => tags_are_equal(entry_tag, filter_tag)),
  )
}

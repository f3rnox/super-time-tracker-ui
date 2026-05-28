import { entry_matches_tag_filter } from "@/lib/entry_matches_tag_filter";
import { type TagFilterMode } from "@/lib/types/ui_preferences";
import { type SerializedEntry } from "@/lib/types/tracker_state";

/**
 * Returns entries that match the selected filter tags.
 */
export function filter_entries_by_tags(
  entries: SerializedEntry[],
  filter_tags: readonly string[],
  mode: TagFilterMode = "all",
): SerializedEntry[] {
  if (filter_tags.length === 0) {
    return entries;
  }

  return entries.filter((entry) =>
    entry_matches_tag_filter(entry, filter_tags, mode),
  );
}
